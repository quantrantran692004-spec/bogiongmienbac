"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ListingItem, UserSession, SiteSettingsMap } from "@/types";
import ListingCard from "@/components/ListingCard";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Users,
  Settings,
  BarChart3,
  Search,
  RefreshCw,
  PlusCircle,
  Save,
  Trash2,
  Eye,
  AlertCircle,
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
  const [activeTab, setActiveTab] = useState<"PENDING" | "ALL_LISTINGS" | "SELLERS" | "SETTINGS">("PENDING");

  // Dữ liệu
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingListings, setPendingListings] = useState<ListingItem[]>([]);
  const [allListings, setAllListings] = useState<ListingItem[]>([]);
  const [settings, setSettings] = useState<SiteSettingsMap>({
    site_name: "Bò Giống Miền Bắc",
    site_slogan: "Sàn Mua Bán Bò Giống & Bò Thịt Chất Lượng Cao",
    hotline: "0988.888.888",
    zalo_admin: "0988.888.888",
    notice_banner: "Sàn Giao Dịch Bò Giống & Bò Thịt Uy Tín Miền Bắc • Kiểm duyệt an toàn",
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
      // 1. Tải thống kê
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // 2. Tải tin riêng tư chờ duyệt
      const pendingRes = await fetch("/api/admin/listings?visibility=PRIVATE");
      if (pendingRes.ok) {
        const pData = await pendingRes.json();
        setPendingListings(pData.listings || []);
      }

      // 3. Tải tất cả tin
      const allRes = await fetch("/api/admin/listings");
      if (allRes.ok) {
        const aData = await allRes.json();
        setAllListings(aData.listings || []);
      }

      // 4. Tải cài đặt site
      const settingsRes = await fetch("/api/admin/settings");
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.settings) setSettings(sData.settings);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  // Duyệt tin công khai 1-click
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: "PUBLIC" }),
      });
      if (res.ok) {
        // Cập nhật lại state
        setPendingListings((prev) => prev.filter((item) => item.id !== id));
        setAllListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, visibility: "PUBLIC" } : item))
        );
        if (stats) {
          setStats({
            ...stats,
            privateListings: Math.max(0, stats.privateListings - 1),
            publicListings: stats.publicListings + 1,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Đổi trạng thái tin
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

  // Xóa tin
  const handleDeleteListing = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tin bán này?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPendingListings((prev) => prev.filter((item) => item.id !== id));
        setAllListings((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Lưu cài đặt site
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center animate-pulse">
        <div className="h-10 bg-stone-200 rounded-xl w-1/3 mx-auto mb-4" />
        <div className="h-32 bg-stone-200 rounded-3xl mb-6" />
      </div>
    );
  }

  const filteredAllListings = allListings.filter((item) => {
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Header Quản Trị */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white rounded-3xl p-5 sm:p-6 shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black">Trung Tâm Quản Trị Sàn Bò Giống</h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Quyền hạn cao nhất: Duyệt tin riêng tư, quản lý toàn bộ danh mục, thành viên và thông số sàn.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAdminData}
            className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>

          <Link
            href="/dang-tin"
            className="inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Đăng tin chuẩn Admin</span>
          </Link>
        </div>
      </div>

      {/* Thẻ Thống Kê Nhanh */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Chờ duyệt */}
          <div
            onClick={() => setActiveTab("PENDING")}
            className="bg-white rounded-2xl border border-rose-200 p-4 shadow-2xs cursor-pointer hover:border-rose-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-800 uppercase">Chờ duyệt</span>
              <Clock className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-950">
              {stats.privateListings}
            </div>
            <span className="text-[11px] text-rose-700 font-medium">Bấm để duyệt ngay</span>
          </div>

          {/* Đang bán */}
          <div
            onClick={() => setActiveTab("ALL_LISTINGS")}
            className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-2xs cursor-pointer hover:border-emerald-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase">Đang công khai</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950">
              {stats.publicListings}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Tin đang hiển thị</span>
          </div>

          {/* Tổng người bán */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-600 uppercase">Người bán</span>
              <Users className="w-4 h-4 text-stone-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {stats.totalSellers}
            </div>
            <span className="text-[11px] text-stone-500 font-medium">Đã tham gia</span>
          </div>

          {/* Tin nhắn trao đổi */}
          <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 uppercase">Cuộc hội thoại</span>
              <BarChart3 className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950">
              {stats.totalConversations}
            </div>
            <span className="text-[11px] text-amber-800 font-medium">Khách kết nối</span>
          </div>
        </div>
      )}

      {/* Tabs Chức Năng Quản Trị */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-3 mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === "PENDING"
              ? "bg-rose-700 text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Hàng đợi duyệt ({pendingListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ALL_LISTINGS")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === "ALL_LISTINGS"
              ? "bg-amber-800 text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Tất cả tin bán ({allListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === "SETTINGS"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cấu hình website</span>
        </button>
      </div>

      {/* TAB 1: DUYỆT TIN RIÊNG TƯ (1-CLICK APPROVE) */}
      {activeTab === "PENDING" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900">
              Danh sách tin bán riêng tư chờ duyệt ({pendingListings.length})
            </h2>
            <span className="text-xs text-stone-500">
              Bấm &quot;Duyệt công khai ngay&quot; để đưa tin lên trang chủ
            </span>
          </div>

          {pendingListings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto mb-3">
                ✓
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">
                Không có tin nào đang chờ duyệt
              </h3>
              <p className="text-xs text-stone-500">
                Toàn bộ tin bán từ người dùng đã được xử lý xong.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pendingListings.map((item) => (
                <div key={item.id} className="relative">
                  <ListingCard
                    listing={item}
                    showAdminActions={true}
                    onApprove={handleApprove}
                    onDelete={handleDeleteListing}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUẢN LÝ TẤT CẢ TIN BÁN */}
      {activeTab === "ALL_LISTINGS" && (
        <div>
          {/* Ô tìm kiếm nhanh cho Admin */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tiêu đề tin, giống bò, số điện thoại người bán..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAllListings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                showAdminActions={true}
                onApprove={handleApprove}
                onDelete={handleDeleteListing}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CẤU HÌNH WEBSITE SÀN BÒ GIỐNG */}
      {activeTab === "SETTINGS" && (
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 max-w-3xl shadow-xs">
          <h2 className="text-lg font-bold text-stone-900 mb-2">
            Cấu hình chung sàn Bò Giống Miền Bắc
          </h2>
          <p className="text-xs text-stone-500 mb-6">
            Thay đổi tên sàn, hotline liên hệ, Zalo và thanh thông báo chạy đầu trang.
          </p>

          {settingsSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm p-3.5 rounded-xl flex items-center space-x-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã lưu cấu hình website thành công!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tên sàn giao dịch
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Khẩu hiệu / Slogan sàn
              </label>
              <input
                type="text"
                value={settings.site_slogan}
                onChange={(e) => setSettings({ ...settings, site_slogan: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Hotline hỗ trợ toàn quốc
                </label>
                <input
                  type="text"
                  value={settings.hotline}
                  onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-amber-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Số Zalo Quản trị viên
                </label>
                <input
                  type="text"
                  value={settings.zalo_admin}
                  onChange={(e) => setSettings({ ...settings, zalo_admin: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-sky-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nội dung thanh thông báo đầu trang (Notice banner)
              </label>
              <input
                type="text"
                value={settings.notice_banner}
                onChange={(e) => setSettings({ ...settings, notice_banner: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? "Đang lưu cấu hình..." : "Lưu cài đặt"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
