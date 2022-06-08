import {
  redisSessionPrefix,
  userSessionIdPrefix,
} from '../../constants';
import { redis } from '../../redis';
import { ResolverMap } from '../../types/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => 'dummy',
  },
  Mutation: {
    logout: async (_, __, { session }) => {
      const { userId } = session;
      if (userId) {
        const sessionIds = await redis.lrange(
          `${userSessionIdPrefix}${userId}`,
          0,
          -1
        );

        const promises = [];
        for (let i = 0; i < sessionIds.length; i += 1) {
          promises.push(
            redis.del(
              `${redisSessionPrefix}${sessionIds[1]}`
            )
          );
        }
        await Promise.all(promises);
        return true;
      }

      return false;
    },
  },
};
