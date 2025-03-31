import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { getApolloServer } from '@/lib/apolloServer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

// Crear instancia de Apollo Server
const apolloServer = getApolloServer();

// Definir el handler para GraphQL
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req: any) => {
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Authentication required');
    }

    // Devolver el contexto con Prisma y la sesión
    return { prisma, session };
  },
});

// Exportar el handler para GET y POST
export { handler as GET, handler as POST };