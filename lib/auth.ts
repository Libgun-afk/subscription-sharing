import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) return null;

  let user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email!,
      },
    });
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
