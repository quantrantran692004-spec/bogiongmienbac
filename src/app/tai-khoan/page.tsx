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
  ShieldAlert,
  Clock,
  CheckCircle,
  TrendingUp,
  LogOut,
  Edit3,
} from "lucide-react";

export default function TaiKhoanPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"ALL" | "PRIVATE" | "SELLING" | "SOLD">("ALL");

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
    if (!confirm("Bạn có chắc chắn muốn xóa tin bán bò này?")) return;
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
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-28 bg-stone-200 rounded-3xl mb-6" />
        <div className="h-10 bg-stone-200 rounded-xl mb-4 w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-64 bg-stone-200 rounded-2xl" />
          <div className="h-64 bg-stone-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const filteredListings = listings.filter((item) => {
    if (filterTab === "PRIVATE") return item.visibility === "PRIVATE";
    if (filterTab === "SELLING") return item.visibility === "PUBLIC" && item.status === "SELLING";
    if (filterTab === "SOLD") return item.status === "SOLD";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Thẻ Hồ Sơ Người Bán */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-800 text-white flex items-center justify-center text-2xl font-black shadow-md">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "🐂"}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                  {user?.fullName || "Người Nuôi Bò"}
                </h1>
                {user?.role === "ADMIN" && (
                  <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                    Quản trị viên
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-stone-500 mt-1">
                <Phone className="w-4 h-4 text-stone-400" />
                <span>Số điện thoại: <strong>{user?.phone}</strong></span>
                {user?.zaloNumber && (
                  <span className="text-stone-400">• Zalo: {user.zaloNumber}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Link
              href="/dang-tin"
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng tin bán mới</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2.5 text-stone-500 hover:text-red-700 hover:bg-red-50 border border-stone-300 rounded-xl transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Phân Loại Tin Bán */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs sm:text-sm">
        <button
          onClick={() => setFilterTab("ALL")}
          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
            filterTab === "ALL"
              ? "bg-amber-800 text-white shadow-xs"
              : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
          }`}
        >
          Tất cả tin ({listings.length})
        </button>

        <button
          onClick={() => setFilterTab("PRIVATE")}
          className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center space-x-1 ${
            filterTab === "PRIVATE"
              ? "bg-rose-700 text-white shadow-xs"
              : "bg-white border border-stone-200 text-rose-800 hover:bg-stone-50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Chờ duyệt ({listings.filter((l) => l.visibility === "PRIVATE").length})</span>
        </button>

        <button
          onClick={() => setFilterTab("SELLING")}
          className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center space-x-1 ${
            filterTab === "SELLING"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white border border-stone-200 text-emerald-800 hover:bg-stone-50"
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Đang bán ({listings.filter((l) => l.visibility === "PUBLIC" && l.status === "SELLING").length})</span>
        </button>

        <button
          onClick={() => setFilterTab("SOLD")}
          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
            filterTab === "SOLD"
              ? "bg-stone-800 text-white shadow-xs"
              : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
          }`}
        >
          Đã bán ({listings.filter((l) => l.status === "SOLD").length})
        </button>
      </div>

      {/* Danh Sách Tin Bán Của Tôi */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center my-6">
          <p className="text-stone-500 text-sm mb-4">
            Bạn chưa có tin bán bò nào trong mục này.
          </p>
          <Link
            href="/dang-tin"
            className="inline-flex items-center space-x-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Đăng tin bán ngay</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredListings.map((item) => (
            <div key={item.id} className="relative flex flex-col">
              <ListingCard
                listing={item}
                showAdminActions={true}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteListing}
              />

              {/* Nút Điều Chỉnh Giá Nhanh Cho Người Bán */}
              <div className="bg-stone-100 rounded-b-2xl border-x border-b border-stone-200 p-3 -mt-2">
                {editingPriceListingId === item.id ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700">
                      Nhập giá mới (VNĐ):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPriceInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setNewPriceInput(val ? Number(val).toLocaleString("vi-VN") : "");
                        }}
                        placeholder="VD: 30.000.000"
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-bold text-amber-900"
                      />
                      <button
                        onClick={() => handleUpdatePrice(item)}
                        disabled={updatingPrice}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg"
                      >
                        {updatingPrice ? "Lưu..." : "Lưu"}
                      </button>
                      <button
                        onClick={() => setEditingPriceListingId(null)}
                        className="px-2 py-1.5 text-stone-600 hover:bg-stone-200 text-xs rounded-lg"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingPriceListingId(item.id);
                      setNewPriceInput(item.priceAmount ? String(item.priceAmount) : "");
                    }}
                    className="w-full text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center justify-center space-x-1.5 py-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Cập nhật / Sửa giá bán bò này</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
