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
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
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

  const mediaList = listing?.media || [];
  const currentMedia = mediaList[selectedMediaIdx] || mediaList[0];

  const handlePrevMedia = () => {
    if (mediaList.length <= 1) return;
    setSelectedMediaIdx((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNextMedia = () => {
    if (mediaList.length <= 1) return;
    setSelectedMediaIdx((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-gray-200 rounded-2xl" />
          <div className="lg:col-span-4 h-96 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Không thể xem tin bán này</h2>
        <p className="text-xs text-gray-500 mb-6">{error || "Tin không tồn tại hoặc đã bị ẩn."}</p>
        <Link
          href="/danh-sach-bo"
          className="inline-flex items-center space-x-1.5 bg-[#056839] hover:bg-[#04522d] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về danh sách bò bán</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Breadcrumb đúng Màn 3 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Link href="/" className="hover:text-[#056839]">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/danh-sach-bo" className="hover:text-[#056839]">Bò giống miền Bắc</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-bold truncate max-w-xs">{listing.breed}</span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-500" />
            <span>{copied ? "Đã chép link!" : "Chia sẻ tin"}</span>
          </button>
        </div>

        {/* BỐ CỤC 2 CỘT CHUẨN MÀN 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI (7 CỘT): KHUNG ẢNH CỰC ĐẠI, THUMBNAILS, MÔ TẢ & LỊCH SỬ GIÁ */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* VÙNG ẢNH BÒ: TĂNG KÍCH THƯỚC 20-25%, BẢO TOÀN TRỌN VẸN BẰNG OBJECT-CONTAIN */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs p-3">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-stone-950 rounded-2xl overflow-hidden group">
                {currentMedia ? (
                  <>
                    {/* Nền mờ nghệ thuật */}
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110 opacity-30"
                      style={{ backgroundImage: `url(${currentMedia.thumbnailUrl || currentMedia.fileUrl})` }}
                    />

                    {/* Ảnh bò lớn, trọn vẹn 100% không cắt cúp */}
                    {currentMedia.fileType === "VIDEO" ? (
                      <div
                        className="relative z-10 w-full h-full flex items-center justify-center cursor-pointer"
                        onClick={() => setIsViewerOpen(true)}
                      >
                        <img
                          src={currentMedia.thumbnailUrl || currentMedia.fileUrl}
                          alt={listing.title}
                          className="max-w-full max-h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 ml-1 fill-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={currentMedia.fileUrl}
                        alt={listing.title}
                        className="relative z-10 w-full h-full object-contain p-2 cursor-pointer"
                        onClick={() => setIsViewerOpen(true)}
                      />
                    )}

                    {/* Nút lùi/tiến ảnh Prev / Next đúng Màn 3 */}
                    {mediaList.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevMedia();
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                          aria-label="Ảnh trước"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextMedia();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                          aria-label="Ảnh tiếp theo"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Nút mở toàn màn hình */}
                    <button
                      type="button"
                      onClick={() => setIsViewerOpen(true)}
                      className="absolute bottom-3 right-3 z-20 bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center space-x-1.5 text-xs font-medium shadow-md transition-all"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Xem toàn màn hình</span>
                    </button>

                    {/* Badge vị trí ảnh hiện tại */}
                    {mediaList.length > 0 && (
                      <div className="absolute top-3 right-3 z-20 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                        {selectedMediaIdx + 1} / {mediaList.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Chưa có ảnh/video
                  </div>
                )}
              </div>

              {/* Dải Thumbnails bên dưới */}
              {mediaList.length > 1 && (
                <div className="flex items-center space-x-2.5 mt-3 overflow-x-auto pb-1 scrollbar-thin">
                  {mediaList.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMediaIdx(idx)}
                      className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedMediaIdx === idx
                          ? "border-[#056839] ring-2 ring-[#056839]/30 scale-102"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={item.thumbnailUrl || item.fileUrl}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {item.fileType === "VIDEO" && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Đặc điểm & Mô tả chi tiết từ người nuôi */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
                Đặc Điểm & Thông Tin Chi Tiết Đàn Bò
              </h3>

              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                {listing.description ||
                  "Người bán chưa nhập thêm ghi chú chi tiết. Vui lòng gọi điện hoặc nhắn tin trực tiếp để trao đổi cụ thể về tình trạng bò."}
              </div>

              {/* Hộp cam kết chất lượng */}
              <div className="bg-emerald-50/70 border border-emerald-200/70 p-4 rounded-xl flex items-start space-x-3 text-xs text-gray-700">
                <ShieldCheck className="w-5 h-5 text-[#056839] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-0.5">Cam Kết An Toàn & Minh Bạch</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Mọi tin đăng trên sàn đều được người bán cam kết về hình ảnh thực tế, không chỉnh sửa làm sai lệch thể trạng bò. Người mua được quyền kiểm tra thực tế tại chuồng trước khi giao dịch thanh toán.
                  </p>
                </div>
              </div>
            </div>

            {/* Lịch Sử Thay Đổi Giá Bán (Màn 3) */}
            {listing.priceHistories && listing.priceHistories.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#056839]" />
                  <span>Lịch Sử Cập Nhật Giá Bán ({listing.priceHistories.length} lần)</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {listing.priceHistories.map((hist: PriceHistoryItem) => (
                    <div
                      key={hist.id}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div>
                        <span className="text-gray-500">
                          {new Date(hist.changedAt).toLocaleDateString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-gray-400 line-through">
                          {formatPriceDisplay(hist.oldPrice, hist.oldPriceType || "PER_HEAD")}
                        </span>
                      </div>
                      <div className="font-bold text-[#d92d20]">
                        → {formatPriceDisplay(hist.newPrice, hist.newPriceType)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (5 CỘT): GIÁ BÁN ĐỎ RỰC RỠ, THÔNG SỐ, HỘP NGƯỜI BÁN 4.8 SAO & 3 NÚT LIÊN HỆ */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            {/* THẺ GIÁ VÀ THÔNG SỐ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-md">
                  {listing.breed}
                </span>
                <span className="bg-emerald-100 text-[#056839] font-bold text-xs px-2.5 py-0.5 rounded-md">
                  Đang bán
                </span>
              </div>

              <h1 className="text-xl font-black text-gray-900 leading-snug">
                {listing.title}
              </h1>

              {/* VÙNG GIÁ BÁN MÀU ĐỎ NỔI BẬT ĐÚNG MÀN 3 */}
              <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Giá bán công khai
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#d92d20]">
                  {formatPriceDisplay(listing.priceAmount, listing.priceType)}
                </div>
                <span className="inline-block mt-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {listing.priceType === "PER_HEAD"
                    ? "Bán theo con"
                    : listing.priceType === "PER_HERD"
                    ? "Bán cả đàn"
                    : "Giá thương lượng"}
                </span>
              </div>

              {/* Bảng Thông số chi tiết */}
              <div className="divide-y divide-gray-100 text-xs sm:text-sm">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-gray-500 flex items-center space-x-1.5">
                    <Scale className="w-4 h-4 text-gray-400" />
                    <span>Cân nặng trung bình:</span>
                  </span>
                  <span className="font-bold text-gray-900">{formatWeight(listing.weightAvgKg)}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-gray-500 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>Khu vực chăn nuôi:</span>
                  </span>
                  <span className="font-bold text-gray-900 text-right truncate max-w-[180px]">
                    {[listing.district, listing.province].filter(Boolean).join(", ") || "Miền Bắc"}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-gray-500 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Thời gian đăng tin:</span>
                  </span>
                  <span className="text-gray-700">
                    {new Date(listing.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            {/* HỘP NGƯỜI BÁN ĐÃ XÁC THỰC 4.8 SAO & 3 NÚT LIÊN HỆ LỚN (ĐÚNG MÀN 3) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-4 sticky top-20">
              <h3 className="font-black text-sm text-gray-900">Liên Hệ Người Bán Đàn Bò</h3>

              <div className="flex items-center space-x-3.5 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 font-bold shrink-0">
                  <CattleLogoIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-gray-900 truncate">
                    {listing.seller.fullName || "Trại Bò Giống"}
                  </div>
                  <div className="flex items-center space-x-2 text-xs mt-0.5">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                      4.8
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="inline-flex items-center text-emerald-700 text-[11px] font-semibold">
                      <CheckCircle className="w-3 h-3 mr-0.5" />
                      Đã xác thực
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 NÚT LIÊN HỆ TO RÕ RÀNG BÁM SÁT MÀN 3 */}
              <div className="space-y-2.5">
                {/* 1. Gọi điện thoại */}
                <a
                  href={getTelLink(listing.seller.phone)}
                  className="w-full py-3 px-4 bg-[#056839] hover:bg-[#04522d] active:scale-98 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4 stroke-[2.5]" />
                  <span>Gọi điện: {listing.seller.phone}</span>
                </a>

                {/* 2. Zalo */}
                <a
                  href={getZaloLink(listing.seller.zaloNumber || listing.seller.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#0068ff] hover:bg-blue-600 active:scale-98 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all"
                >
                  <ZaloIcon className="w-4 h-4" />
                  <span>Nhắn tin qua Zalo</span>
                </a>

                {/* 3. Chat trên sàn */}
                <Link
                  href={`/chat?listingId=${listing.id}`}
                  className="w-full py-3 px-4 bg-[#0d9488] hover:bg-teal-700 active:scale-98 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                  <span>Chat trực tiếp trên website</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {mediaList.length > 0 && (
        <MediaViewerModal
          media={mediaList}
          initialIndex={selectedMediaIdx}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
}
