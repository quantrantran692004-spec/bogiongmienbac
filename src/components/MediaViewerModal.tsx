"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Play, Maximize2 } from "lucide-react";
import { ListingMediaItem } from "@/types";

interface MediaViewerModalProps {
  media: ListingMediaItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaViewerModal({
  media,
  initialIndex = 0,
  isOpen,
  onClose,
}: MediaViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsPlayingVideo(false);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    setIsPlayingVideo(false);
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }, [media.length]);

  const handlePrev = useCallback(() => {
    setIsPlayingVideo(false);
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || media.length === 0) return null;

  const currentItem = media[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between items-center backdrop-blur-md select-none">
      {/* Thanh công cụ trên cùng */}
      <div className="w-full max-w-5xl px-4 py-3 flex items-center justify-between text-white z-10">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
            {currentIndex + 1} / {media.length}
          </span>
          <span className="text-xs text-stone-300 hidden sm:inline">
            {currentItem.fileType === "VIDEO" ? "Video thực tế" : "Ảnh chụp rõ nét"}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/35 transition-colors text-white"
          aria-label="Đóng xem ảnh"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Vùng hiển thị media chính */}
      <div className="relative w-full flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Nút lùi */}
        {media.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-xs transition-all"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Nội dung media */}
        <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
          {currentItem.fileType === "VIDEO" ? (
            <div className="relative rounded-lg overflow-hidden max-w-full max-h-[75vh] bg-black">
              {isPlayingVideo ? (
                <video
                  src={currentItem.fileUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
              ) : (
                <div
                  className="relative cursor-pointer group flex items-center justify-center"
                  onClick={() => setIsPlayingVideo(true)}
                >
                  <img
                    src={currentItem.thumbnailUrl || currentItem.fileUrl}
                    alt="Video thumbnail"
                    className="max-w-full max-h-[75vh] object-contain rounded-lg brightness-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-amber-600/90 hover:bg-amber-500 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 ml-1 fill-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <img
              src={currentItem.fileUrl}
              alt="Ảnh phóng to"
              className="max-w-full max-h-[78vh] object-contain rounded-md shadow-2xl transition-transform"
            />
          )}
        </div>

        {/* Nút tiến */}
        {media.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-xs transition-all"
            aria-label="Ảnh sau"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Dải ảnh thu nhỏ (Thumbnails) ở dưới */}
      {media.length > 1 && (
        <div className="w-full max-w-4xl px-4 py-3 overflow-x-auto flex items-center justify-center space-x-2 scrollbar-thin">
          {media.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                setIsPlayingVideo(false);
                setCurrentIndex(idx);
              }}
              className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-all ${
                currentIndex === idx
                  ? "border-amber-400 scale-105 shadow-md shadow-amber-500/50"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={item.thumbnailUrl || item.fileUrl}
                alt={`Thu nhỏ ${idx + 1}`}
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
  );
}
