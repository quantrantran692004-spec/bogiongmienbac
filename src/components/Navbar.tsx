"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { UserSession } from "@/types";
import { Phone, ShieldCheck, PlusCircle, User, LogOut, MessageSquare } from "lucide-react";
import CattleLogoIcon from "./icons/CattleLogoIcon";

export default function Navbar({ initialUser }: { initialUser?: UserSession | null }) {
  const [user, setUser] = useState<UserSession | null>(initialUser ?? null);

  useEffect(() => {
    if (initialUser === undefined) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, [initialUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      {/* Thanh thông báo & Hotline trên cùng */}
      <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="truncate text-stone-300 font-medium">
            Sàn Giao Dịch Bò Giống & Bò Thịt Miền Bắc • Kiểm duyệt an toàn chất lượng
          </span>
          <div className="flex items-center space-x-4 shrink-0">
            <a
              href="tel:0368283539"
              className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hotline: 0368.283.539</span>
            </a>
          </div>
        </div>
      </div>

      {/* Thanh chính */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Tên sàn chuyên nghiệp */}
          <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <CattleLogoIcon className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-stone-900 block leading-tight">
                Bò Giống Miền Bắc
              </span>
              <span className="text-[11px] text-stone-500 font-medium hidden sm:block">
                Sàn mua bán bò giống chất lượng cao
              </span>
            </div>
          </Link>

          {/* Nút hành động */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/dang-tin"
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng tin</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-200 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-800" />
                    <span className="hidden sm:inline">Quản Trị Viên</span>
                    <span className="sm:hidden">Admin</span>
                  </Link>
                ) : (
                  <Link
                    href="/tai-khoan"
                    className="inline-flex items-center space-x-1 text-xs sm:text-sm font-medium bg-stone-100 text-stone-800 px-3 py-1.5 rounded-xl hover:bg-stone-200 transition-colors"
                  >
                    <User className="w-4 h-4 text-stone-600" />
                    <span className="max-w-[120px] truncate hidden sm:inline">{user.fullName || user.phone}</span>
                  </Link>
                )}

                <Link
                  href="/chat"
                  className="p-2 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded-xl transition-colors relative"
                  title="Tin nhắn trao đổi"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-stone-600" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
