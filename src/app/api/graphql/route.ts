import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { getApolloServer } from '@/lib/apolloServer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export async function handler(request: NextRequest) {
  const apolloServer = await getApolloServer(); // <--- ahora sí, de forma segura y async

  return startServerAndCreateNextHandler(apolloServer, {
    context: async (req) => {
      let session = await getServerSession(authOptions);
      let mobileUser = null;

      if (!session) {
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          try {
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
            mobileUser = await prisma.user.findUnique({
              where: { id: (decoded as any).id },
              include: { role: true },
            });

            if (mobileUser) {
              session = {
                user: {
                  id: mobileUser.id,
                  name: mobileUser.name,
                  email: mobileUser.email,
                  image: mobileUser.image,
                  role: mobileUser.role.name,
                },
                expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              };
            }
          } catch (error) {
            console.error('Error verifying mobile token:', error);
          }
        }
      }

      return {
        prisma,
        session,
        mobileUser,
        req,
      };
    },
  })(request);
}

export const GET = handler;
export const POST = handler;
