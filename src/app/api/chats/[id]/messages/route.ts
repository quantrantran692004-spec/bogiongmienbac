import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await context.params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            priceAmount: true,
            priceType: true,
            media: {
              where: { isCover: true },
              take: 1,
            },
          },
        },
        buyer: { select: { id: true, fullName: true, phone: true } },
        seller: { select: { id: true, fullName: true, phone: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Cuộc trò chuyện không tồn tại" }, { status: 404 });
    }

    // Kiểm tra quyền: Chỉ buyer hoặc seller (hoặc admin) mới xem được
    const isParticipant = conversation.buyerId === user.id || conversation.sellerId === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ error: "Không có quyền truy cập hội thoại này" }, { status: 403 });
    }

    // Đánh dấu đã đọc các tin nhắn gửi tới user hiện tại
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ conversation, messages });
  } catch (error) {
    console.error("Chat messages GET error:", error);
    return NextResponse.json({ error: "Lỗi tải tin nhắn" }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await context.params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Cuộc trò chuyện không tồn tại" }, { status: 404 });
    }

    const isParticipant = conversation.buyerId === user.id || conversation.sellerId === user.id;
    if (!isParticipant) {
      return NextResponse.json({ error: "Không thể gửi tin nhắn vào cuộc trò chuyện này" }, { status: 403 });
    }

    const body = (await request.json()) as { content: string };
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Nội dung tin nhắn không được để trống" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: user.id,
        content: body.content.trim(),
      },
    });

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Chat message POST error:", error);
    return NextResponse.json({ error: "Lỗi gửi tin nhắn" }, { status: 500 });
  }
}
