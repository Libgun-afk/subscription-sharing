import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        members: { where: { status: "active" } },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (subscription.ownerId === user.id) {
      return NextResponse.json(
        { error: "Cannot join your own listing" },
        { status: 400 }
      );
    }

    const alreadyMember = subscription.members.some((m) => m.userId === user.id);
    if (alreadyMember) {
      return NextResponse.json(
        { error: "Already a member of this subscription" },
        { status: 400 }
      );
    }

    if (subscription.availableSlots < 1) {
      return NextResponse.json(
        { error: "No available slots" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.subscriptionMember.create({
        data: {
          subscriptionId: id,
          userId: user.id,
        },
      }),
      prisma.subscription.update({
        where: { id },
        data: { availableSlots: { decrement: 1 } },
      }),
    ]);

    const updated = await prisma.subscription.findUnique({
      where: { id },
      include: {
        owner: { select: { email: true } },
        members: {
          where: { status: "active" },
          include: { user: { select: { email: true } } },
        },
        reviews: { include: { user: { select: { email: true } } } },
      },
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const avg = await prisma.review.aggregate({
      where: { subscriptionId: id },
      _avg: { score: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      listing: {
        ...updated,
        ratings: updated.reviews,
        avgRating: avg._avg.score ?? 0,
        ratingCount: avg._count,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Join error:", error);
    return NextResponse.json(
      { error: "Failed to join subscription" },
      { status: 500 }
    );
  }
}
