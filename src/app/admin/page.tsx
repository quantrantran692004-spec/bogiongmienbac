"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ListingItem, UserSession, SiteSettingsMap } from "@/types";
import ListingCard from "@/components/ListingCard";
import CattleLogoIcon from "@/components/icons/CattleLogoIcon";
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Settings,
  BarChart3,
  Search,
  RefreshCw,
  PlusCircle,
  Save,
  Trash2,
  FileText,
  MessageSquare,
  TrendingUp,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface AdminStats {
  totalListings: number;
  privateListings: number;
  publicListings: number;
  soldListings: number;
  totalSellers: number;
  totalConversations: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<"OVERVIEW" | "LISTINGS" | "SETTINGS">("OVERVIEW");

  // Dữ liệu
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [allListings, setAllListings] = useState<ListingItem[]>([]);
  const [settings, setSettings] = useState<SiteSettingsMap>({
    site_name: "Bò Giống Miền Bắc",
    site_slogan: "Sàn Mua Bán Bò Giống & Bò Thịt Chất Lượng Cao",
    hotline: "0368.283.539",
    zalo_admin: "0368.283.539",
    notice_banner: "Sàn Giao Dịch Bò Giống & Bò Thịt Uy Tín Miền Bắc • Trực tiếp từ người nuôi",
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const checkAdminAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.user || data.user.role !== "ADMIN") {
        router.push("/dang-nhap");
        return;
      }
      setUser(data.user);
      loadAdminData();
    } catch {
      router.push("/dang-nhap");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const loadAdminData = async () => {
    try {
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      const allRes = await fetch("/api/admin/listings");
      if (allRes.ok) {
        const aData = await allRes.json();
        setAllListings(aData.listings || []);
      }

      const settingsRes = await fetch("/api/admin/settings");
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.settings) setSettings(sData.settings);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  const handleStatusChange = async (id: string, status: "SELLING" | "SOLD" | "HIDDEN") => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setAllListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tin bán này?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAllListings((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#056839] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-semibold">Đang kiểm tra quyền quản trị...</p>
        </div>
      </div>
    );
  }

  const filteredListings = allListings.filter((item) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      item.title.toLowerCase().includes(kw) ||
      item.breed.toLowerCase().includes(kw) ||
      item.seller.phone.includes(kw) ||
      (item.seller.fullName && item.seller.fullName.toLowerCase().includes(kw))
    );
  });

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* SIDEBAR MÀN 7: MÀU XANH RÊU ĐẬM #0a3d2c ĐÚNG ẢNH MẪU */}
      <aside className="w-full md:w-64 bg-[#0a3d2c] text-white flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-md">
              <CattleLogoIcon className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight block">Bò Giống Miền Bắc</span>
              <span className="text-[10px] text-emerald-300 font-bold tracking-wider uppercase">
                Bảng Quản Trị
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveMenu("OVERVIEW")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === "OVERVIEW"
                  ? "bg-white/15 text-white font-bold"
                  : "text-emerald-100/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Tổng quan hệ thống</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMenu("LISTINGS")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === "LISTINGS"
                  ? "bg-white/15 text-white font-bold"
                  : "text-emerald-100/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>Quản lý tin bán ({allListings.length})</span>
            </button>

            <Link
              href="/chat"
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-emerald-100/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-sky-300" />
              <span>Tin nhắn sàn</span>
            </Link>

            <button
              type="button"
              onClick={() => setActiveMenu("SETTINGS")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === "SETTINGS"
                  ? "bg-white/15 text-white font-bold"
                  : "text-emerald-100/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4 text-amber-300" />
              <span>Cấu hình website</span>
            </button>
          </nav>
        </div>

        {/* Chân Sidebar */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-[11px] text-emerald-200/80">
            <div>Quản trị viên: <strong>{user?.phone}</strong></div>
            <div className="text-[10px] text-emerald-400 mt-0.5">● Hệ thống hoạt động bình thường</div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="flex-1 py-1.5 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center space-x-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Về website</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-900/50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* VÙNG NỘI DUNG CHÍNH (MAIN CONTENT) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              {activeMenu === "OVERVIEW" && "Tổng Quan Hoạt Động Sàn Bò"}
              {activeMenu === "LISTINGS" && "Quản Lý Danh Sách Tin Bán"}
              {activeMenu === "SETTINGS" && "Cấu Hình & Tham Số Hệ Thống"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Cập nhật dữ liệu thời gian thực từ cơ sở dữ liệu Bò Giống Miền Bắc
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={loadAdminData}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>

            <Link
              href="/dang-tin"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#056839] hover:bg-[#04522d] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng tin bán mới</span>
            </Link>
          </div>
        </div>

        {/* 4 THẺ THỐNG KÊ SỐ LIỆU ĐÚNG MÀN 7 */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Tổng số tin</span>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                {stats.totalListings}
              </div>
              <span className="text-[11px] text-[#056839] font-medium mt-1 block">
                ● Tự động công khai
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Tin đang bán</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">
                {stats.publicListings}
              </div>
              <span className="text-[11px] text-gray-500 font-medium mt-1 block">
                Hiển thị trên trang chủ
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Người bán / Trại</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
                {stats.totalSellers}
              </div>
              <span className="text-[11px] text-gray-500 font-medium mt-1 block">
                Ba Vì, Vĩnh Phúc, Bắc Giang
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-[11px] font-bold text-sky-700 uppercase">Tin nhắn trao đổi</span>
              <div className="text-2xl sm:text-3xl font-black text-sky-900 mt-1">
                {stats.totalConversations}
              </div>
              <span className="text-[11px] text-gray-500 font-medium mt-1 block">
                Cuộc gọi & chat trực tiếp
              </span>
            </div>
          </div>
        )}

        {/* BIỂU ĐỒ TRUY CẬP & TĂNG TRƯỞNG (ANALYTICS MINI CHART) ĐÚNG MÀN 7 */}
        {activeMenu === "OVERVIEW" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-base text-gray-900">
                  Lưu Lượng Truy Cập & Tương Tác Sàn Giao Dịch
                </h3>
                <p className="text-xs text-gray-500">
                  Thống kê số lượng lượt xem và tìm kiếm giống bò trong tuần qua
                </p>
              </div>
              <span className="text-xs font-bold text-[#056839] bg-emerald-50 px-3 py-1 rounded-full">
                Tăng trưởng +24%
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 px-4">
              {[
                { day: "Thứ 2", height: "45%", value: "320" },
                { day: "Thứ 3", height: "60%", value: "480" },
                { day: "Thứ 4", height: "75%", value: "610" },
                { day: "Thứ 5", height: "55%", value: "410" },
                { day: "Thứ 6", height: "85%", value: "720" },
                { day: "Thứ 7", height: "100%", value: "950" },
                { day: "Chủ nhật", height: "90%", value: "880" },
              ].map((bar) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#056839] transition-colors">
                    {bar.value}
                  </span>
                  <div className="w-full bg-gray-100 rounded-t-xl h-28 relative overflow-hidden flex items-end">
                    <div
                      className="w-full bg-[#056839] group-hover:bg-[#04522d] transition-all rounded-t-xl"
                      style={{ height: bar.height }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DANH SÁCH QUẢN LÝ TIN ĐĂNG */}
        {(activeMenu === "OVERVIEW" || activeMenu === "LISTINGS") && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-black text-base text-gray-900">
                Danh Sách Toàn Bộ Tin Bán Bò ({allListings.length})
              </h3>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm tin bán, người bán..."
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredListings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  showAdminActions={true}
                  onDelete={handleDeleteListing}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB CẤU HÌNH HỆ THỐNG - ĐẦY ĐỦ 4 NHÓM QUẢN TRỊ BỀN VỮNG */}
        {activeMenu === "SETTINGS" && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 max-w-4xl shadow-2xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-gray-900">
                Cấu Hình Website Sàn Bò Giống Miền Bắc
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Các thay đổi được lưu bền vững vào CSDL và tự động cập nhật ngay trên trang chủ, header và footer.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3.5 bg-emerald-50 text-[#056839] border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#056839]" />
                <span>Đã lưu toàn bộ cấu hình hệ thống thành công vào cơ sở dữ liệu!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* NHÓM 1: THÔNG TIN CHUNG & NHÃN HIỆU */}
              <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-sm text-[#056839] uppercase tracking-wider">
                  1. Thông tin chung & Nhãn hiệu
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tên sàn thương mại
                    </label>
                    <input
                      type="text"
                      value={settings.site_name || ""}
                      onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Khẩu hiệu (Slogan)
                    </label>
                    <input
                      type="text"
                      value={settings.site_slogan || ""}
                      onChange={(e) => setSettings({ ...settings, site_slogan: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email hỗ trợ
                    </label>
                    <input
                      type="email"
                      value={settings.email_support || ""}
                      onChange={(e) => setSettings({ ...settings, email_support: e.target.value })}
                      placeholder="admin@bogiongmienbac.vn"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Địa bàn chính trang trại
                    </label>
                    <input
                      type="text"
                      value={settings.farm_address || ""}
                      onChange={(e) => setSettings({ ...settings, farm_address: e.target.value })}
                      placeholder="Ba Vì, Vĩnh Phúc, Bắc Giang, Phú Thọ"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* NHÓM 2: HERO BANNER & NÚT CTA TRANG CHỦ */}
              <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-sm text-[#056839] uppercase tracking-wider">
                  2. Hero Banner & Nút CTA Trang Chủ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tiêu đề lớn dòng 1 (Trắng)
                    </label>
                    <input
                      type="text"
                      value={settings.hero_title || ""}
                      onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                      placeholder="BÒ GIỐNG CHẤT LƯỢNG"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tiêu đề phụ dòng 2 (Vàng hổ phách)
                    </label>
                    <input
                      type="text"
                      value={settings.hero_subtitle || ""}
                      onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                      placeholder="PHÁT TRIỂN BỀN VỮNG"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Đoạn mô tả ngắn dưới Banner
                  </label>
                  <textarea
                    rows={2}
                    value={settings.hero_desc || ""}
                    onChange={(e) => setSettings({ ...settings, hero_desc: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Chữ trên nút CTA
                    </label>
                    <input
                      type="text"
                      value={settings.hero_cta_text || ""}
                      onChange={(e) => setSettings({ ...settings, hero_cta_text: e.target.value })}
                      placeholder="Khám phá ngay"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Đường dẫn nút CTA
                    </label>
                    <input
                      type="text"
                      value={settings.hero_cta_link || ""}
                      onChange={(e) => setSettings({ ...settings, hero_cta_link: e.target.value })}
                      placeholder="/danh-sach-bo"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    URL Ảnh nền phong cảnh Banner (Chất lượng cao)
                  </label>
                  <input
                    type="text"
                    value={settings.hero_image_url || ""}
                    onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600"
                  />
                </div>
              </div>

              {/* NHÓM 3: LIÊN HỆ & THÔNG BÁO ĐẦU TRANG */}
              <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-sm text-[#056839] uppercase tracking-wider">
                  3. Thông tin liên hệ & Banner thông báo
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Hotline gọi điện
                    </label>
                    <input
                      type="text"
                      value={settings.hotline || ""}
                      onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#056839]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Số Zalo quản trị
                    </label>
                    <input
                      type="text"
                      value={settings.zalo_admin || ""}
                      onChange={(e) => setSettings({ ...settings, zalo_admin: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0068ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Thông báo chạy đầu trang (Notice banner)
                  </label>
                  <input
                    type="text"
                    value={settings.notice_banner || ""}
                    onChange={(e) => setSettings({ ...settings, notice_banner: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* NHÓM 4: CHÂN TRANG & BẢN QUYỀN */}
              <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-sm text-[#056839] uppercase tracking-wider">
                  4. Chân trang (Footer) & Bản quyền
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Đoạn giới thiệu chân trang
                  </label>
                  <textarea
                    rows={2}
                    value={settings.footer_about || ""}
                    onChange={(e) => setSettings({ ...settings, footer_about: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Dòng bản quyền Copyright
                  </label>
                  <input
                    type="text"
                    value={settings.footer_copyright || ""}
                    onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-8 py-3 bg-[#056839] hover:bg-[#04522d] text-white font-bold text-sm rounded-xl shadow-sm transition-all hover:shadow active:scale-98 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? "Đang lưu cấu hình..." : "Lưu Toàn Bộ Cấu Hình"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
