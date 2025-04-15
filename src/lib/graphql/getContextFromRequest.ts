// src/lib/graphql/getContextFromRequest.ts

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { User } from "@edifitech-graphql/index";

type MyContext = {
  prisma: typeof prisma;
  session: any;
  mobileUser: User | null;
  req: NextRequest;
};

export async function getContextFromRequest(request: NextRequest): Promise<MyContext> {
  let session = await getServerSession(authOptions);
  let mobileUser: User | null = null;

  const authHeader = request.headers.get("authorization");

  if (!session && authHeader?.startsWith("Bearer ")) {
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
    } catch (err) {
      console.error("Error verifying mobile token:", err);
    }
  }

  return {
    prisma,
    session,
    mobileUser,
    req: request,
  };
}
