// apolloServer.ts
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';

interface MyContext {
  prisma: any; // Puedes reemplazar `any` con el tipo específico de Prisma
  session: any; // Puedes reemplazar `any` con el tipo específico de la sesión
}

// Variable para almacenar la instancia única de Apollo Server
let apolloServerInstance: ApolloServer<MyContext> | null = null;

// Función para obtener una instancia única de Apollo Server
export function getApolloServer(): ApolloServer<MyContext> {
  if (!apolloServerInstance) {
    console.log("Creando nueva instancia de Apollo Server...");
    apolloServerInstance = new ApolloServer<MyContext>({
      typeDefs,
      resolvers,
    });
  }
  return apolloServerInstance;
}