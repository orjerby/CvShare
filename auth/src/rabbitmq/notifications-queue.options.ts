export const options = {
    urls: [
        `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbitmq:5672`,
    ],
    queue: "notifications_queue",
    noAck: false,
    queueOptions: {
        durable: false,
    },
};
