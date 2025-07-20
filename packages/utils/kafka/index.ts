import {Kafka} from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers: ['localhost:9094'],

});

