import "server-only";
import { cache } from "react";
import { verifySession } from "@/lib/session";

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session?.userId) return null;

  return {
    id: session.userId,
    name: session.name || "User",
    email: session.email,
  };
});
