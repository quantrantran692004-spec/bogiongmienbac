"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, PlusCircle, MessageSquare, User, ShieldCheck, ClipboardList } from "lucide-react";
import { UserSession } from "@/types";

export default function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg md:hidden">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
        {/* Trang chủ */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname === "/" ? "text-amber-800 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Trang chủ</span>
        </Link>

        {/* Tin nhắn Chat */}
        <Link
          href="/chat"
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            pathname.startsWith("/chat") ? "text-amber-800 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Tin nhắn</span>
        </Link>

        {/* Nút Đăng Tin Nổi Bật Ở Giữa */}
        <div className="flex justify-center -mt-5">
          <Link
            href="/dang-tin"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-700 to-amber-900 text-white flex flex-col items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform border-4 border-white"
            title="Đăng tin bán bò"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[8px] font-bold mt-0.5">Đăng tin</span>
          </Link>
        </div>

        {/* Quản lý tin / Bảng tin */}
        <Link
          href={user?.role === "ADMIN" ? "/admin" : "/tai-khoan"}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname === "/tai-khoan" || pathname.startsWith("/admin")
              ? "text-amber-800 font-bold"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          {user?.role === "ADMIN" ? (
            <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-700" />
          ) : (
            <ClipboardList className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px] leading-tight truncate">
            {user?.role === "ADMIN" ? "Quản trị" : "Tin của tôi"}
          </span>
        </Link>

        {/* Tài khoản */}
        <Link
          href={user ? "/tai-khoan" : "/dang-nhap"}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname === "/dang-nhap" ? "text-amber-800 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight truncate">
            {user ? (user.fullName || "Tài khoản") : "Đăng nhập"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
