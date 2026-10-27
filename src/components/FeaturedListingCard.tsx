"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone, MessageSquare, MapPin, Scale, Eye, Play } from "lucide-react";
import ZaloIcon from "./icons/ZaloIcon";
import { ListingItem } from "@/types";
import { formatPriceDisplay, formatWeight, getTelLink, getZaloLink } from "@/lib/format";
import MediaViewerModal from "./MediaViewerModal";

interface FeaturedListingCardProps {
  listing: ListingItem;
}

export default function FeaturedListingCard({ listing }: FeaturedListingCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

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

  const isNegotiable =
    listing.priceType === "NEGOTIABLE" ||
    listing.priceAmount === null ||
    listing.priceAmount === undefined ||
    listing.priceAmount <= 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-150 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
        <div>
          {/* VÙNG ẢNH BÒ: TĂNG KÍCH THƯỚC 20-25%, BẢO TOÀN TRỌN VẸN BẰNG OBJECT-CONTAIN */}
          <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer">
            {displayUrl ? (
              <>
                {/* Lớp nền mờ mỏng tinh tế */}
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-20"
                  style={{ backgroundImage: `url(${displayUrl})` }}
                  aria-hidden="true"
                />

                {/* Ảnh bò lớn, trọn vẹn 100% không cắt đầu chân */}
                <img
                  src={displayUrl}
                  alt={listing.title}
                  onError={() => setImgError(true)}
                  className="relative z-10 w-full h-full object-contain p-1 group-hover:scale-102 transition-transform duration-300"
                  onClick={(e) => handleOpenViewer(e, 0)}
                  loading="lazy"
                />

                {coverMedia.fileType === "VIDEO" && (
                  <button
                    type="button"
                    onClick={(e) => handleOpenViewer(e, 0)}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md">
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </div>
                  </button>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-xs">
                Chưa có ảnh
              </div>
            )}

            {/* Badges góc trên đúng ảnh mẫu: [Mới đăng] & [Đang bán] */}
            <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-1.5">
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                Mới đăng
              </span>
              <span className="bg-[#056839] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                Đang bán
              </span>
            </div>

            {/* Số lượng ảnh */}
            {mediaCount > 0 && (
              <button
                type="button"
                onClick={(e) => handleOpenViewer(e, 0)}
                className="absolute bottom-2 right-2 z-20 bg-black/60 hover:bg-black/80 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs flex items-center space-x-1"
              >
                <Eye className="w-3 h-3" />
                <span>{mediaCount}</span>
                {hasVideo && <span className="text-amber-300 font-bold">• Video</span>}
              </button>
            )}
          </div>

          {/* THÔNG TIN CHI TIẾT */}
          <div className="p-3.5">
            {/* Tên tin đăng */}
            <Link href={`/listing/${listing.id}`} className="block">
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#056839] transition-colors line-clamp-1 mb-1">
                {listing.title}
              </h3>
            </Link>

            {/* Giá bán màu đỏ nổi bật đúng mẫu */}
            <div className="mb-2">
              <div className="text-base font-black text-[#d92d20] flex items-baseline space-x-1">
                <span>{isNegotiable ? "Liên hệ" : formatPriceDisplay(listing.priceAmount, listing.priceType)}</span>
              </div>
            </div>

            {/* Thông số gọn gàng: Cân nặng • Số lượng */}
            <div className="flex items-center space-x-3 text-xs text-gray-500 mb-1">
              <span className="flex items-center space-x-1">
                <Scale className="w-3.5 h-3.5 text-gray-400" />
                <span>{formatWeight(listing.weightAvgKg)}</span>
              </span>
              <span>•</span>
              <span>{listing.quantity} con</span>
            </div>

            {/* Địa bàn */}
            <div className="text-[11px] text-gray-400 truncate flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">
                {[listing.district, listing.province].filter(Boolean).join(", ") || "Miền Bắc"}
              </span>
            </div>
          </div>
        </div>

        {/* 3 NÚT LIÊN HỆ DƯỚI CHÂN THẺ ĐÚNG ẢNH MẪU */}
        <div className="px-3 pb-3 pt-1 border-t border-gray-50">
          <div className="grid grid-cols-3 gap-1.5">
            {/* 1. Gọi điện */}
            <a
              href={getTelLink(listing.seller.phone)}
              className="inline-flex items-center justify-center space-x-1 bg-[#056839] hover:bg-[#04522d] text-white font-medium text-[11px] py-1.5 px-1 rounded-md transition-colors"
              title="Gọi điện"
            >
              <Phone className="w-3 h-3 shrink-0" />
              <span>Gọi điện</span>
            </a>

            {/* 2. Zalo */}
            <a
              href={getZaloLink(listing.seller.zaloNumber || listing.seller.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-1 bg-[#0068ff] hover:bg-blue-600 text-white font-medium text-[11px] py-1.5 px-1 rounded-md transition-colors"
              title="Zalo"
            >
              <ZaloIcon className="w-3 h-3 shrink-0" />
              <span>Zalo</span>
            </a>

            {/* 3. Chat */}
            <Link
              href={`/chat?listingId=${listing.id}`}
              className="inline-flex items-center justify-center space-x-1 bg-[#0d9488] hover:bg-teal-700 text-white font-medium text-[11px] py-1.5 px-1 rounded-md transition-colors"
              title="Nhắn tin"
            >
              <MessageSquare className="w-3 h-3 shrink-0" />
              <span>Chat</span>
            </Link>
          </div>
        </div>
      </div>

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
