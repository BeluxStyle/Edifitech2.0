import { ApolloServer } from '@apollo/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { Session } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';

interface MyContext {
  session: Session | null;
  req: NextApiRequest;
  res: NextApiResponse;
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