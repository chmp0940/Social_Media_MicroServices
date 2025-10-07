require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const Redis = require("ioredis");

const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");
const { connectRabbitMq, consumeEvent } = require("./utils/rabbitMq");
const searchRouter = require("./routes/search-routes");
const { hanldePostCreated, handlePostDeleted } = require("./eventHandlers/search-event-handlers");

const app = express();
const PORT = process.env.PORT || 3004;

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

// implement ip based rate limitngn for sensitvve end points

// app.use();

//**  implement redis cache inseraching pass redis clientt as part of your req
app.use("/api/search", searchRouter);

app.use(errorHandler);
async function startServer() {
  try {
    await connectRabbitMq();
    // consume the events or subcribe tot the events
    await consumeEvent("post.created", hanldePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);
    app.listen(PORT, () => {
      logger.info(`Search Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error, "failed to start serach services");
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (reason, promise) => {
  logger.error("unhandled Rejection at", promise, "reason:", reason);
});
