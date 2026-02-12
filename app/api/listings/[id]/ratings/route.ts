import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reviews = await prisma.review.findMany({
      where: { subscriptionId: id },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });

    const avgRating = await prisma.review.aggregate({
      where: { subscriptionId: id },
      _avg: { score: true },
      _count: true,
    });

    return NextResponse.json({
      ratings: reviews,
      avgRating: avgRating._avg.score ?? 0,
      ratingCount: avgRating._count,
    });
  } catch (error) {
    console.error("Ratings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const { score, comment } = body;

    if (score == null || score < 1 || score > 5) {
      return NextResponse.json(
        { error: "Score must be between 1 and 5" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        members: { where: { status: "active" } },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const canRate =
      subscription.ownerId === user.id ||
      subscription.members.some((m) => m.userId === user.id);

    if (!canRate) {
      return NextResponse.json(
        { error: "You must be a member or owner to rate this listing" },
        { status: 403 }
      );
    }

    const review = await prisma.review.upsert({
      where: {
        subscriptionId_userId: { subscriptionId: id, userId: user.id },
      },
      create: {
        subscriptionId: id,
        userId: user.id,
        score: Number(score),
        comment: comment?.trim() || null,
      },
      update: {
        score: Number(score),
        comment: comment?.trim() || null,
      },
      include: {
        user: { select: { email: true } },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Ratings POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
