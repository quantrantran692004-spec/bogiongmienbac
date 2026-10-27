import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ListingVisibility, ListingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = (await request.json()) as {
      action?: "approve" | "reject" | "status" | "visibility";
      status?: ListingStatus;
      visibility?: ListingVisibility;
    };

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Không tìm thấy tin bán bò" }, { status: 404 });
    }

    let updatedVisibility = listing.visibility;
    let updatedStatus = listing.status;

    if (body.action === "approve") {
      updatedVisibility = "PUBLIC";
      updatedStatus = "SELLING";
    } else if (body.action === "reject") {
      updatedVisibility = "PRIVATE";
      updatedStatus = "HIDDEN";
    } else if (body.action === "status" && body.status) {
      updatedStatus = body.status;
    } else if (body.action === "visibility" && body.visibility) {
      updatedVisibility = body.visibility;
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        visibility: updatedVisibility,
        status: updatedStatus,
      },
    });

    return NextResponse.json({
      success: true,
      listing: updated,
      message:
        body.action === "approve"
          ? "Đã duyệt công khai tin bán bò lên sàn thành công"
          : body.action === "reject"
          ? "Đã từ chối và tạm ẩn tin bán bò"
          : "Đã cập nhật trạng thái tin thành công",
    });
  } catch (error) {
    console.error("Admin listing PATCH error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật tin từ quản trị" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên" }, { status: 403 });
    }

    const { id } = await context.params;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Không tìm thấy tin bán bò" }, { status: 404 });
    }

    await prisma.listing.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Đã xóa vĩnh viễn tin bán bò khỏi hệ thống",
    });
  } catch (error) {
    console.error("Admin listing DELETE error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa tin từ quản trị" }, { status: 500 });
  }
}
