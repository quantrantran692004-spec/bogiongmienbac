import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {
      site_name: "Bò Giống Miền Bắc",
      site_slogan: "Sàn Mua Bán Bò Giống & Bò Thịt Uy Tín",
      hotline: "0368283539",
      zalo_admin: "0368283539",
      hero_title: "BÒ GIỐNG CHẤT LƯỢNG",
      hero_subtitle: "PHÁT TRIỂN BỀN VỮNG",
      hero_desc: "Nền tảng kết nối trực tiếp hộ chăn nuôi và trang trại uy tín khắp Ba Vì, Vĩnh Phúc, Bắc Giang, Phú Thọ. Mua bán minh bạch, ảnh thực tế rõ nét, không qua trung gian.",
      hero_cta_text: "Khám phá ngay",
      hero_cta_link: "/danh-sach-bo",
      hero_image_url: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1920&q=85",
      notice_banner: "Chào mừng quý khách đến với Sàn Bò Giống Miền Bắc! Mọi giao dịch minh bạch, an toàn.",
      farm_address: "Ba Vì (Hà Nội), Vĩnh Phúc, Bắc Giang, Phú Thọ",
      email_support: "admin@bogiongmienbac.vn",
      footer_about: "Kênh kết nối trực tiếp giữa các hộ chăn nuôi, trang trại và thương lái bò giống uy tín tại các tỉnh miền Bắc: Ba Vì, Vĩnh Phúc, Bắc Giang, Phú Thọ, Thái Nguyên...",
      footer_copyright: "© 2026 Bò Giống Miền Bắc. Bản quyền thuộc về sàn giao dịch chăn nuôi.",
    };

    for (const s of settings) {
      map[s.key] = s.value;
    }

    return NextResponse.json({ settings: map });
  } catch (error) {
    console.error("Public settings GET error:", error);
    return NextResponse.json({ settings: {} });
  }
}
