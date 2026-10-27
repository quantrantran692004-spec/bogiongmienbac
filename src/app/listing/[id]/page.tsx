"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ListingItem, PriceHistoryItem } from "@/types";
import { formatPriceDisplay, formatWeight, getTelLink, getZaloLink } from "@/lib/format";
import MediaViewerModal from "@/components/MediaViewerModal";
import ZaloIcon from "@/components/icons/ZaloIcon";
import CattleLogoIcon from "@/components/icons/CattleLogoIcon";
import {
  Phone,
  MessageSquare,
  MapPin,
  Scale,
  Calendar,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  Share2,
  CheckCircle,
  Play,
  Maximize2,
} from "lucide-react";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;

  const [listing, setListing] = useState<ListingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${listingId}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Không tìm thấy tin bán hoặc tin đang chờ duyệt");
        }
        return res.json();
      })
      .then((data) => {
        setListing(data.listing);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title || "Bò Giống Miền Bắc",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 w-32 bg-stone-200 rounded mb-4" />
        <div className="w-full aspect-[16/10] bg-stone-200 rounded-2xl mb-6" />
        <div className="h-8 bg-stone-200 rounded w-2/3 mb-4" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-stone-900 mb-1">Không thể xem tin bán này</h2>
        <p className="text-xs text-stone-500 mb-6">{error || "Tin không tồn tại hoặc chưa được duyệt công khai."}</p>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>
    );
  }

  const currentMedia = listing.media?.[selectedMediaIdx] || listing.media?.[0];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Nút quay lại & Chia sẻ */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 font-medium text-xs sm:text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về danh sách bò bán</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
        >
          <Share2 className="w-3.5 h-3.5 text-stone-500" />
          <span>{copied ? "Đã chép link!" : "Chia sẻ tin"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: KHU VỰC ẢNH & VIDEO TRỌN VẸN (7 CỘT) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs p-2 sm:p-3">
            {/* Khung xem ảnh/video chính với nền mờ bảo toàn trọn vẹn con bò */}
            <div className="relative w-full aspect-[4/3] bg-stone-950 rounded-xl overflow-hidden cursor-pointer group">
              {currentMedia ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-35"
                    style={{ backgroundImage: `url(${currentMedia.thumbnailUrl || currentMedia.fileUrl})` }}
                  />

                  {currentMedia.fileType === "VIDEO" ? (
                    <div
                      className="relative z-10 w-full h-full flex items-center justify-center"
                      onClick={() => setIsViewerOpen(true)}
                    >
                      <img
                        src={currentMedia.thumbnailUrl || currentMedia.fileUrl}
                        alt={listing.title}
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 ml-0.5 fill-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={currentMedia.fileUrl}
                      alt={listing.title}
                      className="relative z-10 w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
                      onClick={() => setIsViewerOpen(true)}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setIsViewerOpen(true)}
                    className="absolute bottom-3 right-3 z-20 bg-stone-900/80 hover:bg-black text-white px-2.5 py-1.5 rounded-lg backdrop-blur-xs flex items-center space-x-1 text-xs font-medium shadow-md transition-all"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Xem ảnh lớn</span>
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  Chưa có ảnh/video
                </div>
              )}
            </div>

            {/* Dải ảnh/video thu nhỏ bên dưới */}
            {listing.media && listing.media.length > 1 && (
              <div className="flex items-center space-x-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
                {listing.media.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMediaIdx(idx)}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedMediaIdx === idx
                        ? "border-amber-600 ring-2 ring-amber-600/30 scale-102"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={item.thumbnailUrl || item.fileUrl}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {item.fileType === "VIDEO" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mô tả chi tiết của người bán */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-2.5">
              Đặc điểm & Mô tả chi tiết từ người nuôi
            </h3>
            <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
              {listing.description || "Người bán chưa nhập thêm ghi chú chi tiết. Vui lòng gọi điện hoặc nhắn tin trực tiếp để trao đổi cụ thể về tình trạng bò."}
            </div>

            {/* Tiêu chuẩn kiểm duyệt */}
            <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-start space-x-2.5 text-xs text-stone-500 bg-stone-50 p-3 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-800 block">Cam kết an toàn từ Sàn Bò Giống Miền Bắc</span>
                Tin bán đã qua kiểm duyệt hình ảnh, số điện thoại người bán chính chủ. Khuyến khích người mua đến xem trực tiếp tại chuồng trại trước khi giao dịch.
              </div>
            </div>
          </div>

          {/* Lịch Sử Thay Đổi Giá Bán (Price History) nếu có */}
          {listing.priceHistories && listing.priceHistories.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-amber-950 mb-3 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                <span>Lịch sử cập nhật giá bán ({listing.priceHistories.length} lần điều chỉnh)</span>
              </h3>
              <div className="space-y-2 text-xs">
                {listing.priceHistories.map((hist: PriceHistoryItem) => (
                  <div
                    key={hist.id}
                    className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-200"
                  >
                    <div>
                      <span className="text-stone-500">
                        {new Date(hist.changedAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-stone-400 mx-2">•</span>
                      <span className="text-stone-500 line-through">
                        {formatPriceDisplay(hist.oldPrice, hist.oldPriceType || "PER_HEAD")}
                      </span>
                    </div>
                    <div className="font-bold text-emerald-700">
                      → {formatPriceDisplay(hist.newPrice, hist.newPriceType)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: BẢNG GIÁ, THÔNG SỐ VÀ 3 NÚT LIÊN HỆ (5 CỘT) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Hộp Thông tin chính */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            {/* Nhãn giống & số lượng */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-md">
                {listing.breed}
              </span>
              <span className="bg-stone-100 text-stone-700 font-medium text-xs px-2.5 py-0.5 rounded-md">
                Số lượng: {listing.quantity} con
              </span>
              {listing.visibility === "PRIVATE" && (
                <span className="bg-rose-100 text-rose-800 font-bold text-xs px-2 py-0.5 rounded-md">
                  Chờ duyệt
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug mb-4">
              {listing.title}
            </h1>

            {/* Vùng Giá Bán Nổi Bật */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 mb-4">
              <span className="text-[11px] font-bold text-amber-900/80 uppercase tracking-wider block mb-0.5">
                Giá tham khảo
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-950">
                {formatPriceDisplay(listing.priceAmount, listing.priceType)}
              </div>
              <p className="text-xs text-amber-900/70 mt-1">
                {listing.priceType === "PER_HEAD"
                  ? "* Mức giá tính trên mỗi con bò"
                  : listing.priceType === "PER_HERD"
                  ? "* Mức giá trọn gói cho toàn bộ đàn"
                  : "* Giá thương lượng trực tiếp cùng người bán"}
              </p>
            </div>

            {/* Bảng thông số tóm tắt */}
            <div className="divide-y divide-stone-100 text-xs sm:text-sm">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-stone-500 flex items-center space-x-1.5">
                  <Scale className="w-4 h-4 text-stone-400" />
                  <span>Cân nặng trung bình:</span>
                </span>
                <span className="font-bold text-stone-900">
                  {formatWeight(listing.weightAvgKg)}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-stone-500 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span>Khu vực chăn nuôi:</span>
                </span>
                <span className="font-bold text-stone-900 text-right">
                  {[listing.district, listing.province].filter(Boolean).join(", ") || "Miền Bắc"}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-stone-500 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span>Ngày đăng:</span>
                </span>
                <span className="text-stone-700">
                  {new Date(listing.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Hộp Thông Tin Người Bán & 3 Phương Thức Liên Hệ Bắt Buộc */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs sticky top-20">
            <h3 className="font-bold text-stone-900 text-sm mb-3">Liên hệ người bán bò</h3>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                <CattleLogoIcon className="w-5 h-5 text-amber-100" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-stone-900 text-sm truncate">
                  {listing.seller.fullName || "Chủ đàn bò"}
                </div>
                <div className="text-[11px] text-stone-500 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Đã xác minh: {listing.seller.phone}</span>
                </div>
              </div>
            </div>

            {/* 3 NÚT LIÊN HỆ LỚN RÕ RÀNG */}
            <div className="space-y-2.5">
              {/* 1. Gọi điện thoại */}
              <a
                href={getTelLink(listing.seller.phone)}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Gọi điện: {listing.seller.phone}</span>
              </a>

              {/* 2. Nhắn tin Zalo (Icon Zalo chuẩn) */}
              <a
                href={getZaloLink(listing.seller.zaloNumber || listing.seller.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                <ZaloIcon className="w-4 h-4 shrink-0" />
                <span>Nhắn tin qua Zalo</span>
              </a>

              {/* 3. Nhắn tin trên sàn */}
              <Link
                href={`/chat?listingId=${listing.id}`}
                className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Chat trực tiếp trên website</span>
              </Link>
            </div>
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
    </div>
  );
}
