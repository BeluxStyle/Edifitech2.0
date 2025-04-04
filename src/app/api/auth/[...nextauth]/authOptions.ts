import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { SessionStrategy } from "next-auth/core/types";


export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        return isValid ? user : null;
      }
    })
  ],
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Buscar el usuario en la base de datos
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { role: true },
        });
    
        if (!dbUser) {
          // Si el usuario no existe, asignarle el rol "user"
          const defaultRole = await prisma.rol.findUnique({
            where: { name: "user" },
          });
    
          if (!defaultRole) {
            const newRole = await prisma.rol.create({ data: { name: "user" } });
            throw new Error("El rol 'user' no existe en la base de datos, se ha creado con id.");
          }
    
          // Crear el nuevo usuario
          dbUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              image: user.image,
              role: { connect: { id: defaultRole.id } }, // Asignamos el rol "user"
              accounts: {
                create: {
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                  type: account.type,
                },
              },
            },
            include: { role: true }, // Incluir el rol en la respuesta
          });
        }
    
        // Devolver el usuario encontrado o creado
        return dbUser;
      }
    
      // Para otros proveedores (como credenciales), devolver true
      return true;
    },    
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, email: true, role: true }, // Solo traemos lo necesario
        });
    
        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email; // Guardamos email porque puede ser útil en otros lados
          token.role = dbUser.role;
    
          await prisma.user.update({
            where: { id: token.id },
            data: { lastLogin: new Date(), isOnline: true },
          });
        }
      }
    
      return token;
    },
    
    async session({ session, token }) {
      if (session.user && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true }, // Traemos el rol actualizado de la DB
        });
    
        if (dbUser) {
          session.user.role = dbUser.role; // Actualizamos el rol en la sesión
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/`; // Redirigir a la página principal tras el login
    },
  }
};