"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone, MessageSquare, MapPin, Scale, Eye, Play, Clock, Calendar, Heart } from "lucide-react";
import ZaloIcon from "./icons/ZaloIcon";
import { ListingItem } from "@/types";
import { formatPriceDisplay, formatWeight, getTelLink, getZaloLink, formatRelativeTime } from "@/lib/format";
import MediaViewerModal from "./MediaViewerModal";

interface ListingCardProps {
  listing: ListingItem;
  showAdminActions?: boolean;
  initialSaved?: boolean;
  onSavedChange?: (saved: boolean) => void;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: "SELLING" | "SOLD" | "HIDDEN") => void;
}

export default function ListingCard({
  listing,
  showAdminActions = false,
  initialSaved = false,
  onSavedChange,
  onApprove,
  onDelete,
  onStatusChange,
}: ListingCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [savingFav, setSavingFav] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (savingFav) return;
    setSavingFav(true);

    try {
      if (isSaved) {
        const res = await fetch(`/api/favorites?listingId=${listing.id}`, { method: "DELETE" });
        if (res.ok) {
          setIsSaved(false);
          onSavedChange?.(false);
        }
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: listing.id }),
        });
        if (res.ok) {
          setIsSaved(true);
          onSavedChange?.(true);
        } else if (res.status === 401) {
          alert("Vui lòng đăng nhập bằng số điện thoại để lưu tin yêu thích.");
        }
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
    } finally {
      setSavingFav(false);
    }
  };

  const coverMedia = listing.media?.find((m) => m.isCover) || listing.media?.[0];
  const [imgError, setImgError] = useState(false);
  const fallbackUrl = "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80";
  const displayUrl = imgError ? fallbackUrl : (coverMedia?.fileUrl || fallbackUrl);

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
      <div className="bg-white rounded-2xl border border-gray-150 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row group">
        {/* KHỐI ẢNH BÊN TRÁI: Hiển thị trọn vẹn 100% bằng object-contain, không cắt cúp */}
        <div className="relative w-full sm:w-64 md:w-72 lg:w-80 shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[220px] bg-stone-100 overflow-hidden cursor-pointer">
          {displayUrl ? (
            <>
              {/* Nền mờ tự nhiên từ chính ảnh gốc */}
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-20"
                style={{ backgroundImage: `url(${displayUrl})` }}
                aria-hidden="true"
              />

              {/* Ảnh chính trọn vẹn 100% bằng object-contain */}
              <img
                src={displayUrl}
                alt={listing.title}
                onError={() => setImgError(true)}
                className="relative z-10 w-full h-full object-contain p-1 group-hover:scale-102 transition-transform duration-300"
                onClick={(e) => handleOpenViewer(e, 0)}
                loading="lazy"
              />

              {/* Nút phát video rõ ràng nếu là video, không tự phát */}
              {coverMedia.fileType === "VIDEO" && (
                <button
                  type="button"
                  onClick={(e) => handleOpenViewer(e, 0)}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 hover:bg-black/40 transition-colors"
                  aria-label="Phát video thực tế"
                >
                  <div className="w-11 h-11 rounded-full bg-amber-600/90 hover:bg-amber-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </div>
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100 p-4">
              <span className="text-xs font-medium">Chưa có ảnh</span>
            </div>
          )}

          {/* Badge Trạng thái & Quyền riêng tư */}
          <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap gap-1">
            {listing.visibility === "PRIVATE" && (
              <span className="bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wide">
                Chờ duyệt
              </span>
            )}
            {listing.status === "SOLD" && (
              <span className="bg-stone-800 text-stone-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                Đã bán
              </span>
            )}
            {listing.status === "HIDDEN" && (
              <span className="bg-stone-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                Tạm ẩn
              </span>
            )}
          </div>

          {/* Nút lưu tin yêu thích (Bookmark/Heart) */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={savingFav}
            className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-xs transition-all ${
              isSaved
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105"
                : "bg-black/40 hover:bg-black/60 text-white"
            }`}
            title={isSaved ? "Bỏ lưu tin" : "Lưu tin bán bò"}
            aria-label={isSaved ? "Bỏ lưu tin" : "Lưu tin bán bò"}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
          </button>

          {/* Badge số ảnh & nút xem toàn màn hình */}
          {mediaCount > 0 && (
            <button
              type="button"
              onClick={(e) => handleOpenViewer(e, 0)}
              className="absolute bottom-2.5 right-2.5 z-20 bg-stone-900/85 hover:bg-black text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center space-x-1 backdrop-blur-xs transition-colors"
              title="Mở xem ảnh lớn toàn màn hình"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{mediaCount} ảnh</span>
              {hasVideo && <span className="text-amber-400 font-bold">• Video</span>}
            </button>
          )}
        </div>

        {/* KHỐI THÔNG TIN BÊN PHẢI: Bố cục ngang thông tin rõ ràng, không rối mắt */}
        <div className="flex-1 p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between">
          <div>
            {/* Hàng nhãn: Giống bò, Số lượng & Thời gian đăng */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="bg-amber-100/90 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  {listing.breed}
                </span>
                <span className="bg-stone-100 text-stone-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                  SL: {listing.quantity} con
                </span>
              </div>

              {listing.createdAt && (
                <span className="text-[11px] text-stone-400 flex items-center space-x-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(listing.createdAt)}</span>
                </span>
              )}
            </div>

            {/* Tiêu đề tin bán bò */}
            <Link href={`/listing/${listing.id}`} className="block group/title">
              <h3 className="font-bold text-base sm:text-lg text-stone-900 group-hover/title:text-amber-800 transition-colors line-clamp-2 leading-snug mb-2">
                {listing.title}
              </h3>
            </Link>

            {/* Thông số: Cân nặng & Địa bàn chăn nuôi */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-stone-600 mb-3">
              <div className="flex items-center space-x-1.5 shrink-0">
                <Scale className="w-4 h-4 text-amber-700" />
                <span className="font-medium text-stone-800">
                  Cân nặng: {formatWeight(listing.weightAvgKg)}
                </span>
              </div>

              <div className="flex items-center space-x-1 text-stone-500 truncate">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">
                  {[listing.district, listing.province].filter(Boolean).join(", ") || "Miền Bắc"}
                </span>
              </div>
            </div>

            {/* Người bán / Trại bò */}
            <div className="text-xs text-stone-500 mb-3 flex items-center space-x-1.5">
              <span className="font-medium text-stone-700 truncate">
                Người bán: {listing.seller.fullName || listing.seller.phone}
              </span>
            </div>
          </div>

          <div>
            {/* Vùng Giá Bán Nổi Bật Theo Yêu Cầu */}
            <div className="bg-red-50/60 border border-red-100 rounded-xl p-2.5 sm:p-3 mb-3 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  {listing.createdByAdmin ? "Giá bán công khai" : "Giá tham khảo"}
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#d92d20]">
                  {formatPriceDisplay(listing.priceAmount, listing.priceType)}
                </div>
              </div>

              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                {listing.priceType === "PER_HEAD"
                  ? "Bán theo con"
                  : listing.priceType === "PER_HERD"
                  ? "Bán cả đàn"
                  : "Giá thương lượng"}
              </span>
            </div>

            {/* 3 NÚT LIÊN HỆ BẮT BUỘC TRÊN TỪNG TIN */}
            <div className="grid grid-cols-3 gap-2">
              {/* 1. Gọi điện thoại */}
              <a
                href={getTelLink(listing.seller.phone)}
                className="inline-flex items-center justify-center space-x-1.5 bg-[#056839] hover:bg-[#04522d] active:scale-98 text-white font-semibold text-xs sm:text-sm py-2 px-2 rounded-xl shadow-2xs transition-all"
                title={`Gọi ngay: ${listing.seller.phone}`}
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Gọi điện</span>
              </a>

              {/* 2. Chat Zalo (Dùng Icon Zalo chuẩn) */}
              <a
                href={getZaloLink(listing.seller.zaloNumber || listing.seller.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-1.5 bg-[#0068ff] hover:bg-blue-600 active:scale-98 text-white font-semibold text-xs sm:text-sm py-2 px-2 rounded-xl shadow-2xs transition-all"
                title="Nhắn tin qua Zalo"
              >
                <ZaloIcon className="w-4 h-4 shrink-0" />
                <span>Zalo</span>
              </a>

              {/* 3. Nhắn tin trên sàn */}
              <Link
                href={`/chat?listingId=${listing.id}`}
                className="inline-flex items-center justify-center space-x-1.5 bg-[#0d9488] hover:bg-teal-700 active:scale-98 text-white font-semibold text-xs sm:text-sm py-2 px-2 rounded-xl shadow-2xs transition-all"
                title="Trò chuyện trực tiếp trên website"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Nhắn tin</span>
              </Link>
            </div>

            {/* Vùng hành động Quản trị viên (nếu mở trong Admin Dashboard) */}
            {showAdminActions && (
              <div className="mt-3 pt-2.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                {listing.visibility === "PRIVATE" && onApprove && (
                  <button
                    type="button"
                    onClick={() => onApprove(listing.id)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg font-bold shadow-xs transition-colors"
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
                    className="text-xs border border-stone-300 rounded-lg px-2.5 py-1 bg-white text-stone-800 font-semibold"
                  >
                    <option value="SELLING">Đang bán</option>
                    <option value="SOLD">Đã bán</option>
                    <option value="HIDDEN">Tạm ẩn</option>
                  </select>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(listing.id)}
                    className="text-rose-600 hover:text-rose-800 font-semibold hover:underline px-2 py-1"
                  >
                    Xóa tin
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox xem ảnh toàn màn hình */}
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
