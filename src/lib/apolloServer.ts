// src/lib/apolloServerInstance.ts
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";

// Declaración global para mantener el estado entre recargas
declare global {
  var apolloServer: any;
  var isApolloServerStarted: boolean;
}

// Inicializar las variables globales si no existen
global.apolloServer = global.apolloServer || null;
global.isApolloServerStarted = global.isApolloServerStarted || false;

// Crear la instancia del servidor solo si no existe
if (!global.apolloServer) {
  global.apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
}

// Solo iniciar el servidor una vez
if (!global.isApolloServerStarted) {
  (async () => {
    await global.apolloServer.start();
    global.isApolloServerStarted = true;
    console.log("Apollo Server started successfully");
  })();
}

// Exportar la instancia ya iniciada
export const apolloServer = global.apolloServer;