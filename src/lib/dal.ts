import "server-only";
import { cache } from "react";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to fetch user from DB:", error);
    // Fallback to session data if DB query fails momentarily
    return {
      id: session.userId,
      name: session.name || "User",
      email: session.email,
      createdAt: new Date(),
    };
  }
});
