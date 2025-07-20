
import { consumer } from './kafka';
import { KafkaTopic } from './topics';

export async function subscribeToTopic(
  topic: KafkaTopic,
  handler: (event: any) => void
) {
  await consumer.subscribe({ topic, fromBeginning: false });
  console.log(`Subscribed to topic: ${topic}`);

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const value = message.value?.toString();
      if (value) {
        try {
          const event = JSON.parse(value);
          console.log(`Event received on ${topic}:`, event);
          handler(event);
        } catch (err) {
          console.error('Failed to parse event', err);
        }
      }
    },
  });
}
