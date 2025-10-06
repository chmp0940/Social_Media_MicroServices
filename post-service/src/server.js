require("dotenv").config();
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const postRoutes = require("./routes/post-routes");
const errorHandler = require("./middlewares/errorHandler");
const logger=require('./utils/logger');
// const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
// const { rateLimit } = require("express-rate-limit");
// const { RedisStore } = require("rate-limit-redis");


const app=express();
const PORT=process.env.PORT||3002


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to mongodb");
  })
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);


// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Received body , ${req.body} `);
  next();
});


// const rateLimiter = new RateLimiterRedis({
//   storeClient: redisClient,
//   keyPrefix: "middleware",
//   points: 10,
//   duration: 1, // ** 10 req in 1 second
// });

// app.use((req, res, next) => {
//   rateLimiter
//     .consume(req.ip)
//     .then(() => next())
//     .catch(() => {
//       logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
//       res.status(429).json({
//         success: false,
//         message: "Too many requests",
//       });
//     });
// });

// const sensitiveEndPointsLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 50,
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
//     res.status(429).json({
//       success: false,
//       message: "Too many requests",
//     });
//   },
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.call(...args),
//   }),
// });

// app.use("/api/post/create", sensitiveEndPointsLimiter);

// routes also pass redis clinet to routes
app.use('/api/posts',(req,res,next)=>{
  req.redisClient=redisClient;
  next();
},postRoutes)

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service running on port ${PORT}`);
});

//unhandlerd promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("unhandled Rejection at", promise, "reason:", reason);
});


