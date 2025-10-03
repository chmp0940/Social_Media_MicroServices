require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const routes = require("./routes/identity-service");
const errorHandler = require("./middlewares/errorHandler");
const PORT = process.env.PORT || 3001;

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to mongodb");
  })
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

// middleware

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Received body , ${req.body} `);
  next();
});

// DDos protection and ratelimiting

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1, // ** 10 req in 1 second
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    });
});

// IP based rate limitng for sensitive endpoints

const sensitiveEndPointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// apply this sensitive endpoints limites to routes
app.use("/api/auth/register", sensitiveEndPointsLimiter);

// Routes
app.use("/api/auth", routes);

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service running on port ${PORT}`);
});

//unhandlerd promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("unhandled Rejection at", promise, "reason:", reason);
});
