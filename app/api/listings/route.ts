import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceName = searchParams.get("service");
    const includeFull = searchParams.get("include") === "full";

    const where: Prisma.SubscriptionWhereInput = {
      availableSlots: { gt: 0 },
      status: "active",
    };

    if (serviceName) {
      where.serviceName = serviceName;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        owner: { select: { email: true } },
        members: includeFull
          ? { where: { status: "active" }, include: { user: { select: { email: true } } } }
          : false,
        reviews: includeFull
          ? { include: { user: { select: { email: true } } } }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    const withAvgRating = await Promise.all(
      subscriptions.map(async (sub) => {
        const avg = await prisma.review.aggregate({
          where: { subscriptionId: sub.id },
          _avg: { score: true },
          _count: true,
        });
        return {
          ...sub,
          avgRating: avg._avg.score ?? 0,
          ratingCount: avg._count,
        };
      })
    );

    return NextResponse.json(withAvgRating);
  } catch (error) {
    console.error("Listings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { serviceName, totalSlots, availableSlots, monthlyPrice, description } =
      body;

    if (!serviceName || totalSlots == null || monthlyPrice == null) {
      return NextResponse.json(
        { error: "Missing required fields: serviceName, totalSlots, monthlyPrice" },
        { status: 400 }
      );
    }

    const slots = availableSlots ?? totalSlots;
    if (slots > totalSlots || totalSlots < 1) {
      return NextResponse.json(
        { error: "Invalid slot configuration" },
        { status: 400 }
      );
    }

    const pricePerSlot = Number(monthlyPrice) / Number(totalSlots);

    const subscription = await prisma.subscription.create({
      data: {
        serviceName: String(serviceName).trim(),
        totalSlots: Number(totalSlots),
        availableSlots: Number(slots),
        pricePerSlot,
        monthlyPrice: Number(monthlyPrice),
        description: description?.trim() || null,
        ownerId: user.id,
      },
      include: {
        owner: { select: { email: true } },
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Listings POST error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
