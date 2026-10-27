"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { UserSession } from "@/types";
import { Phone, ShieldCheck, PlusCircle, User, LogOut, MessageSquare } from "lucide-react";

export default function Navbar({ initialUser }: { initialUser?: UserSession | null }) {
  const [user, setUser] = useState<UserSession | null>(initialUser ?? null);

  useEffect(() => {
    // Tải thông tin người dùng nếu chưa có
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-900/10 shadow-xs">
      {/* Thanh thông báo & Hotline trên cùng */}
      <div className="bg-amber-900 text-amber-50 text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="truncate">Sàn Giao Dịch Bò Giống & Bò Thịt Uy Tín Miền Bắc • Kiểm duyệt an toàn</span>
          <div className="flex items-center space-x-4 shrink-0">
            <a href="tel:0988888888" className="flex items-center space-x-1 hover:text-amber-200">
              <Phone className="w-3.5 h-3.5" />
              <span className="font-semibold">Hotline: 0988.888.888</span>
            </a>
          </div>
        </div>
      </div>

      {/* Thanh chính */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Tên sàn */}
          <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="text-xl font-black">🐂</span>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-amber-950 block leading-tight">
                Bò Giống Miền Bắc
              </span>
              <span className="text-[11px] text-amber-800/80 font-medium hidden sm:block">
                Sàn mua bán bò giống chất lượng cao
              </span>
            </div>
          </Link>

          {/* Nút hành động */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/dang-tin"
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-medium text-sm px-3.5 py-2 rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="font-semibold">Đăng tin</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center space-x-1 text-xs sm:text-sm font-semibold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-800" />
                    <span className="hidden sm:inline">Quản Trị Viên</span>
                    <span className="sm:hidden">Admin</span>
                  </Link>
                ) : (
                  <Link
                    href="/tai-khoan"
                    className="inline-flex items-center space-x-1 text-xs sm:text-sm font-medium bg-stone-100 text-stone-800 px-2.5 py-1.5 rounded-lg hover:bg-stone-200 transition-colors"
                  >
                    <User className="w-4 h-4 text-stone-600" />
                    <span className="max-w-[100px] truncate hidden sm:inline">{user.fullName || user.phone}</span>
                  </Link>
                )}

                <Link
                  href="/chat"
                  className="p-2 text-stone-700 hover:text-amber-900 hover:bg-stone-100 rounded-lg transition-colors relative"
                  title="Tin nhắn"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="inline-flex items-center space-x-1 text-sm font-medium text-amber-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
