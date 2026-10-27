import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ListingVisibility, ListingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const visibility = searchParams.get("visibility") as ListingVisibility | null;
    const status = searchParams.get("status") as ListingStatus | null;
    const search = searchParams.get("search")?.trim() || "";

    const where: Record<string, unknown> = {};

    if (visibility) {
      where.visibility = visibility;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { breed: { contains: search } },
        { province: { contains: search } },
        { seller: { phone: { contains: search } } },
        { seller: { fullName: { contains: search } } },
      ];
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        seller: {
          select: { id: true, phone: true, fullName: true, zaloNumber: true, role: true },
        },
        media: {
          orderBy: { sortOrder: "asc" },
        },
        priceHistories: {
          orderBy: { changedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Admin listings GET error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách quản trị" }, { status: 500 });
  }
}
