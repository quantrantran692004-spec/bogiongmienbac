import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import CattleLogoIcon from "@/components/icons/CattleLogoIcon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bò Giống Miền Bắc - Sàn Mua Bán Bò Giống & Bò Thịt Uy Tín",
  description:
    "Sàn thương mại điện tử chuyên ngành mua bán bò giống, bò thịt chất lượng cao tại miền Bắc: Ba Vì, Hà Nội, Vĩnh Phúc, Bắc Giang, Phú Thọ. Kiểm duyệt tin an toàn, liên hệ trực tiếp người bán qua điện thoại, Zalo và Chat trực tuyến.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 pb-20 md:pb-0">
        <Navbar />
        <main className="flex-1">{children}</main>

        {/* Footer chuyên nghiệp */}
        <footer className="bg-stone-900 text-stone-300 py-10 px-4 mt-12 border-t border-stone-800 hidden md:block">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-800 flex items-center justify-center text-white">
                  <CattleLogoIcon className="w-4 h-4 text-amber-200" />
                </div>
                <span className="font-bold text-base text-white">Bò Giống Miền Bắc</span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed mb-3">
                Kênh kết nối trực tiếp giữa các hộ chăn nuôi, trang trại và thương lái bò giống uy tín tại các tỉnh miền Bắc: Ba Vì, Vĩnh Phúc, Bắc Giang, Phú Thọ, Thái Nguyên...
              </p>
              <p className="text-xs text-amber-400 font-semibold">
                ✓ Tin bán được kiểm duyệt an toàn • Tránh gian lận
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-xs">
                Giống bò tiêu biểu
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-400">
                <li>• Bò 3B (Blanc Bleu Belge) siêu thịt, tăng trọng nhanh</li>
                <li>• Bò Brahman giống thuần chủng, chịu hạn tốt</li>
                <li>• Bò Red Sindhi chất lượng sữa và sinh sản cao</li>
                <li>• Bò Angus đen thịt vân mỡ thơm ngon</li>
                <li>• Bò Vàng Việt Nam thích nghi tốt với thời tiết miền Bắc</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-xs">
                Tổng đài hỗ trợ & Kiểm duyệt
              </h4>
              <p className="text-stone-400 text-xs mb-1.5">
                Hotline hỗ trợ: <strong className="text-amber-400">0368.283.539</strong>
              </p>
              <p className="text-stone-400 text-xs mb-1.5">
                Zalo Quản trị: <strong className="text-amber-400">0368.283.539</strong>
              </p>
              <p className="text-[11px] text-stone-500 mt-4">
                © 2026 Bò Giống Miền Bắc. Bản quyền thuộc về sàn giao dịch chăn nuôi.
              </p>
            </div>
          </div>
        </footer>

        {/* Thanh điều hướng cố định phía dưới màn hình điện thoại */}
        <BottomNav />
      </body>
    </html>
  );
}
