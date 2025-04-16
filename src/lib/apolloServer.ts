// src/lib/apolloServer.ts

import { ApolloServer } from "@apollo/server";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";
import { Session } from "next-auth";

interface MyContext {
  session: Session
}
let apolloServer: ApolloServer<MyContext> | null = null;

export async function getApolloServer(): Promise<ApolloServer<MyContext>> {
  if (!apolloServer) {
    apolloServer = new ApolloServer<MyContext>({
      typeDefs,
      resolvers,
    });
    await apolloServer.start(); // solo se llama una vez
  }

  return apolloServer;
}




