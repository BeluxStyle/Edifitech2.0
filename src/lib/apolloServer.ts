import { ApolloServer } from '@apollo/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { Session } from 'next-auth';

interface MyContext {
  session: Session
}

let apolloServer: ApolloServer<MyContext>;

export function getApolloServer() {
  if (!apolloServer) {
    apolloServer = new ApolloServer<MyContext>({
      typeDefs,
      resolvers,
    });
  }
  return apolloServer;
}