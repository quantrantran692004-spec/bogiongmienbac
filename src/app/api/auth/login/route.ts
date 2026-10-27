import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/auth";
import { UserRole } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      fullName?: string;
      zaloNumber?: string;
      password?: string;
      isAdmin?: boolean;
    };

    const phone = body.phone?.trim();
    if (!phone || !/^[0-9]{9,11}$/.test(phone)) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ (cần 9-11 chữ số)" }, { status: 400 });
    }

    const adminPhone = process.env.ADMIN_PHONE || "0988888888";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin_change_this_password_123";

    // 1. Luồng đăng nhập Quản trị viên
    if (body.isAdmin) {
      if (phone !== adminPhone || body.password !== adminPassword) {
        return NextResponse.json({ error: "Thông tin xác thực Quản trị viên không chính xác" }, { status: 401 });
      }

      const adminUser = await prisma.user.upsert({
        where: { phone: adminPhone },
        update: { role: "ADMIN" },
        create: {
          phone: adminPhone,
          fullName: "Ban Quản Trị Bò Giống Miền Bắc",
          role: "ADMIN",
          zaloNumber: adminPhone,
        },
      });

      await setAuthCookie({
        id: adminUser.id,
        phone: adminUser.phone,
        fullName: adminUser.fullName,
        zaloNumber: adminUser.zaloNumber,
        role: "ADMIN",
      });

      return NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          phone: adminUser.phone,
          fullName: adminUser.fullName,
          role: "ADMIN" as UserRole,
        },
      });
    }

    // 2. Luồng đăng nhập Người bán (Đơn giản bằng Số điện thoại)
    const sellerUser = await prisma.user.upsert({
      where: { phone },
      update: {
        fullName: body.fullName?.trim() || undefined,
        zaloNumber: body.zaloNumber?.trim() || phone,
      },
      create: {
        phone,
        fullName: body.fullName?.trim() || `Trang trại ${phone.slice(-4)}`,
        zaloNumber: body.zaloNumber?.trim() || phone,
        role: "SELLER",
      },
    });

    if (sellerUser.status === "SUSPENDED") {
      return NextResponse.json({ error: "Tài khoản này đang bị tạm khóa. Vui lòng liên hệ ban quản trị." }, { status: 403 });
    }

    await setAuthCookie({
      id: sellerUser.id,
      phone: sellerUser.phone,
      fullName: sellerUser.fullName,
      zaloNumber: sellerUser.zaloNumber,
      role: sellerUser.role as UserRole,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: sellerUser.id,
        phone: sellerUser.phone,
        fullName: sellerUser.fullName,
        role: sellerUser.role as UserRole,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra khi xử lý đăng nhập" }, { status: 500 });
  }
}
