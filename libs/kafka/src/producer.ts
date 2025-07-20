import { producer } from './kafka';
import { KafkaTopic } from './topics';

export async function publishEvent(topic: KafkaTopic, event: object) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(event) }],
  });
  console.log(`Event published to ${topic}:`, event);
}
