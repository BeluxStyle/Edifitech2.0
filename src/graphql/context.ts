// graphql/context.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '../app/api/auth/[...nextauth]/authOptions';
import { Session } from 'next-auth';
import { NextRequest } from 'next/server';

interface MyContext {
  session: Session | null;
}

export const createContext = async (req: NextRequest): Promise<MyContext> => {
  // Obtener la sesión del usuario
  const session = await getServerSession(authOptions);

  // Devolver el contexto con la sesión
  return { session };
};