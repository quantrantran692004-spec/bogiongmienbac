import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ savedListingIds: [], listings: [] }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const idsOnly = searchParams.get("idsOnly") === "true";

    if (idsOnly) {
      const saved = await prisma.savedListing.findMany({
        where: { userId: user.id },
        select: { listingId: true },
      });
      return NextResponse.json({
        savedListingIds: saved.map((s) => s.listingId),
      });
    }

    const savedRecords = await prisma.savedListing.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          include: {
            seller: {
              select: { id: true, phone: true, fullName: true, zaloNumber: true, role: true },
            },
            media: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Lọc bỏ những tin đã bị xóa vật lý hoặc không còn tồn tại
    const validListings = savedRecords
      .map((item) => item.listing)
      .filter((listing) => listing !== null && listing !== undefined);

    return NextResponse.json({
      savedListingIds: validListings.map((l) => l.id),
      listings: validListings,
    });
  } catch (error) {
    console.error("Favorites GET error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách tin đã lưu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để lưu tin yêu thích" }, { status: 401 });
    }

    const body = (await request.json()) as { listingId?: string };
    const listingId = body.listingId?.trim();

    if (!listingId) {
      return NextResponse.json({ error: "Thiếu mã tin bán bò" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Tin bán bò không tồn tại" }, { status: 404 });
    }

    const saved = await prisma.savedListing.upsert({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        listingId,
      },
    });

    return NextResponse.json({
      success: true,
      saved: true,
      listingId: saved.listingId,
      message: "Đã lưu tin vào danh sách yêu thích của bạn",
    });
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json({ error: "Lỗi khi lưu tin bán" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId")?.trim();

    if (!listingId) {
      return NextResponse.json({ error: "Thiếu mã tin cần bỏ lưu" }, { status: 400 });
    }

    await prisma.savedListing.deleteMany({
      where: {
        userId: user.id,
        listingId,
      },
    });

    return NextResponse.json({
      success: true,
      saved: false,
      listingId,
      message: "Đã bỏ lưu tin thành công",
    });
  } catch (error) {
    console.error("Favorites DELETE error:", error);
    return NextResponse.json({ error: "Lỗi khi bỏ lưu tin" }, { status: 500 });
  }
}
