import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'renteazy',
  brokers: ['localhost:9094'],
});


export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'renteazy-group' });

export async function initKafka() {
  await producer.connect();
  await consumer.connect();
  console.log('Kafka connected!');
}
