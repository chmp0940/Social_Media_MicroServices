const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;

const EXCHANGE_NAME = "facebook_events";

async function connectRabbitMq() {
  try {
    if (!process.env.RABBITMQ_URL) {
      logger.warn("RABBITMQ_URL not found, skipping RabbitMQ connection");
      return null;
    }

    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("connected to rabbit m1");
    return channel;
  } catch (error) {
    logger.error("Error connectiong to rabbit mq", error);
  }
}

// seee in server we have used this function by giving routing key same as that we have given while publishing
async function consumeEvent(routingKey, callback) {
  // here in assertQueue we declare a queue
  const q = await channel.assertQueue("", { exclusive: true });

  // ** bind queue connects the queue with the exchange that we have created at publisher end

  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

  channel.consume(q.queue, (msg) => {
    const content = JSON.parse(msg.content.toString());
    callback(content);
    channel.ack(msg);
  });
  logger.info(`subscirbed to event: ${routingKey}`);
}

module.exports = { connectRabbitMq, consumeEvent };
