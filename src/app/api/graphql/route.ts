// src/app/api/graphql/route.ts
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { apolloServer } from "@/lib/apolloServer";
import { NextRequest } from "next/server";
import { getContextFromRequest } from "@/lib/graphql/getContextFromRequest";

// Crear un handler que use el servidor ya iniciado
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req: NextRequest) => getContextFromRequest(req)
});

export const GET = handler;
export const POST = handler;