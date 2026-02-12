import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const [owned, memberOf] = await Promise.all([
      prisma.subscription.findMany({
        where: { ownerId: user.id },
        include: {
          members: {
            where: { status: "active" },
            include: { user: { select: { email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subscription.findMany({
        where: {
          members: { some: { userId: user.id, status: "active" } },
        },
        include: {
          owner: { select: { email: true } },
          members: {
            where: { status: "active" },
            include: { user: { select: { email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ owned, memberOf });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("User listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
