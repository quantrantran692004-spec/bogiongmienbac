import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { PriceType, ListingStatus, ListingVisibility } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const currentUser = await getSessionUser();

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, phone: true, fullName: true, zaloNumber: true, role: true },
        },
        media: {
          orderBy: { sortOrder: "asc" },
        },
        priceHistories: {
          include: {
            changedByUser: {
              select: { fullName: true, phone: true },
            },
          },
          orderBy: { changedAt: "desc" },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Không tìm thấy tin bán bò này" }, { status: 404 });
    }

    // Bảo vệ quyền riêng tư: Nếu tin PRIVATE, chỉ Admin hoặc chính chủ sở hữu mới xem được
    if (listing.visibility === "PRIVATE") {
      const isOwner = currentUser?.id === listing.sellerId;
      const isAdmin = currentUser?.role === "ADMIN";
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Tin này đang ở chế độ riêng tư chờ quản trị viên duyệt" }, { status: 403 });
      }
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Listing detail GET error:", error);
    return NextResponse.json({ error: "Lỗi tải chi tiết tin" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const currentUser = await getSessionUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Không tìm thấy tin bán bò" }, { status: 404 });
    }

    const isOwner = currentUser.id === listing.sellerId;
    const isAdmin = currentUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Bạn không có quyền chỉnh sửa tin này" }, { status: 403 });
    }

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      breed?: string;
      quantity?: number;
      weightAvgKg?: number;
      priceType?: PriceType;
      priceAmount?: number;
      province?: string;
      district?: string;
      status?: ListingStatus;
      visibility?: ListingVisibility;
    };

    // Kiểm tra nếu có thay đổi giá -> ghi vào bảng lịch sử giá
    const hasPriceChange =
      (body.priceAmount !== undefined && body.priceAmount !== listing.priceAmount) ||
      (body.priceType !== undefined && body.priceType !== listing.priceType);

    if (hasPriceChange) {
      await prisma.priceHistory.create({
        data: {
          listingId: listing.id,
          oldPrice: listing.priceAmount,
          newPrice: body.priceAmount !== undefined ? body.priceAmount : listing.priceAmount,
          oldPriceType: listing.priceType,
          newPriceType: body.priceType || listing.priceType,
          changedByUserId: currentUser.id,
        },
      });
    }

    // Chỉ Admin mới được phép tự do đổi visibility thành PUBLIC
    let newVisibility = listing.visibility;
    if (body.visibility !== undefined) {
      if (isAdmin) {
        newVisibility = body.visibility;
      } else if (body.visibility === "PRIVATE") {
        newVisibility = "PRIVATE";
      }
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title.trim() : undefined,
        description: body.description !== undefined ? body.description?.trim() : undefined,
        breed: body.breed !== undefined ? body.breed.trim() : undefined,
        quantity: body.quantity !== undefined ? Math.max(1, body.quantity) : undefined,
        weightAvgKg: body.weightAvgKg !== undefined ? Number(body.weightAvgKg) : undefined,
        priceType: body.priceType || undefined,
        priceAmount: body.priceAmount !== undefined ? (body.priceAmount ? Number(body.priceAmount) : null) : undefined,
        province: body.province !== undefined ? body.province.trim() : undefined,
        district: body.district !== undefined ? body.district?.trim() : undefined,
        status: body.status || undefined,
        visibility: newVisibility,
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error("Listing PUT error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật tin bán" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const currentUser = await getSessionUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Không tìm thấy tin bán" }, { status: 404 });
    }

    const isOwner = currentUser.id === listing.sellerId;
    const isAdmin = currentUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Bạn không có quyền xóa tin này" }, { status: 403 });
    }

    await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa tin bán bò thành công" });
  } catch (error) {
    console.error("Listing DELETE error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa tin bán" }, { status: 500 });
  }
}
