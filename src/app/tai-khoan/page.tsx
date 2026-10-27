"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListingItem, UserSession } from "@/types";
import { formatPriceDisplay } from "@/lib/format";
import ListingCard from "@/components/ListingCard";
import {
  User,
  PlusCircle,
  Phone,
  Clock,
  CheckCircle,
  TrendingUp,
  LogOut,
  Edit3,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  ChevronRight,
  Eye,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import CattleLogoIcon from "@/components/icons/CattleLogoIcon";

export default function TaiKhoanPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"LISTINGS" | "PROFILE" | "SETTINGS">("LISTINGS");
  const [filterTab, setFilterTab] = useState<"ALL" | "SELLING" | "SOLD">("ALL");

  // State cập nhật giá nhanh
  const [editingPriceListingId, setEditingPriceListingId] = useState<string | null>(null);
  const [newPriceInput, setNewPriceInput] = useState("");
  const [updatingPrice, setUpdatingPrice] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      if (!authData.user) {
        router.push("/dang-nhap");
        return;
      }
      setUser(authData.user);

      // Tải tin bán của người này
      const listRes = await fetch(`/api/listings?myListings=true`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setListings(listData.listings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleStatusChange = async (id: string, status: "SELLING" | "SOLD" | "HIDDEN") => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin bán bò này không?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setListings((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePrice = async (listing: ListingItem) => {
    if (!newPriceInput.trim()) return;
    const cleanNum = parseFloat(newPriceInput.replace(/\D/g, ""));
    if (isNaN(cleanNum)) return;

    setUpdatingPrice(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceAmount: cleanNum }),
      });
      if (res.ok) {
        const data = await res.json();
        setListings((prev) =>
          prev.map((item) =>
            item.id === listing.id
              ? {
                  ...item,
                  priceAmount: cleanNum,
                  priceHistories: data.listing.priceHistories || item.priceHistories,
                }
              : item
          )
        );
        setEditingPriceListingId(null);
        setNewPriceInput("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded-xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-72 bg-gray-200 rounded-2xl" />
          <div className="md:col-span-3 h-96 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const sellingCount = listings.filter((l) => l.status === "SELLING").length;
  const soldCount = listings.filter((l) => l.status === "SOLD").length;

  const filteredListings = listings.filter((item) => {
    if (filterTab === "SELLING") return item.status === "SELLING";
    if (filterTab === "SOLD") return item.status === "SOLD";
    return true;
  });

  return (
    <div className="bg-stone-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#056839]">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-semibold">Quản lý tài khoản</span>
        </div>

        {/* BỐ CỤC 2 CỘT MÀN 6: SIDEBAR QUẢN LÝ BÊN TRÁI & NỘI DUNG BÊN PHẢI */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: SIDEBAR THỰC THỂ NGƯỜI BÁN (3-4 CỘT) */}
          <aside className="md:col-span-4 lg:col-span-3 space-y-4">
            {/* Thẻ Avatar & Thông tin cá nhân */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#056839] border-2 border-emerald-300 flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-2xs">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "B"}
              </div>
              <h2 className="font-black text-base text-gray-900 truncate">
                {user?.fullName || "Người Nuôi Bò"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">SĐT: {user?.phone}</p>
              {user?.zaloNumber && (
                <p className="text-[11px] text-[#0068ff] font-medium mt-0.5">
                  Zalo: {user.zaloNumber}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
                <Link
                  href="/dang-tin"
                  className="w-full py-2 px-3 bg-[#056839] hover:bg-[#04522d] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Đăng tin bán mới</span>
                </Link>
              </div>
            </div>

            {/* Menu điều hướng Quản lý */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-2xs space-y-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveSidebarTab("LISTINGS")}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                  activeSidebarTab === "LISTINGS"
                    ? "bg-emerald-50 text-[#056839] font-bold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Quản lý tin bán ({listings.length})</span>
              </button>

              <Link
                href="/chat"
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Tin nhắn khách hàng</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveSidebarTab("PROFILE")}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                  activeSidebarTab === "PROFILE"
                    ? "bg-emerald-50 text-[#056839] font-bold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Thông tin tài khoản</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>

          {/* CỘT PHẢI: BẢNG ĐIỀU KHIỂN & DANH SÁCH TIN (8-9 CỘT) */}
          <main className="md:col-span-8 lg:col-span-9 space-y-5">
            {/* Hàng Thống kê (Stats Cards) đúng Màn 6 */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Tổng số tin</span>
                <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                  {listings.length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">Đang bán</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
                  {sellingCount}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Đã bán</span>
                <div className="text-xl sm:text-2xl font-black text-gray-800 mt-1">
                  {soldCount}
                </div>
              </div>
            </div>

            {/* Thanh Tab Bộ Lọc Trạng Thái Tin */}
            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterTab("ALL")}
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    filterTab === "ALL"
                      ? "bg-[#056839] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Tất cả ({listings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("SELLING")}
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    filterTab === "SELLING"
                      ? "bg-[#056839] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Đang bán ({sellingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("SOLD")}
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    filterTab === "SOLD"
                      ? "bg-[#056839] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Đã bán ({soldCount})
                </button>
              </div>

              <Link
                href="/dang-tin"
                className="hidden sm:inline-flex items-center space-x-1 text-xs font-bold text-[#056839] bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Thêm tin</span>
              </Link>
            </div>

            {/* Danh sách các tin bán dạng Thẻ Ngang kèm công cụ sửa giá */}
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center shadow-2xs">
                <h3 className="font-bold text-base text-gray-900 mb-1">
                  Chưa có tin bán nào trong mục này
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                  Đăng tin bán ngay để đàn bò của bạn tiếp cận hàng ngàn người mua tiềm năng!
                </p>
                <Link
                  href="/dang-tin"
                  className="px-5 py-2.5 bg-[#056839] hover:bg-[#04522d] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Đăng tin bán ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
                    <ListingCard
                      listing={item}
                      showAdminActions={true}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteListing}
                    />

                    {/* Vùng Cập Nhật Nhanh Giá Bán */}
                    <div className="bg-gray-50/80 px-4 py-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {editingPriceListingId === item.id ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="font-semibold text-gray-700">Giá mới:</span>
                          <input
                            type="text"
                            value={newPriceInput}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setNewPriceInput(val ? Number(val).toLocaleString("vi-VN") : "");
                            }}
                            placeholder="VD: 32.000.000"
                            className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-[#d92d20]"
                          />
                          <button
                            onClick={() => handleUpdatePrice(item)}
                            disabled={updatingPrice}
                            className="px-3 py-1 bg-[#056839] hover:bg-[#04522d] text-white font-bold rounded-lg"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setEditingPriceListingId(null)}
                            className="px-2 py-1 text-gray-500 hover:text-gray-800"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceListingId(item.id);
                            setNewPriceInput(item.priceAmount ? String(item.priceAmount) : "");
                          }}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Điều chỉnh giá bán công khai</span>
                        </button>
                      )}

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/listing/${item.id}`}
                          className="text-gray-600 hover:text-[#056839] font-medium"
                        >
                          Xem chi tiết tin
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
