"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Lock, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import CattleLogoIcon from "@/components/icons/CattleLogoIcon";

export default function DangNhapPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"SELLER" | "ADMIN">("SELLER");

  // State Người bán
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [zaloNumber, setZaloNumber] = useState("");

  // State Admin
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSellerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại của bạn.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          fullName: fullName.trim() || undefined,
          zaloNumber: zaloNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      window.location.href = "/tai-khoan";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!adminPhone.trim() || !adminPassword.trim()) {
      setError("Vui lòng nhập đầy đủ số điện thoại và mật khẩu quản trị.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: adminPhone.trim(),
          password: adminPassword.trim(),
          isAdmin: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sai số điện thoại hoặc mật khẩu quản trị");
      }

      window.location.href = "/admin";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-stone-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
        {/* NỬA TRÁI (MÀN 5 SPLIT BANNER): ẢNH ĐỒNG CỎ & CAM KẾT CHẤT LƯỢNG (5 CỘT) */}
        <div className="md:col-span-5 relative bg-stone-900 p-8 text-white flex flex-col justify-between overflow-hidden">
          {/* Nền ảnh đồi núi đồng cỏ */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#056839]/90 via-stone-950/85 to-stone-950" />
          </div>

          <div className="relative z-10 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-md">
                <CattleLogoIcon className="w-5 h-5 text-amber-950" />
              </div>
              <div>
                <span className="font-black text-base tracking-tight block">Bò Giống Miền Bắc</span>
                <span className="text-[11px] text-stone-300">Sàn Thương Mại Điện Tử</span>
              </div>
            </Link>

            <div className="pt-6">
              <h2 className="text-xl sm:text-2xl font-black leading-tight text-white mb-2">
                Kết Nối Hộ Chăn Nuôi & Trang Trại Toàn Miền Bắc
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                Đăng tin miễn phí, hiển thị công khai ngay lập tức, kết nối khách mua trực tiếp qua điện thoại và Zalo.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-6 space-y-3 border-t border-white/10 text-xs">
            <div className="flex items-center space-x-2 text-stone-200">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Đăng tin bán không cần admin duyệt</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-200">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Hình ảnh đàn bò thực tế 100%</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-200">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Trao đổi trực tiếp, không qua trung gian</span>
            </div>
          </div>
        </div>

        {/* NỬA PHẢI (MÀN 5 SPLIT BANNER): FORM ĐĂNG NHẬP (7 CỘT) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-5">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Đăng Nhập Tài Khoản
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Chọn vai trò của bạn để quản lý tin đăng hoặc quản trị hệ thống
              </p>
            </div>

            {/* Tab chuyển đổi Người bán vs Quản trị viên */}
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("SELLER");
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "SELLER"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Người Bán Bò
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("ADMIN");
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                  activeTab === "ADMIN"
                    ? "bg-[#056839] text-white shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quản Trị Viên</span>
              </button>
            </div>

            {/* Lỗi nếu có */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* FORM NGƯỜI BÁN */}
            {activeTab === "SELLER" && (
              <form onSubmit={handleSellerLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="VD: 0912345678"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#056839]"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Đăng nhập bằng SĐT để quản lý tin bán của bạn
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tên người bán / Tên trại bò
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="VD: Trại Bò Anh Nam Ba Vì"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#056839]"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Số Zalo (Nếu khác số gọi)
                  </label>
                  <input
                    type="tel"
                    value={zaloNumber}
                    onChange={(e) => setZaloNumber(e.target.value)}
                    placeholder="Để trống nếu trùng số điện thoại"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#056839]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#056839] hover:bg-[#04522d] active:scale-98 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? "Đang xử lý..." : "Tiếp tục / Đăng nhập"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* FORM QUẢN TRỊ VIÊN */}
            {activeTab === "ADMIN" && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Số điện thoại Quản Trị Viên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="0368283539"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#056839]"
                    />
                    <ShieldCheck className="w-4 h-4 text-[#056839] absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mật khẩu Quản Trị Viên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Mật khẩu bảo mật"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#056839]"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-stone-900 hover:bg-black active:scale-98 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? "Đang xác thực..." : "Đăng nhập Bảng Quản Trị"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
