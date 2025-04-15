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

let apolloServer: ApolloServer<MyContext> | null = null;

export async function getApolloServer(): Promise<ApolloServer<MyContext>> {
  console.log('getApolloServer called');
  if (!apolloServer) {
    console.log('Creating a new ApolloServer instance');
    apolloServer = new ApolloServer<MyContext>({
      typeDefs,
      resolvers,
    });
    console.log('Starting ApolloServer');
    await apolloServer.start();
    console.log('ApolloServer started');
  }

  return apolloServer;
}
