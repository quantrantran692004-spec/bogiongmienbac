"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock, User, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
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
    <div className="max-w-md mx-auto px-4 py-8 sm:py-14">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CattleLogoIcon className="w-6 h-6 text-amber-100" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            Đăng Nhập Sàn Bò Giống
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Quản lý tin bán bò, theo dõi khách hàng và kết nối trực tiếp
          </p>
        </div>

        {/* Tab chuyển đổi Người Bán vs Quản Trị Viên */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("SELLER");
              setError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === "SELLER"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-500 hover:text-stone-800"
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
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
              activeTab === "ADMIN"
                ? "bg-amber-800 text-white shadow-2xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Quản Trị Viên</span>
          </button>
        </div>

        {/* Báo lỗi nếu có */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm p-3 rounded-xl flex items-center space-x-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM 1: NGƯỜI BÁN */}
        {activeTab === "SELLER" && (
          <form onSubmit={handleSellerLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Số điện thoại của bạn <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0912345678"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Dùng số điện thoại để khách mua bò có thể gọi hoặc nhắn Zalo cho bạn.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Họ và tên / Tên trại bò (Không bắt buộc)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Trại Bò Giống Ba Vì"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Số Zalo (Để trống nếu giống số điện thoại)
              </label>
              <input
                type="tel"
                value={zaloNumber}
                onChange={(e) => setZaloNumber(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Đang xử lý..." : "Tiếp tục / Đăng nhập ngay"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* FORM 2: QUẢN TRỊ VIÊN */}
        {activeTab === "ADMIN" && (
          <form onSubmit={handleAdminLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Số điện thoại Quản Trị Viên <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="0368283539"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                />
                <ShieldCheck className="w-4 h-4 text-amber-700 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mật khẩu Quản Trị Viên <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-900 hover:bg-black active:bg-stone-950 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Đang xác thực..." : "Đăng nhập Bảng Quản Trị"}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
