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
  if (!apolloServer) {
    apolloServer = new ApolloServer<MyContext>({
      typeDefs,
      resolvers,
    });
  }

  await apolloServer.start();


  return apolloServer;
}
