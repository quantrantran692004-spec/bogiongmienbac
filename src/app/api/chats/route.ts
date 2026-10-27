import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const conversations = await prisma.chatConversation.findMany({
      where: {
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      },
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Chats GET error:", error);
    return NextResponse.json({ error: "Lỗi tải cuộc trò chuyện" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để gửi tin nhắn" }, { status: 401 });
    }

    const body = (await request.json()) as {
      listingId: string;
      initialMessage?: string;
    };

    if (!body.listingId) {
      return NextResponse.json({ error: "Thiếu mã tin bán bò" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: body.listingId },
      select: { id: true, sellerId: true, title: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Tin bán bò không tồn tại" }, { status: 404 });
    }

    // Nếu người dùng nhắn tin cho tin của chính mình, chỉ cần lấy hoặc tạo hội thoại
    let conversation = await prisma.chatConversation.findUnique({
      where: {
        listingId_buyerId: {
          listingId: listing.id,
          buyerId: user.id,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          listingId: listing.id,
          buyerId: user.id,
          sellerId: listing.sellerId,
        },
      });
    }

    if (body.initialMessage?.trim()) {
      await prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          content: body.initialMessage.trim(),
        },
      });

      await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      conversation,
    });
  } catch (error) {
    console.error("Chat create error:", error);
    return NextResponse.json({ error: "Lỗi khởi tạo hội thoại" }, { status: 500 });
  }
}
