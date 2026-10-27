"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { UserSession } from "@/types";
import { Plus, Bell, MessageSquare, User, LogOut, ShieldCheck } from "lucide-react";
import CattleLogoIcon from "./icons/CattleLogoIcon";

export default function Navbar({ initialUser }: { initialUser?: UserSession | null }) {
  const pathname = usePathname();
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
  }, [initialUser, pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Danh mục", href: "/danh-sach-bo" },
    { label: "Tin đăng", href: "/danh-sach-bo" },
    { label: "Tin nhắn", href: "/chat" },
    { label: "Tài khoản", href: user ? (user.role === "ADMIN" ? "/admin" : "/tai-khoan") : "/dang-nhap" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo đúng mẫu ảnh */}
          <Link href="/" className="flex items-center space-x-3 shrink-0 group">
            <div className="w-11 h-11 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-2xs group-hover:scale-105 transition-transform">
              <CattleLogoIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-gray-900 block leading-tight">
                Bò Giống Miền Bắc
              </span>
              <span className="text-[11px] text-gray-500 font-medium block">
                Kết nối người mua - người bán
              </span>
            </div>
          </Link>

          {/* Menu Điều Hướng Chính (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition-colors py-1 relative ${
                    isActive
                      ? "text-[#056839] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#056839]"
                      : "text-gray-600 hover:text-[#056839]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Nút Đăng Tin & Tài khoản (Bên phải) */}
          <div className="flex items-center space-x-3">
            {/* Nút Đăng Tin Chuẩn Xanh Lá Như Mẫu */}
            <Link
              href="/dang-tin"
              className="inline-flex items-center space-x-1.5 bg-[#056839] hover:bg-[#04522d] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all hover:shadow active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Đăng tin</span>
            </Link>

            {/* Tài khoản / Đăng nhập */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/tai-khoan"}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  title={user.fullName || user.phone}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#056839] flex items-center justify-center font-bold text-xs border border-emerald-300">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="p-2 text-gray-600 hover:text-[#056839] hover:bg-gray-50 rounded-lg transition-colors"
                title="Đăng nhập"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
