import { PrismaClient, Role, ListingStatus, ListingVisibility, PriceType, MediaType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu khởi tạo dữ liệu mẫu cho Sàn Bò Giống Miền Bắc...");

  // 1. Khởi tạo tài khoản Quản trị viên chính duy nhất (Single Super Admin)
  const adminPhone = process.env.ADMIN_PHONE || "0368283539";
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {
      fullName: "Quản Trị Viên Sàn Bò Giống",
      role: Role.ADMIN,
      zaloNumber: adminPhone,
    },
    create: {
      phone: adminPhone,
      fullName: "Quản Trị Viên Sàn Bò Giống",
      role: Role.ADMIN,
      zaloNumber: adminPhone,
    },
  });
  console.log(`👤 Đã thiết lập Quản trị viên chính: ${admin.phone}`);

  // 2. Khởi tạo một số người bán uy tín mẫu
  const seller1 = await prisma.user.upsert({
    where: { phone: "0912345678" },
    update: {},
    create: {
      phone: "0912345678",
      fullName: "Trang Trại Bò Giống Ba Vì - Anh Tuấn",
      zaloNumber: "0912345678",
      role: Role.SELLER,
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { phone: "0976543210" },
    update: {},
    create: {
      phone: "0976543210",
      fullName: "Trại Bò Ngoại Vĩnh Phúc - Bác Hùng",
      zaloNumber: "0976543210",
      role: Role.SELLER,
    },
  });

  // 3. Khởi tạo cấu hình hệ thống ban đầu (SiteSetting)
  const settings = [
    { key: "site_name", value: "Bò Giống Miền Bắc" },
    { key: "site_slogan", value: "Sàn Giao Dịch Bò Giống & Bò Thịt Uy Tín Số 1 Miền Bắc" },
    { key: "hotline", value: "0368283539" },
    { key: "zalo_admin", value: "0368283539" },
    { key: "notice_banner", value: "Chào mừng quý bà con và trang trại đến với Sàn Bò Giống Miền Bắc! Mọi tin đăng đều được kiểm duyệt kỹ càng." },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 4. Xóa tin cũ để làm sạch nếu cần
  await prisma.listing.deleteMany({});

  // 5. Tạo các tin bán bò mẫu thực tế (Có đủ các loại giá, giống bò, cân nặng)
  const sampleListings = [
    {
      title: "Đàn Bò 3B Siêu Thịt F1 Đẹp Tuyển Chọn 10 Con Khỏe Mạnh",
      slug: "dan-bo-3b-sieu-thit-f1-dep-tuyen-chon-10-con",
      description: "Đàn bò 3B F1 dòng máu Pháp thuần, khung xương to bản, mông đùi nở nang, đã tiêm phòng vắc xin đầy đủ (LMLM, tụ huyết trùng). Bò ăn khỏe, phàm ăn cỏ ủ và cám bắp. Thích hợp cho trang trại vỗ béo tăng trọng nhanh.",
      breed: "3B (Blanc Bleu Belge)",
      quantity: 10,
      weightAvgKg: 280,
      priceType: PriceType.PER_HEAD,
      priceAmount: 26500000,
      status: ListingStatus.SELLING,
      visibility: ListingVisibility.PUBLIC,
      createdByAdmin: true,
      province: "Hà Nội",
      district: "Ba Vì",
      sellerId: admin.id,
      media: [
        {
          fileUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80",
          fileType: MediaType.IMAGE,
          isCover: true,
          aspectRatio: 1.5,
          sortOrder: 0,
        },
        {
          fileUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80",
          fileType: MediaType.IMAGE,
          isCover: false,
          aspectRatio: 1.5,
          sortOrder: 1,
        },
      ],
    },
    {
      title: "Bò Đực Giống Brahman Đỏ Thuần Chủng Cao To Gân Guốc",
      slug: "bo-duc-giong-brahman-do-thuan-chung-cao-to",
      description: "Bò đực giống Brahman đỏ 18 tháng tuổi, gốc nhập ngoại, yếm sâu, lưng thẳng, tính hiền dễ dắt. Tinh phối cực khỏe, tỷ lệ đậu cao. Phù hợp nhân giống đàn bò thịt địa phương.",
      breed: "Brahman Đỏ",
      quantity: 1,
      weightAvgKg: 450,
      priceType: PriceType.PER_HEAD,
      priceAmount: 48000000,
      status: ListingStatus.SELLING,
      visibility: ListingVisibility.PUBLIC,
      createdByAdmin: false,
      province: "Vĩnh Phúc",
      district: "Lập Thạch",
      sellerId: seller2.id,
      media: [
        {
          fileUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80",
          fileType: MediaType.IMAGE,
          isCover: true,
          aspectRatio: 1.5,
          sortOrder: 0,
        },
      ],
    },
    {
      title: "Bán Đàn Bò Cái Sinh Sản Sind Vàng Đang Chửa Lứa 2 (5 Con)",
      slug: "ban-dan-bo-cai-sinh-san-sind-vang-dang-chua-lua-2",
      description: "Cần sang nhượng cả đàn 5 con bò cái Sind vàng lai Zebu, bầu vú to đều, đã khám thai 4-5 tháng phối giống đực 3B. Bò quen chăn thả đồi gò, chịu kham khổ tốt, dễ nuôi.",
      breed: "Red Sindhi (Bò Sind)",
      quantity: 5,
      weightAvgKg: 320,
      priceType: PriceType.PER_HERD,
      priceAmount: 95000000,
      status: ListingStatus.SELLING,
      visibility: ListingVisibility.PUBLIC,
      createdByAdmin: false,
      province: "Bắc Giang",
      district: "Lục Nam",
      sellerId: seller1.id,
      media: [
        {
          fileUrl: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=400&q=80",
          fileType: MediaType.IMAGE,
          isCover: true,
          aspectRatio: 1.5,
          sortOrder: 0,
        },
      ],
    },
    {
      title: "Cặp Bò Angus Đen Thuần Úc 8 Tháng Tuổi Nhanh Lớn",
      slug: "cap-bo-angus-den-thuan-uc-8-thang-tuoi",
      description: "Bò giống Angus đen ngoại hình cân đối, da bóng, lông mượt, không sừng bẩm sinh. Bò phát triển tốt với khí hậu miền Bắc. Giá thỏa thuận trực tiếp tại chuồng cho anh em thiện chí.",
      breed: "Angus Đen",
      quantity: 2,
      weightAvgKg: 220,
      priceType: PriceType.NEGOTIABLE,
      priceAmount: null, // Giá thương lượng -> hiển thị Liên hệ / Giá thỏa thuận
      status: ListingStatus.SELLING,
      visibility: ListingVisibility.PUBLIC,
      createdByAdmin: true,
      province: "Thái Nguyên",
      district: "Phổ Yên",
      sellerId: admin.id,
      media: [
        {
          fileUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80",
          fileType: MediaType.IMAGE,
          isCover: true,
          aspectRatio: 1.5,
          sortOrder: 0,
        },
      ],
    },
    {
      title: "Tin Mới Đăng Chờ Duyệt (Khu Vực Riêng Tư Của Quản Trị Viên)",
      slug: "tin-moi-dang-cho-duyet-tu-nguoi-ban",
      description: "Tin do người bán tạo, tự động lưu vào vùng PRIVATE, chỉ người bán và Quản trị viên chính nhìn thấy cho đến khi được duyệt công khai.",
      breed: "Droughtmaster",
      quantity: 3,
      weightAvgKg: 350,
      priceType: PriceType.PER_HEAD,
      priceAmount: 32000000,
      status: ListingStatus.SELLING,
      visibility: ListingVisibility.PRIVATE, // Riêng tư!
      createdByAdmin: false,
      province: "Phú Thọ",
      district: "Thanh Ba",
      sellerId: seller1.id,
      media: [
        {
          fileUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80",
          fileType: MediaType.IMAGE,
          isCover: true,
          aspectRatio: 1.5,
          sortOrder: 0,
        },
      ],
    },
  ];

  for (const item of sampleListings) {
    const { media, ...listingData } = item;
    const created = await prisma.listing.create({
      data: {
        ...listingData,
        media: {
          create: media,
        },
      },
    });
    console.log(`✅ Đã tạo tin bán bò: "${created.title}" [${created.visibility}]`);
  }

  console.log("🎉 Hoàn tất seed dữ liệu thành công!");
}

main()
  .catch((e) => {
    console.error("Lỗi seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
