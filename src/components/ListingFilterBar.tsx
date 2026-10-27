"use client";

import { useState } from "react";
import { Search, Filter, RotateCcw, ChevronDown } from "lucide-react";
import { ListingFilterParams } from "@/types";

interface ListingFilterBarProps {
  initialParams?: ListingFilterParams;
  onFilterChange: (params: ListingFilterParams) => void;
}

const COMMON_BREEDS = [
  "Tất cả giống",
  "Bò 3B (Blanc Bleu Belge)",
  "Bò Brahman",
  "Bò Sind (Red Sindhi)",
  "Bò Angus đen",
  "Bò Vàng Việt Nam",
  "Bò Lai F1 / F2",
  "Bò Droughmaster",
];

const PROVINCES = [
  "Tất cả khu vực",
  "Ba Vì (Hà Nội)",
  "Hà Nội",
  "Vĩnh Phúc",
  "Bắc Giang",
  "Phú Thọ",
  "Thái Nguyên",
  "Hòa Bình",
  "Tuyên Quang",
  "Nam Định",
  "Ninh Bình",
  "Hải Dương",
  "Hưng Yên",
];

const WEIGHT_RANGES = [
  { label: "Mọi cân nặng", min: undefined, max: undefined },
  { label: "Dưới 200 kg (Bê giống)", min: undefined, max: 200 },
  { label: "200 - 350 kg (Bò lỡ)", min: 200, max: 350 },
  { label: "350 - 500 kg (Bò trưởng thành)", min: 350, max: 500 },
  { label: "Trên 500 kg (Bò đại/bò thịt)", min: 500, max: undefined },
];

export default function ListingFilterBar({
  initialParams = {},
  onFilterChange,
}: ListingFilterBarProps) {
  const [search, setSearch] = useState(initialParams.search || "");
  const [selectedBreed, setSelectedBreed] = useState(initialParams.breed || "");
  const [selectedProvince, setSelectedProvince] = useState(initialParams.province || "");
  const [priceType, setPriceType] = useState<string>(initialParams.priceType || "");
  const [selectedWeightIdx, setSelectedWeightIdx] = useState<number>(0);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleApply = (newBreed?: string) => {
    const breedVal = newBreed !== undefined ? newBreed : selectedBreed;
    const weightRange = WEIGHT_RANGES[selectedWeightIdx];

    onFilterChange({
      search: search.trim() || undefined,
      breed: breedVal === "Tất cả giống" || !breedVal ? undefined : breedVal,
      province: selectedProvince === "Tất cả khu vực" || !selectedProvince ? undefined : selectedProvince,
      priceType: priceType ? (priceType as "PER_HEAD" | "PER_HERD" | "NEGOTIABLE") : undefined,
      weightMin: weightRange?.min,
      weightMax: weightRange?.max,
    });
  };

  const handleReset = () => {
    setSearch("");
    setSelectedBreed("");
    setSelectedProvince("");
    setPriceType("");
    setSelectedWeightIdx(0);
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 shadow-xs mb-6">
      {/* Thanh tìm kiếm & Nút mở rộng */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Tìm kiếm: Bò 3B đực, Bê Brahman cái, bò thịt..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 text-sm sm:text-base font-medium"
          />
          <Search className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleApply()}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Tìm kiếm</span>
          </button>

          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`px-3.5 py-2.5 border rounded-xl font-medium text-sm flex items-center space-x-1 transition-colors ${
              isAdvancedOpen
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "border-stone-300 text-stone-700 hover:bg-stone-50"
            }`}
            title="Mở rộng bộ lọc"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
          </button>

          {(search || selectedBreed || selectedProvince || priceType || selectedWeightIdx > 0) && (
            <button
              onClick={handleReset}
              className="p-2.5 text-stone-500 hover:text-red-700 hover:bg-red-50 border border-stone-300 rounded-xl transition-colors"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dải chọn nhanh giống bò - Cuộn ngang trên mobile */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm">
        {COMMON_BREEDS.map((breed) => {
          const isSelected =
            (!selectedBreed && breed === "Tất cả giống") || selectedBreed === breed;
          return (
            <button
              key={breed}
              onClick={() => {
                const newBreed = breed === "Tất cả giống" ? "" : breed;
                setSelectedBreed(newBreed);
                handleApply(newBreed);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full font-medium transition-all ${
                isSelected
                  ? "bg-amber-800 text-white shadow-xs font-semibold"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {breed}
            </button>
          );
        })}
      </div>

      {/* Bộ lọc mở rộng (Khu vực, Cân nặng, Cách tính giá) */}
      {isAdvancedOpen && (
        <div className="mt-3 pt-3 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
          {/* Lọc Tỉnh / Thành */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Khu vực chăn nuôi
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
              }}
              className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
            >
              {PROVINCES.map((prov) => (
                <option key={prov} value={prov === "Tất cả khu vực" ? "" : prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Cân Nặng */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Cân nặng ước tính
            </label>
            <select
              value={selectedWeightIdx}
              onChange={(e) => {
                setSelectedWeightIdx(Number(e.target.value));
              }}
              className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
            >
              {WEIGHT_RANGES.map((range, idx) => (
                <option key={range.label} value={idx}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Cách Báo Giá */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Hình thức bán / Báo giá
            </label>
            <select
              value={priceType}
              onChange={(e) => {
                setPriceType(e.target.value);
              }}
              className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
            >
              <option value="">Tất cả hình thức</option>
              <option value="PER_HEAD">Bán theo con</option>
              <option value="PER_HERD">Bán cả đàn</option>
              <option value="NEGOTIABLE">Giá thương lượng</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              onClick={() => handleApply()}
              className="w-full sm:w-auto px-6 py-2 bg-stone-900 hover:bg-black text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
