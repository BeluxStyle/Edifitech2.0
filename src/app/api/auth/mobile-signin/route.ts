// app/api/auth/mobile-signin/route.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Parsear el cuerpo de la solicitud
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Correo electrónico y contraseña son requeridos' }),
        { status: 400 }
      );
    }

    // Buscar al usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(password, user?.password))) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), { status: 401 });
    }

    // Generar un token JWT compatible con NextAuth
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.name || 'user',
      },
      process.env.NEXTAUTH_SECRET as string,
      { expiresIn: '30d' }
    );

    console.log('Login correcto');

    // Devolver el token y los datos del usuario al cliente
    return new Response(
      JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.name || 'user',
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}