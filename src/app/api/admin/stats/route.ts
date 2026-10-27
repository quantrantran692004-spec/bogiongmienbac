import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên" }, { status: 403 });
    }

    const [totalListings, privateListings, publicListings, soldListings, totalSellers, totalMessages] =
      await Promise.all([
        prisma.listing.count(),
        prisma.listing.count({ where: { visibility: "PRIVATE" } }),
        prisma.listing.count({ where: { visibility: "PUBLIC" } }),
        prisma.listing.count({ where: { status: "SOLD" } }),
        prisma.user.count({ where: { role: "SELLER" } }),
        prisma.chatMessage.count(),
      ]);

    return NextResponse.json({
      stats: {
        totalListings,
        privateListings, // Tin riêng tư chờ duyệt
        publicListings,
        soldListings,
        totalSellers,
        totalMessages,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Lỗi tải thống kê" }, { status: 500 });
  }
}
