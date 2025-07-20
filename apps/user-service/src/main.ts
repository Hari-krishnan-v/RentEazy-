
import {initKafka, subscribeToTopic, KafkaTopics, EventTypes, publishEvent} from '../../../libs/kafka/src';


import {prisma} from "../../../libs/prisma";

async function startUserConsumer() {
  await subscribeToTopic(KafkaTopics.USER_REQUESTS, async (event) => {
    if (event.type === EventTypes.USER_CREATE_REQUEST) {
      const { userId, data } = event;
      await prisma.userProfile.create({
        data: {
          user: {
            connect: { id: userId },
          },
          ...data,
        },
      });


      await publishEvent(KafkaTopics.USER_EVENTS, {
        type: EventTypes.USER_UPDATED,
        userId,
        timestamp: new Date().toISOString(),
      });


      console.log('Profile created successfully:', event);
    }
    if (event.type === EventTypes.USER_DELETE_REQUEST) {
      const { userId } = event;
      await prisma.userProfile.deleteMany({
        where: {
          userId: userId,
        },
      });

      await publishEvent(KafkaTopics.USER_EVENTS, {
        type: EventTypes.USER_DELETED,
        userId,
        timestamp: new Date().toISOString(),
      });

      console.log('User profile deleted successfully:', event);
    }
    if (event.type === EventTypes.USER_UPDATE_REQUEST) {
      const { userId, data } = event;
      await prisma.userProfile.updateMany({
        where: {
          userId: userId,
        },
        data: {
          ...data,
        },
      });

      await publishEvent(KafkaTopics.USER_EVENTS, {
        type: EventTypes.USER_UPDATED,
        userId,
        timestamp: new Date().toISOString(),
      });

      console.log('User profile updated successfully:', event);
    }
  });
}

(async () => {
  await initKafka();
  await startUserConsumer();
  console.log('User service consumer started and listening for events...');
})();
