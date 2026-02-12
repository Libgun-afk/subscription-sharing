import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.subscription.findMany({
      where: { availableSlots: { gt: 0 }, status: "active" },
      select: { serviceName: true },
      distinct: ["serviceName"],
      orderBy: { serviceName: "asc" },
    });

    const names = services.map((s) => s.serviceName);
    return NextResponse.json(names);
  } catch (error) {
    console.error("Services GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
