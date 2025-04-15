// src/app/api/graphql/route.ts

import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { getApolloServer } from "@/lib/apolloServer";
import { getContextFromRequest } from "@/lib/graphql/getContextFromRequest";
import { NextRequest } from "next/server";

async function internalHandler(request: NextRequest) {
  const apolloServer = await getApolloServer();

  return startServerAndCreateNextHandler(apolloServer, {
    context: () => getContextFromRequest(request),
  })(request);
}

export const GET = internalHandler;
export const POST = internalHandler;
