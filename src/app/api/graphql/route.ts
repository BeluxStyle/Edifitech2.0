// In your route.ts file
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { getApolloServer } from '@/lib/apolloServer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Create Apollo Server instance
const apolloServer = getApolloServer();

// Create the handler with proper typing
const createHandler = () => {
  return startServerAndCreateNextHandler(apolloServer, {
    context: async (req) => {
      // Try to get NextAuth session
      let session = null;
      session = await getServerSession(authOptions);
      
      // If no NextAuth session, check for JWT token in header
      let mobileUser = null;
      
      if (!session) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          try {
            // Verify JWT token
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
            
            // Get user based on token
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
              expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour expiration
            };
          } catch (error) {
            console.error('Error verifying mobile token:', error);
          }
        }
      }
      
      // Return context with web session, mobile user, prisma and req
      return { 
        prisma, 
        session,
        mobileUser,
        req
      };
    },
  });
};

// Export GET and POST handlers with proper typing for App Router
export async function GET(request: NextRequest) {
  const handler = createHandler();
  return handler(request);
}

export async function POST(request: NextRequest) {
  const handler = createHandler();
  return handler(request);
}