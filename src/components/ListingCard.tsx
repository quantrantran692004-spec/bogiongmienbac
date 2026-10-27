"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone, MessageCircle, MessageSquare, MapPin, Scale, Eye, Play } from "lucide-react";
import { ListingItem } from "@/types";
import { formatPriceDisplay, formatWeight, getTelLink, getZaloLink } from "@/lib/format";
import MediaViewerModal from "./MediaViewerModal";

interface ListingCardProps {
  listing: ListingItem;
  showAdminActions?: boolean;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: "SELLING" | "SOLD" | "HIDDEN") => void;
}

export default function ListingCard({
  listing,
  showAdminActions = false,
  onApprove,
  onDelete,
  onStatusChange,
}: ListingCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

  const coverMedia = listing.media?.find((m) => m.isCover) || listing.media?.[0];
  const hasVideo = listing.media?.some((m) => m.fileType === "VIDEO");
  const mediaCount = listing.media?.length || 0;

  const handleOpenViewer = (e: React.MouseEvent, idx: number = 0) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedMediaIdx(idx);
    setIsViewerOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group">
        <div>
          {/* Vùng hiển thị ảnh bảo toàn hình dáng trọn vẹn (Không cắt cúp làm mất đầu, thân hoặc chân) */}
          <div className="relative w-full aspect-[4/3] bg-stone-900 overflow-hidden cursor-pointer">
            {coverMedia ? (
              <>
                {/* Lớp nền mờ (Blurred Backdrop) từ chính ảnh gốc */}
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110 opacity-40"
                  style={{ backgroundImage: `url(${coverMedia.fileUrl})` }}
                  aria-hidden="true"
                />

                {/* Lớp ảnh chính hiển thị trọn vẹn 100% bằng object-contain */}
                <img
                  src={coverMedia.fileUrl}
                  alt={listing.title}
                  className="relative z-10 w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
                  onClick={(e) => handleOpenViewer(e, 0)}
                  loading="lazy"
                />

                {/* Nút biểu tượng phát video nếu là video */}
                {coverMedia.fileType === "VIDEO" && (
                  <button
                    onClick={(e) => handleOpenViewer(e, 0)}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 hover:bg-black/35 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-600/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 ml-0.5 fill-white" />
                    </div>
                  </button>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
                <span className="text-4xl mb-1">🐂</span>
                <span className="text-xs">Chưa có ảnh</span>
              </div>
            )}

            {/* Badge Giống Bò & Số lượng */}
            <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap gap-1.5">
              <span className="bg-amber-900/90 backdrop-blur-xs text-amber-50 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
                {listing.breed}
              </span>
              <span className="bg-stone-900/80 backdrop-blur-xs text-stone-100 text-xs font-medium px-2 py-1 rounded-md shadow-xs">
                SL: {listing.quantity} con
              </span>
            </div>

            {/* Badge Riêng tư / Chờ duyệt hoặc Đã bán */}
            <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-end gap-1">
              {listing.visibility === "PRIVATE" && (
                <span className="bg-rose-600/95 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wide">
                  Chờ duyệt
                </span>
              )}
              {listing.status === "SOLD" && (
                <span className="bg-stone-700/90 text-stone-200 text-[11px] font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                  Đã bán
                </span>
              )}
              {listing.status === "HIDDEN" && (
                <span className="bg-stone-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                  Tạm ẩn
                </span>
              )}
            </div>

            {/* Badge số ảnh & nút mở xem toàn màn hình */}
            {mediaCount > 0 && (
              <button
                onClick={(e) => handleOpenViewer(e, 0)}
                className="absolute bottom-2.5 right-2.5 z-20 bg-stone-900/80 hover:bg-black text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center space-x-1 backdrop-blur-xs transition-colors"
                title="Bấm để xem ảnh phóng to"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{mediaCount} ảnh</span>
                {hasVideo && <span className="text-amber-400 font-bold">• Video</span>}
              </button>
            )}
          </div>

          {/* Vùng thông tin chính */}
          <div className="p-3.5 sm:p-4">
            {/* Tiêu đề tin */}
            <Link href={`/listing/${listing.id}`} className="block">
              <h3 className="font-bold text-base sm:text-lg text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug mb-2">
                {listing.title}
              </h3>
            </Link>

            {/* Hàng thông số: Cân nặng & Địa điểm */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-stone-600 mb-3 gap-2">
              <div className="flex items-center space-x-1 shrink-0">
                <Scale className="w-4 h-4 text-amber-700" />
                <span className="font-medium text-stone-800">
                  {formatWeight(listing.weightAvgKg)}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-stone-500 truncate">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">
                  {[listing.district, listing.province].filter(Boolean).join(", ") || "Miền Bắc"}
                </span>
              </div>
            </div>

            {/* Vùng Giá Bán Nổi Bật theo yêu cầu có nhãn Giá Tham Khảo */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 mb-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-amber-900/80 uppercase block tracking-wider">
                    Giá tham khảo
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-amber-950">
                    {formatPriceDisplay(listing.priceAmount, listing.priceType)}
                  </div>
                </div>

                {/* Nhãn báo giá */}
                <span className="text-xs font-medium text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                  {listing.priceType === "PER_HEAD"
                    ? "Theo con"
                    : listing.priceType === "PER_HERD"
                    ? "Cả đàn"
                    : "Thương lượng"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Nút liên hệ bắt buộc trên từng tin */}
        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 border-t border-stone-100 pt-3">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {/* 1. Nút Gọi Điện Thoại */}
            <a
              href={getTelLink(listing.seller.phone)}
              className="inline-flex items-center justify-center space-x-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm py-2 px-1 rounded-lg shadow-2xs transition-colors"
              title={`Gọi ngay ${listing.seller.phone}`}
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>Gọi điện</span>
            </a>

            {/* 2. Nút Chat Zalo */}
            <a
              href={getZaloLink(listing.seller.zaloNumber || listing.seller.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-1 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-xs sm:text-sm py-2 px-1 rounded-lg shadow-2xs transition-colors"
              title="Mở Zalo nhắn tin trực tiếp"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Zalo</span>
            </a>

            {/* 3. Nút Nhắn Tin Trực Tiếp Trên Web */}
            <Link
              href={`/chat?listingId=${listing.id}`}
              className="inline-flex items-center justify-center space-x-1 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white font-semibold text-xs sm:text-sm py-2 px-1 rounded-lg shadow-2xs transition-colors"
              title="Nhắn tin trên sàn"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Nhắn tin</span>
            </Link>
          </div>

          {/* Vùng hành động dành riêng cho Quản Trị Viên (nếu được bật) */}
          {showAdminActions && (
            <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-1.5 text-xs">
              {listing.visibility === "PRIVATE" && onApprove && (
                <button
                  onClick={() => onApprove(listing.id)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-md font-bold shadow-xs transition-colors"
                >
                  ✓ Duyệt công khai ngay
                </button>
              )}

              {onStatusChange && (
                <select
                  value={listing.status}
                  onChange={(e) =>
                    onStatusChange(listing.id, e.target.value as "SELLING" | "SOLD" | "HIDDEN")
                  }
                  className="text-xs border border-stone-300 rounded px-2 py-1 bg-white text-stone-800 font-medium"
                >
                  <option value="SELLING">Đang bán</option>
                  <option value="SOLD">Đã bán</option>
                  <option value="HIDDEN">Tạm ẩn</option>
                </select>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(listing.id)}
                  className="text-red-600 hover:text-red-800 hover:underline px-2 py-1"
                >
                  Xóa tin
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal xem toàn màn hình Lightbox */}
      {listing.media && listing.media.length > 0 && (
        <MediaViewerModal
          media={listing.media}
          initialIndex={selectedMediaIdx}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </>
  );
}
