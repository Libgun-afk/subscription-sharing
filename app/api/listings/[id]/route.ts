import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        owner: { select: { email: true } },
        members: {
          where: { status: "active" },
          include: { user: { select: { email: true } } },
        },
        reviews: {
          include: { user: { select: { email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const avgRating = await prisma.review.aggregate({
      where: { subscriptionId: id },
      _avg: { score: true },
      _count: true,
    });

    return NextResponse.json({
      ...subscription,
      ratings: subscription.reviews,
      avgRating: avgRating._avg.score ?? 0,
      ratingCount: avgRating._count,
    });
  } catch (error) {
    console.error("Listing GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}
