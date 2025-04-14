// En tu archivo route.ts
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { getApolloServer } from '@/lib/apolloServer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Crear instancia de Apollo Server
const apolloServer = getApolloServer();

// Definir el handler para GraphQL
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => {
    // Intentar obtener la sesión de NextAuth
    let session = null;
    session = await getServerSession(authOptions);
    
    // Si no hay sesión de NextAuth, verificar si hay un token JWT en el encabezado
    let mobileUser = null;
    
    if (!session) {
      const authHeader = req.headers.get('authorization');
      console.log('Cookies:', req.headers.get('cookie'));
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          // Verificar el token JWT
          const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
          
          // Obtener el usuario según el token
          mobileUser = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: { role: true }
          });
          session = {
            user: { 
              id: mobileUser.id,
              name: mobileUser.name,
              email: mobileUser.email,
              image: mobileUser.image,
              role: mobileUser.role.name,
            },
            expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora de expiración
          };
        } catch (error) {
          console.error('Error al verificar token móvil:', error);
        }
      }
    }
    console.log('Session:', session);
    console.log('Mobile User:', mobileUser);
    
    // Devolver el contexto con la sesión web, el usuario móvil, prisma y req/res
    return { 
      prisma, 
      session,
      mobileUser,
      req, 
      res 
    };
  },
});

// Exportar el handler para GET y POST
export { handler as GET, handler as POST };