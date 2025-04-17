// src/app/api/graphql/route.ts

/*import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { getApolloServer } from "@/lib/apolloServer";
import { getContextFromRequest } from "@/lib/graphql/getContextFromRequest";
import { NextRequest } from "next/server";

const apolloServer = await getApolloServer();

function internalHandler(request: NextRequest) {
  return startServerAndCreateNextHandler(apolloServer, {
    context: () => getContextFromRequest(request),
  })(request);
}


export const GET = internalHandler;
export const POST = internalHandler;
*/
// route.ts
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { getApolloServer } from '@/lib/apolloServer'; // Importar la función singleton
import { getContextFromRequest } from '@/lib/graphql/getContextFromRequest';

// Obtener la instancia única de Apollo Server
const apolloServer = getApolloServer();

// Crear el handler para GraphQL usando startServerAndCreateNextHandler
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req: any) => {
    // Generar el contexto usando getContextFromRequest
    return getContextFromRequest(req);
  },
});

// Exportar el handler para GET y POST
export { handler as GET, handler as POST };