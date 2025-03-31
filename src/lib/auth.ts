import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

// Para usar en client components
export { useSession } from 'next-auth/react';