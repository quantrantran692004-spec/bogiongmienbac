"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ListingItem, ListingFilterParams } from "@/types";
import ListingCard from "@/components/ListingCard";
import ListingFilterBar from "@/components/ListingFilterBar";
import { PlusCircle, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListingFilterParams>({});

  const fetchListings = useCallback(async (currentFilters: ListingFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (currentFilters.search) searchParams.set("search", currentFilters.search);
      if (currentFilters.breed) searchParams.set("breed", currentFilters.breed);
      if (currentFilters.province) searchParams.set("province", currentFilters.province);
      if (currentFilters.priceType) searchParams.set("priceType", currentFilters.priceType);
      if (currentFilters.weightMin !== undefined) searchParams.set("weightMin", String(currentFilters.weightMin));
      if (currentFilters.weightMax !== undefined) searchParams.set("weightMax", String(currentFilters.weightMax));

      const res = await fetch(`/api/listings?${searchParams.toString()}`);
      if (!res.ok) {
        throw new Error("Không thể tải danh sách tin bán");
      }
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err: unknown) {
      console.error("Error fetching listings:", err);
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  const handleFilterChange = (newFilters: ListingFilterParams) => {
    setFilters(newFilters);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Banner Giới thiệu Tinh Gọn — Không chiếm nhiều diện tích, màu sắc thanh lịch */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-2xl p-5 sm:p-6 mb-5 shadow-xs border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/15 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-md mb-2 border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Sàn Giao Dịch Bò Giống & Bò Thịt Miền Bắc</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
              Mua Bán Bò Giống, Bò Thịt Trực Tiếp Từ Trại
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Kết nối trực tiếp hộ chăn nuôi và trang trại Ba Vì, Vĩnh Phúc, Bắc Giang, Phú Thọ.
              Hình ảnh thực tế không cắt cúp, giá minh bạch, kiểm duyệt an toàn trước khi công khai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/dang-tin"
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng tin bán đàn bò</span>
            </Link>

            <a
              href="tel:0368283539"
              className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 text-stone-200 font-medium text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-colors border border-white/15"
            >
              <span>Hotline: 0368.283.539</span>
            </a>
          </div>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Bộ Lọc Nhanh */}
      <ListingFilterBar initialParams={filters} onFilterChange={handleFilterChange} />

      {/* Thanh Tiêu Đề Danh Sách & Số Lượng */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900">
            {filters.breed || "Danh sách bò đang bán công khai"}
          </h2>
          <p className="text-xs text-stone-500">
            {loading ? "Đang tìm kiếm..." : `Tìm thấy ${listings.length} tin bán phù hợp`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchListings(filters)}
          className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center space-x-1 py-1 px-2.5 rounded-lg hover:bg-stone-100 transition-colors"
          title="Làm mới danh sách"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Báo lỗi nếu có */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center space-x-3 mb-5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div className="flex-1 text-xs sm:text-sm font-medium">{error}</div>
          <button
            type="button"
            onClick={() => fetchListings(filters)}
            className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold px-3 py-1.5 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && listings.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden p-4 flex flex-col sm:flex-row gap-4 animate-pulse"
            >
              <div className="w-full sm:w-64 h-48 bg-stone-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-200 rounded w-1/2" />
                <div className="h-12 bg-stone-100 rounded-xl" />
                <div className="h-8 bg-stone-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DANH SÁCH TIN BÁN BÒ DẠNG THẺ NGANG (ẢNH MỘT BÊN, THÔNG TIN MỘT BÊN) */}
      {!loading && listings.length > 0 && (
        <div className="space-y-4">
          {listings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      )}

      {/* Trạng thái không tìm thấy kết quả (Empty State) */}
      {!loading && listings.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center max-w-md mx-auto my-6">
          <h3 className="text-base font-bold text-stone-900 mb-1">
            Không tìm thấy tin bán bò phù hợp
          </h3>
          <p className="text-xs text-stone-500 mb-5 leading-relaxed">
            Hiện chưa có tin bán nào phù hợp với bộ lọc bạn đã chọn. Hãy thử tìm từ khóa khác hoặc bỏ bớt tiêu chí lọc.
          </p>
          <button
            type="button"
            onClick={() => handleFilterChange({})}
            className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-2xs"
          >
            Xem tất cả tin bán bò
          </button>
        </div>
      )}
    </div>
  );
}
