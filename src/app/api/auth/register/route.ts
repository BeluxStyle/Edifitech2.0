import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();
  

  try {
    // Verificar si el email ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Obtener el rol "user"
    const userRole = await prisma.rol.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      return NextResponse.json(
        { message: 'El rol "user" no existe en la base de datos' },
        { status: 500 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario con el rol "user"
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: { connect: { id: userRole.id } }, // Asigna el rol "user"
      },
    });
    console.log( "🎂usuario se registro", newUser)

    return NextResponse.json(
      { message: 'Usuario registrado exitosamente', userId: newUser.id },
      { status: 201 }
    );
  } catch (error: any) {
    // Verificar si el error tiene un mensaje o no
    const errorMessage = error?.message || 'Error en el servidor';
    console.error('Error al registrar usuario:', errorMessage);
  
    // Siempre devolver un objeto con un mensaje
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
