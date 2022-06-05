import { ResolverMap } from '../../types/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => 'dummy',
  },
  Mutation: {
    logout: (_, __, { session }) =>
      session.destroy(function (err: any) {
        if (err) {
          console.log('logout error: ', err);
        }
      }),
  },
};
