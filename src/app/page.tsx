"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ListingItem, ListingFilterParams } from "@/types";
import ListingCard from "@/components/ListingCard";
import ListingFilterBar from "@/components/ListingFilterBar";
import { PlusCircle, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Banner Giới thiệu Nổi Bật Sàn Bò Giống */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-3xl p-5 sm:p-8 mb-6 shadow-md relative overflow-hidden">
        {/* Hình họa trang trí tinh tế */}
        <div className="absolute -right-10 -bottom-10 text-9xl opacity-15 select-none pointer-events-none">
          🐂
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 bg-amber-700/60 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sàn giao dịch bò giống lớn nhất miền Bắc</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3 leading-tight">
            Mua Bán Bò Giống & Bò Thịt Chất Lượng Cao
          </h1>

          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed mb-5">
            Kết nối trực tiếp bà con chăn nuôi, trang trại giống Ba Vì, Vĩnh Phúc, Bắc Giang, Phú Thọ.
            Hình ảnh video thực tế không che giấu, giá minh bạch, kiểm duyệt an toàn trước khi công khai.
          </p>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <Link
              href="/dang-tin"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng tin bán đàn bò</span>
            </Link>

            <a
              href="tel:0988888888"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-xl backdrop-blur-xs transition-colors border border-white/20"
            >
              <span>Hotline tư vấn: 0988.888.888</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bộ Lọc & Tìm Kiếm */}
      <ListingFilterBar initialParams={filters} onFilterChange={handleFilterChange} />

      {/* Tiêu đề phần danh sách & Số lượng */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            {filters.breed || "Danh sách bò đang bán công khai"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            {loading ? "Đang tìm kiếm..." : `Tìm thấy ${listings.length} tin bán phù hợp`}
          </p>
        </div>

        <button
          onClick={() => fetchListings(filters)}
          className="text-xs sm:text-sm font-medium text-amber-800 hover:text-amber-950 flex items-center space-x-1 p-1.5 rounded-md hover:bg-amber-50 transition-colors"
          title="Làm mới danh sách"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Trạng thái lỗi */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center space-x-3 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <div className="flex-1 text-sm font-medium">{error}</div>
          <button
            onClick={() => fetchListings(filters)}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-900 font-bold px-3 py-1.5 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && listings.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden p-3 animate-pulse"
            >
              <div className="w-full aspect-[4/3] bg-stone-200 rounded-xl mb-3" />
              <div className="h-5 bg-stone-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-stone-200 rounded w-1/2 mb-4" />
              <div className="h-10 bg-stone-100 rounded-lg mb-3" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-stone-200 rounded" />
                <div className="h-8 bg-stone-200 rounded" />
                <div className="h-8 bg-stone-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Danh sách tin bò */}
      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {listings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      )}

      {/* Trạng thái không tìm thấy tin nào (Empty State) */}
      {!loading && listings.length === 0 && !error && (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center text-4xl mx-auto mb-4">
            🐂
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">
            Không tìm thấy tin bán bò phù hợp
          </h3>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            Hiện chưa có tin bán nào phù hợp với bộ lọc đã chọn. Hãy thử tìm từ khóa khác hoặc đặt lại bộ lọc.
          </p>
          <button
            onClick={() => handleFilterChange({})}
            className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
          >
            Xem tất cả tin bán bò
          </button>
        </div>
      )}
    </div>
  );
}
