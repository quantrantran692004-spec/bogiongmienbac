"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ListingItem, ListingFilterParams } from "@/types";
import ListingCard from "@/components/ListingCard";
import {
  Filter,
  RefreshCw,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  MapPin,
  Scale,
  DollarSign,
  Tag,
} from "lucide-react";

const BREED_OPTIONS = [
  "Tất cả giống",
  "Bò 3B (Blanc Bleu Belge)",
  "Bò Sind (Red Sindhi)",
  "Bò Brahman",
  "Bò Angus",
  "Bò Vàng Việt Nam",
  "Bò Lai F1",
  "Khác",
];

const PROVINCE_OPTIONS = [
  "Tất cả tỉnh thành",
  "Hà Nội",
  "Ba Vì (Hà Nội)",
  "Vĩnh Phúc",
  "Bắc Giang",
  "Phú Thọ",
  "Thái Nguyên",
  "Tuyên Quang",
  "Hòa Bình",
  "Hưng Yên",
];

const PRICE_RANGES = [
  { label: "Tất cả mức giá", min: undefined, max: undefined },
  { label: "Dưới 15 triệu", min: 0, max: 15000000 },
  { label: "15 - 25 triệu", min: 15000000, max: 25000000 },
  { label: "25 - 40 triệu", min: 25000000, max: 40000000 },
  { label: "Trên 40 triệu", min: 40000000, max: undefined },
];

const WEIGHT_RANGES = [
  { label: "Tất cả cân nặng", min: undefined, max: undefined },
  { label: "Dưới 150 kg", min: 0, max: 150 },
  { label: "150 - 300 kg", min: 150, max: 300 },
  { label: "300 - 500 kg", min: 300, max: 500 },
  { label: "Trên 500 kg", min: 500, max: undefined },
];

function ListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedBreed, setSelectedBreed] = useState(searchParams.get("breed") || "Tất cả giống");
  const [selectedProvince, setSelectedProvince] = useState(searchParams.get("province") || "Tất cả tỉnh thành");
  const [selectedPriceIdx, setSelectedPriceIdx] = useState(0);
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);
  const [sortBy, setSortBy] = useState<"NEWEST" | "PRICE_ASC" | "PRICE_DESC">("NEWEST");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedBreed !== "Tất cả giống") params.set("breed", selectedBreed);
      if (selectedProvince !== "Tất cả tỉnh thành") params.set("province", selectedProvince);

      const priceRange = PRICE_RANGES[selectedPriceIdx];
      if (priceRange.min !== undefined) params.set("priceMin", String(priceRange.min));
      if (priceRange.max !== undefined) params.set("priceMax", String(priceRange.max));

      const weightRange = WEIGHT_RANGES[selectedWeightIdx];
      if (weightRange.min !== undefined) params.set("weightMin", String(weightRange.min));
      if (weightRange.max !== undefined) params.set("weightMax", String(weightRange.max));

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (!res.ok) throw new Error("Không thể tải danh sách bò");
      const data = await res.json();
      let result = data.listings || [];

      // Client sort if needed
      if (sortBy === "PRICE_ASC") {
        result = [...result].sort((a, b) => (a.priceAmount || 0) - (b.priceAmount || 0));
      } else if (sortBy === "PRICE_DESC") {
        result = [...result].sort((a, b) => (b.priceAmount || 0) - (a.priceAmount || 0));
      }

      setListings(result);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [search, selectedBreed, selectedProvince, selectedPriceIdx, selectedWeightIdx, sortBy]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedBreed("Tất cả giống");
    setSelectedProvince("Tất cả tỉnh thành");
    setSelectedPriceIdx(0);
    setSelectedWeightIdx(0);
    setSortBy("NEWEST");
  };

  return (
    <div className="bg-stone-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb đúng Màn 2 */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#056839]">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-semibold">Danh sách bò đang bán</span>
        </div>

        {/* Thanh tìm kiếm nhanh trên cùng */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tiêu đề, giống bò, địa điểm..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#056839]"
              />
            </div>

            <button
              type="button"
              onClick={fetchListings}
              className="px-6 py-2.5 bg-[#056839] hover:bg-[#04522d] text-white text-sm font-semibold rounded-xl transition-colors shadow-2xs"
            >
              Tìm kiếm
            </button>

            {/* Nút mở filter trên Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="sm:hidden flex items-center justify-center space-x-1.5 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        {/* BỐ CỤC 2 CỘT CHUẨN MÀN 2: CỘT TRÁI FILTER SIDEBAR, CỘT PHẢI DANH SÁCH THẺ NGANG */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* CỘT TRÁI: SIDEBAR BỘ LỌC (Desktop & Mobile Dropdown) */}
          <aside
            className={`lg:block bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-6 ${
              isMobileFilterOpen ? "block" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#056839]" />
                <h3 className="font-black text-sm text-gray-900">Bộ Lọc Tìm Kiếm</h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* 1. Lọc theo Giống bò */}
            <div>
              <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                <Tag className="w-3.5 h-3.5 text-[#056839]" />
                <span>Giống bò</span>
              </label>
              <div className="space-y-1.5">
                {BREED_OPTIONS.map((breed) => (
                  <label
                    key={breed}
                    className="flex items-center space-x-2 text-xs text-gray-700 hover:text-[#056839] cursor-pointer py-0.5"
                  >
                    <input
                      type="radio"
                      name="breed"
                      value={breed}
                      checked={selectedBreed === breed}
                      onChange={() => setSelectedBreed(breed)}
                      className="accent-[#056839] w-3.5 h-3.5"
                    />
                    <span className={selectedBreed === breed ? "font-bold text-[#056839]" : ""}>
                      {breed}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Lọc theo Khoảng giá */}
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                <DollarSign className="w-3.5 h-3.5 text-[#056839]" />
                <span>Khoảng giá</span>
              </label>
              <div className="space-y-1.5">
                {PRICE_RANGES.map((range, idx) => (
                  <label
                    key={range.label}
                    className="flex items-center space-x-2 text-xs text-gray-700 hover:text-[#056839] cursor-pointer py-0.5"
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceIdx === idx}
                      onChange={() => setSelectedPriceIdx(idx)}
                      className="accent-[#056839] w-3.5 h-3.5"
                    />
                    <span className={selectedPriceIdx === idx ? "font-bold text-[#056839]" : ""}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Lọc theo Cân nặng */}
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                <Scale className="w-3.5 h-3.5 text-[#056839]" />
                <span>Cân nặng (kg)</span>
              </label>
              <div className="space-y-1.5">
                {WEIGHT_RANGES.map((range, idx) => (
                  <label
                    key={range.label}
                    className="flex items-center space-x-2 text-xs text-gray-700 hover:text-[#056839] cursor-pointer py-0.5"
                  >
                    <input
                      type="radio"
                      name="weightRange"
                      checked={selectedWeightIdx === idx}
                      onChange={() => setSelectedWeightIdx(idx)}
                      className="accent-[#056839] w-3.5 h-3.5"
                    />
                    <span className={selectedWeightIdx === idx ? "font-bold text-[#056839]" : ""}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Lọc theo Khu vực tỉnh thành */}
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#056839]" />
                <span>Khu vực tỉnh thành</span>
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-800 focus:bg-white focus:outline-none focus:border-[#056839]"
              >
                {PROVINCE_OPTIONS.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                fetchListings();
                setIsMobileFilterOpen(false);
              }}
              className="w-full py-2.5 bg-[#056839] hover:bg-[#04522d] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Áp dụng bộ lọc
            </button>
          </aside>

          {/* CỘT PHẢI: DANH SÁCH THẺ TIN DẠNG NGANG (HORIZONTAL CARDS) */}
          <main className="lg:col-span-3 space-y-4">
            {/* Header thanh công cụ & Sắp xếp */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-black text-base sm:text-lg text-gray-900">
                  {selectedBreed !== "Tất cả giống" ? selectedBreed : "Bò Giống Miền Bắc"}
                </h1>
                <p className="text-xs text-gray-500">
                  {loading
                    ? "Đang tìm kiếm tin..."
                    : `Tìm thấy ${listings.length} tin bán phù hợp`}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 shrink-0">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "NEWEST" | "PRICE_ASC" | "PRICE_DESC")}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2.5 text-gray-800 focus:outline-none focus:border-[#056839] font-medium"
                >
                  <option value="NEWEST">Mới đăng nhất</option>
                  <option value="PRICE_ASC">Giá: Thấp đến cao</option>
                  <option value="PRICE_DESC">Giá: Cao đến thấp</option>
                </select>

                <button
                  type="button"
                  onClick={fetchListings}
                  className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <div className="flex-1 text-xs sm:text-sm font-medium">{error}</div>
                <button
                  type="button"
                  onClick={fetchListings}
                  className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold px-3 py-1.5 rounded-lg"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Skeletons khi tải */}
            {loading && listings.length === 0 && (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 animate-pulse"
                  >
                    <div className="w-full sm:w-64 h-48 bg-gray-200 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-10 bg-gray-100 rounded-xl" />
                      <div className="h-8 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DANH SÁCH TIN BÁN DẠNG THẺ NGANG BÁM SÁT MÀN 2 */}
            {!loading && listings.length > 0 && (
              <div className="space-y-4">
                {listings.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            )}

            {/* Empty state khi không có tin */}
            {!loading && listings.length === 0 && !error && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md mx-auto my-8">
                <h3 className="font-bold text-base text-gray-900 mb-1">
                  Không tìm thấy tin bán phù hợp
                </h3>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  Hiện chưa có tin bán nào phù hợp với bộ lọc bạn chọn. Vui lòng thử nới lỏng khoảng giá hoặc chọn tất cả giống bò.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-[#056839] hover:bg-[#04522d] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ListingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Đang tải trang...</div>}>
      <ListingContent />
    </Suspense>
  );
}
