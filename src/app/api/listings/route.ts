import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { PriceType, ListingStatus, ListingVisibility, MediaType } from "@prisma/client";

export const dynamic = "force-dynamic";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${base}-${Date.now().toString().slice(-6)}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const breed = searchParams.get("breed")?.trim() || "";
    const province = searchParams.get("province")?.trim() || "";
    const priceType = searchParams.get("priceType") as PriceType | null;
    const status = (searchParams.get("status") as ListingStatus) || "SELLING";
    const weightMin = searchParams.get("weightMin") ? parseFloat(searchParams.get("weightMin")!) : undefined;
    const weightMax = searchParams.get("weightMax") ? parseFloat(searchParams.get("weightMax")!) : undefined;
    const priceMin = searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : undefined;
    const priceMax = searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : undefined;
    const myOnly = searchParams.get("myOnly") === "true" || searchParams.get("myListings") === "true";

    const currentUser = await getSessionUser();

    // Điều kiện lọc
    const where: Record<string, unknown> = {};

    if (myOnly) {
      if (!currentUser) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
      }
      where.sellerId = currentUser.id;
    } else {
      // Khách vãng lai chỉ xem được tin công khai
      where.visibility = "PUBLIC";
      if (status) {
        where.status = status;
      }
    }

    if (breed) {
      where.breed = breed;
    }

    if (province) {
      where.province = { contains: province };
    }

    if (priceType) {
      where.priceType = priceType;
    }

    if (weightMin !== undefined || weightMax !== undefined) {
      where.weightAvgKg = {
        ...(weightMin !== undefined ? { gte: weightMin } : {}),
        ...(weightMax !== undefined ? { lte: weightMax } : {}),
      };
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.priceAmount = {
        ...(priceMin !== undefined ? { gte: priceMin } : {}),
        ...(priceMax !== undefined ? { lte: priceMax } : {}),
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { breed: { contains: search } },
        { province: { contains: search } },
        { district: { contains: search } },
      ];
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        include: {
          seller: {
            select: { id: true, phone: true, fullName: true, zaloNumber: true, role: true },
          },
          media: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
    ]);

    return NextResponse.json({
      listings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Listings GET error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách tin bán" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để đăng tin bán bò" }, { status: 401 });
    }

    const body = (await request.json()) as {
      title: string;
      description?: string;
      breed: string;
      quantity: number;
      weightAvgKg?: number;
      priceType: PriceType;
      priceAmount?: number;
      province: string;
      district?: string;
      media: Array<{
        fileUrl: string;
        thumbnailUrl?: string;
        fileType: MediaType;
        aspectRatio?: number;
        isCover?: boolean;
        sortOrder?: number;
      }>;
    };

    if (!body.title?.trim() || body.title.trim().length < 5) {
      return NextResponse.json({ error: "Tiêu đề tin bán cần ít nhất 5 ký tự rõ ràng" }, { status: 400 });
    }

    if (!body.breed?.trim()) {
      return NextResponse.json({ error: "Vui lòng chọn hoặc nhập giống bò" }, { status: 400 });
    }

    if (!body.province?.trim()) {
      return NextResponse.json({ error: "Vui lòng chọn tỉnh/thành phố chăn nuôi" }, { status: 400 });
    }

    if (body.priceType !== "NEGOTIABLE" && (!body.priceAmount || Number(body.priceAmount) <= 0)) {
      return NextResponse.json({ error: "Vui lòng nhập mức giá bán hợp lệ lớn hơn 0 hoặc chọn 'Giá thương lượng'" }, { status: 400 });
    }

    if (!body.media || body.media.length === 0) {
      return NextResponse.json({ error: "Cần ít nhất 1 hình ảnh rõ nét của bò để đăng tin" }, { status: 400 });
    }

    const isAdmin = user.role === "ADMIN";
    // Tin của người dùng thông thường phải ở trạng thái riêng/chờ quản trị xử lý và không được tự ý công khai.
    // Tin do quản trị viên đăng được công khai trực tiếp theo đúng quyền hạn.
    const visibility: ListingVisibility = isAdmin ? "PUBLIC" : "PRIVATE";

    const slug = generateSlug(body.title);

    const listing = await prisma.listing.create({
      data: {
        title: body.title.trim(),
        slug,
        description: body.description?.trim() || null,
        breed: body.breed.trim(),
        quantity: Math.max(1, body.quantity || 1),
        weightAvgKg: body.weightAvgKg ? Number(body.weightAvgKg) : null,
        priceType: body.priceType || "PER_HEAD",
        priceAmount: body.priceAmount ? Number(body.priceAmount) : null,
        status: "SELLING",
        visibility,
        createdByAdmin: isAdmin,
        province: body.province.trim(),
        district: body.district?.trim() || null,
        sellerId: user.id,
        media: {
          create: body.media.map((m, index) => ({
            fileUrl: m.fileUrl,
            thumbnailUrl: m.thumbnailUrl || m.fileUrl,
            fileType: m.fileType || "IMAGE",
            aspectRatio: m.aspectRatio || 1.5,
            isCover: m.isCover !== undefined ? m.isCover : index === 0,
            sortOrder: m.sortOrder !== undefined ? m.sortOrder : index,
          })),
        },
      },
      include: {
        media: true,
      },
    });

    // Ghi nhận lịch sử giá ban đầu nếu có giá
    if (listing.priceAmount) {
      await prisma.priceHistory.create({
        data: {
          listingId: listing.id,
          newPrice: listing.priceAmount,
          newPriceType: listing.priceType,
          changedByUserId: user.id,
        },
      });
    }

    const message = isAdmin
      ? "Đã đăng tin bán bò công khai thành công lên sàn!"
      : "Tin bán bò đã được lưu thành công và đang ở trạng thái riêng/chờ Quản trị viên duyệt công khai.";

    return NextResponse.json({
      success: true,
      listing,
      message,
    });
  } catch (error) {
    console.error("Listing POST error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra khi tạo tin bán bò" }, { status: 500 });
  }
}
