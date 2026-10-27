"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ListingItem } from "@/types";
import FeaturedListingCard from "@/components/FeaturedListingCard";
import {
  Search,
  ShieldCheck,
  Headphones,
  Zap,
  Award,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  PlusCircle,
  Sparkles,
} from "lucide-react";

const BREED_CATEGORIES = [
  {
    id: "all",
    name: "Tất cả giống",
    breedQuery: "",
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "3b",
    name: "Bò 3B (BBB)",
    breedQuery: "Bò 3B (Blanc Bleu Belge)",
    imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "brahman",
    name: "Bò Brahman",
    breedQuery: "Bò Brahman",
    imageUrl: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "sind",
    name: "Bò Red Sindhi",
    breedQuery: "Bò Sind (Red Sindhi)",
    imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "angus",
    name: "Bò Angus Đen",
    breedQuery: "Bò Angus",
    imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "lai",
    name: "Bò Lai F1 / F2",
    breedQuery: "Bò Lai Vàng",
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=300&q=80",
  },
];

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    title: "Giao dịch an toàn",
    desc: "Thông tin minh bạch, rõ ràng",
    color: "text-emerald-700 bg-emerald-50 border-emerald-150",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ tận tâm",
    desc: "Đồng hành cùng nhà nông",
    color: "text-amber-700 bg-amber-50 border-amber-150",
  },
  {
    icon: Zap,
    title: "Kết nối nhanh",
    desc: "Trực tiếp qua SĐT, Zalo",
    color: "text-blue-700 bg-blue-50 border-blue-150",
  },
  {
    icon: Award,
    title: "Uy tín hàng đầu",
    desc: "Nguồn giống tuyển chọn",
    color: "text-teal-700 bg-teal-50 border-teal-150",
  },
];

export default function HomePage() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<string>("");

  const fetchListings = useCallback(async (breed: string = "", search: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (breed) searchParams.set("breed", breed);
      if (search) searchParams.set("search", search);

      const res = await fetch(`/api/listings?${searchParams.toString()}`);
      if (!res.ok) {
        throw new Error("Không thể tải danh sách bò");
      }
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err: unknown) {
      console.error("Error fetching listings:", err);
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(selectedBreed, searchKeyword);
  }, [selectedBreed, fetchListings]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(selectedBreed, searchKeyword);
  };

  const handleBreedClick = (breedQuery: string) => {
    setSelectedBreed(breedQuery);
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* 1. THANH TÌM KIẾM DẠNG VIÊN THUỐC (PILL SEARCH BAR) - ĐÚNG MẪU 1 */}
      <section className="bg-white border-b border-gray-100 py-3 sm:py-4 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm giống bò, khu vực Ba Vì, Vĩnh Phúc, Hà Nội..."
                className="w-full pl-12 pr-28 py-3 bg-stone-50 hover:bg-stone-100/80 focus:bg-white text-stone-900 placeholder-stone-400 text-sm rounded-full border border-stone-200 focus:border-[#056839] focus:outline-none focus:ring-2 focus:ring-[#056839]/20 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#056839] hover:bg-[#04522d] text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* 2. HERO BANNER PHONG CẢNH THIÊN NHIÊN + NÚT VÀNG HỔ PHÁCH "KHÁM PHÁ NGAY ->" */}
        <section className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200 min-h-[300px] sm:min-h-[340px] flex items-center">
          {/* Nền phong cảnh đồi núi bãi cỏ xanh mát mẻ */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1920&q=85')`,
            }}
          >
            {/* Lớp phủ chuyển sắc để chữ màu trắng nổi bật rõ nét */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-900/70 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-2xl text-white">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sàn Giao Dịch Bò Giống Hàng Đầu Miền Bắc</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
              BÒ GIỐNG CHẤT LƯỢNG <br />
              <span className="text-amber-400">PHÁT TRIỂN BỀN VỮNG</span>
            </h1>

            <p className="text-stone-200 text-xs sm:text-sm md:text-base leading-relaxed mb-6 max-w-xl font-normal">
              Nền tảng kết nối trực tiếp hộ chăn nuôi và trang trại uy tín khắp Ba Vì, Vĩnh Phúc, Bắc Giang, Phú Thọ.
              Mua bán minh bạch, ảnh thực tế rõ nét, không qua trung gian.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/danh-sach-bo"
                className="inline-flex items-center space-x-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:scale-102 active:scale-98"
              >
                <span>Khám phá ngay</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <Link
                href="/dang-tin"
                className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-5 py-3 rounded-xl backdrop-blur-sm border border-white/30 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Đăng tin bán</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. HÀNG 4 TRUST BADGES (GIAO DỊCH AN TOÀN, HỖ TRỢ TẬN TÂM, KẾT NỐI NHANH, UY TÍN HÀNG ĐẦU) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {TRUST_BADGES.map((badge, idx) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center space-x-3.5 hover:shadow-xs transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${badge.color}`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* 4. DẢI TRÒN CHỌN NHANH GIỐNG BÒ (CATEGORIES) */}
        <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-base sm:text-lg text-gray-900">
                Danh Mục Giống Bò Tiêu Biểu
              </h3>
              <p className="text-xs text-gray-500">
                Chọn giống bò bạn quan tâm để xem danh sách tin bán chi tiết
              </p>
            </div>

            {selectedBreed && (
              <button
                type="button"
                onClick={() => setSelectedBreed("")}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                Xem tất cả
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {BREED_CATEGORIES.map((cat) => {
              const isSelected = selectedBreed === cat.breedQuery;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleBreedClick(cat.breedQuery)}
                  className={`flex flex-col items-center p-2.5 rounded-2xl transition-all text-center group ${
                    isSelected
                      ? "bg-emerald-50 ring-2 ring-[#056839]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-stone-200 group-hover:border-[#056839] group-hover:scale-105 transition-all shadow-2xs mb-2">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`text-xs font-bold transition-colors ${
                      isSelected
                        ? "text-[#056839]"
                        : "text-gray-700 group-hover:text-[#056839]"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. LƯỚI TIN ĐĂNG NỔI BẬT (FEATURED LISTINGS) - ĐÚNG MẪU 1 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-6 bg-[#056839] rounded-full inline-block" />
                <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                  {selectedBreed ? `Tin Bán: ${selectedBreed}` : "Tin Đăng Bò Giống Nổi Bật"}
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-4.5">
                {loading
                  ? "Đang tìm kiếm tin bán..."
                  : `Có ${listings.length} tin bán bò sẵn sàng giao dịch`}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => fetchListings(selectedBreed, searchKeyword)}
                className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center space-x-1 p-1 rounded-md"
                title="Làm mới"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>

              <Link
                href="/danh-sach-bo"
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#056839] hover:text-[#04522d] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Lỗi nếu có */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <div className="flex-1 text-xs sm:text-sm font-medium">{error}</div>
              <button
                type="button"
                onClick={() => fetchListings(selectedBreed, searchKeyword)}
                className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold px-3 py-1.5 rounded-lg"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Skeletons khi tải */}
          {loading && listings.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-gray-100 p-3 animate-pulse space-y-3"
                >
                  <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Grid Tin Nổi Bật Dùng FeaturedListingCard */}
          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((item) => (
                <FeaturedListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && listings.length === 0 && !error && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center max-w-md mx-auto my-6 shadow-2xs">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Chưa có tin bán nào phù hợp
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Hãy thử chọn giống bò khác hoặc tìm kiếm với từ khóa địa bàn như Ba Vì, Vĩnh Phúc, Phú Thọ.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBreed("");
                  setSearchKeyword("");
                  fetchListings("", "");
                }}
                className="px-5 py-2.5 bg-[#056839] hover:bg-[#04522d] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-2xs"
              >
                Xem tất cả tin bán bò
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
