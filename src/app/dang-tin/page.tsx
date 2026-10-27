"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Camera,
  Video,
  X,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Star,
  Info,
} from "lucide-react";
import { UserSession } from "@/types";

interface UploadFileItem {
  id: string;
  file: File;
  previewUrl: string;
  fileType: "IMAGE" | "VIDEO";
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  uploadedUrl?: string;
  isCover: boolean;
  errorMsg?: string;
}

const COMMON_BREEDS = [
  "Bò 3B (Blanc Bleu Belge)",
  "Bò Brahman",
  "Bò Sind (Red Sindhi)",
  "Bò Angus đen",
  "Bò Vàng Việt Nam",
  "Bò Lai F1 / F2",
  "Bò Droughmaster",
  "Bò sữa Holstein Friesian",
  "Bò thịt khác",
];

const PROVINCES = [
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
  "Bắc Kạn",
  "Lạng Sơn",
  "Yên Bái",
];

export default function DangTinPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [breed, setBreed] = useState(COMMON_BREEDS[0]);
  const [customBreed, setCustomBreed] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [weightAvgKg, setWeightAvgKg] = useState("");
  const [priceType, setPriceType] = useState<"PER_HEAD" | "PER_HERD" | "NEGOTIABLE">("PER_HEAD");
  const [priceAmount, setPriceAmount] = useState("");
  const [province, setProvince] = useState(PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");

  // Thông tin liên hệ nếu chưa có tài khoản
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerZalo, setSellerZalo] = useState("");

  // Quyền Admin: cho phép duyệt công khai ngay
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

  // Media files state
  const [mediaList, setMediaList] = useState<UploadFileItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    id: string;
    visibility: "PUBLIC" | "PRIVATE";
  } | null>(null);

  // Kiểm tra phiên đăng nhập
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setSellerPhone(data.user.phone || "");
          setSellerName(data.user.fullName || "");
          setSellerZalo(data.user.zaloNumber || "");
          if (data.user.role === "ADMIN") {
            setVisibility("PUBLIC");
          }
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  // Xử lý khi chọn file từ máy hoặc camera
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: UploadFileItem[] = [];

    Array.from(files).forEach((file, index) => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isImage && !isVideo) return;

      const previewUrl = URL.createObjectURL(file);
      const isFirstItem = mediaList.length === 0 && index === 0;

      const item: UploadFileItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl,
        fileType: isVideo ? "VIDEO" : "IMAGE",
        progress: 0,
        status: "pending",
        isCover: isFirstItem,
      };

      newItems.push(item);
    });

    setMediaList((prev) => [...prev, ...newItems]);

    // Tự động bắt đầu tải lên từng file độc lập
    newItems.forEach((item) => {
      uploadSingleFile(item);
    });

    // Reset input
    e.target.value = "";
  };

  // Tải lên độc lập từng file với tiến trình & xử lý lỗi riêng biệt
  const uploadSingleFile = (item: UploadFileItem) => {
    setMediaList((prev) =>
      prev.map((m) =>
        m.id === item.id ? { ...m, status: "uploading", progress: 10, errorMsg: undefined } : m
      )
    );

    const formData = new FormData();
    formData.append("file", item.file);

    // Dùng XMLHttpRequest để theo dõi progress chính xác
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90);
        setMediaList((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, progress: percent } : m))
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          setMediaList((prev) =>
            prev.map((m) =>
              m.id === item.id
                ? {
                    ...m,
                    status: "success",
                    progress: 100,
                    uploadedUrl: res.fileUrl,
                  }
                : m
            )
          );
        } catch {
          setMediaList((prev) =>
            prev.map((m) =>
              m.id === item.id
                ? { ...m, status: "error", errorMsg: "Phản hồi máy chủ lỗi" }
                : m
            )
          );
        }
      } else {
        let msg = "Tải lên thất bại";
        try {
          const errRes = JSON.parse(xhr.responseText);
          msg = errRes.error || msg;
        } catch {}
        setMediaList((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, status: "error", errorMsg: msg } : m))
        );
      }
    };

    xhr.onerror = () => {
      setMediaList((prev) =>
        prev.map((m) =>
          m.id === item.id
            ? { ...m, status: "error", errorMsg: "Mất kết nối mạng khi tải" }
            : m
        )
      );
    };

    xhr.send(formData);
  };

  // Thử lại riêng file bị lỗi mà không tải lại toàn bộ
  const handleRetryFile = (item: UploadFileItem) => {
    uploadSingleFile(item);
  };

  // Xóa file khỏi danh sách
  const handleRemoveFile = (id: string) => {
    setMediaList((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      // Nếu file bị xóa là cover, chuyển cover sang file đầu tiên còn lại
      if (filtered.length > 0 && !filtered.some((m) => m.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  // Đặt làm ảnh bìa
  const handleSetCover = (id: string) => {
    setMediaList((prev) =>
      prev.map((m) => ({
        ...m,
        isCover: m.id === id,
      }))
    );
  };

  // Gửi Form Đăng Tin
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate
    if (!title.trim()) {
      setFormError("Vui lòng nhập tiêu đề tin bán bò.");
      return;
    }

    if (!user && !sellerPhone.trim()) {
      setFormError("Vui lòng nhập số điện thoại liên hệ của bạn.");
      return;
    }

    // Kiểm tra media đang upload
    const uploadingItems = mediaList.filter((m) => m.status === "uploading");
    if (uploadingItems.length > 0) {
      setFormError("Có ảnh/video vẫn đang được tải lên, vui lòng chờ trong giây lát.");
      return;
    }

    // Lọc danh sách media đã upload thành công
    const successfulMedia = mediaList
      .filter((m) => m.status === "success" && m.uploadedUrl)
      .map((m, idx) => ({
        fileUrl: m.uploadedUrl as string,
        fileType: m.fileType,
        isCover: m.isCover,
        sortOrder: idx,
      }));

    if (successfulMedia.length === 0) {
      setFormError("Vui lòng chọn và tải lên ít nhất 1 ảnh chụp đàn bò thực tế.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        breed: breed === "Khác" && customBreed ? customBreed.trim() : breed,
        quantity: parseInt(quantity, 10) || 1,
        weightAvgKg: weightAvgKg ? parseFloat(weightAvgKg) : undefined,
        priceType,
        priceAmount: priceAmount ? parseFloat(priceAmount.replace(/\D/g, "")) : undefined,
        province,
        district: district.trim() || undefined,
        description: description.trim() || undefined,
        visibility: user?.role === "ADMIN" ? visibility : "PRIVATE",
        media: successfulMedia,
        phone: !user ? sellerPhone.trim() : undefined,
        fullName: !user ? sellerName.trim() : undefined,
        zaloNumber: !user ? sellerZalo.trim() || sellerPhone.trim() : undefined,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể đăng tin, vui lòng thử lại");
      }

      setSuccessInfo({
        id: data.listing.id,
        visibility: data.listing.visibility,
      });
    } catch (err: unknown) {
      console.error("Submit error:", err);
      setFormError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // Màn hình thông báo đăng tin thành công
  if (successInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 text-center shadow-xs">
          <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
            ✓
          </div>

          <h2 className="text-2xl font-extrabold text-stone-900 mb-2">
            Đăng tin bán bò thành công!
          </h2>

          {successInfo.visibility === "PRIVATE" ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-sm leading-relaxed mb-6 text-left">
              <div className="font-bold mb-1 flex items-center space-x-1.5">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <span>Tin đã được đưa vào hàng đợi kiểm duyệt (Riêng tư)</span>
              </div>
              Theo quy chuẩn an toàn của Sàn Bò Giống Miền Bắc, tin của bạn đang được Quản trị viên duyệt công khai để bảo vệ quyền lợi người mua và người bán. Sau khi được duyệt, tin sẽ lập tức xuất hiện trên trang chủ!
            </div>
          ) : (
            <p className="text-stone-600 mb-6 text-sm">
              Tin bán bò của bạn đã được công khai trực tiếp trên sàn giao dịch. Người mua có thể liên hệ ngay qua điện thoại, Zalo hoặc chat.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(`/listing/${successInfo.id}`)}
              className="px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm rounded-xl shadow-xs"
            >
              Xem tin vừa đăng
            </button>
            <button
              onClick={() => {
                setSuccessInfo(null);
                setMediaList([]);
                setTitle("");
                setDescription("");
                setPriceAmount("");
              }}
              className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-xl"
            >
              Tiếp tục đăng tin khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Tiêu đề trang */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Đăng Tin Bán Bò Giống & Bò Thịt
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Điền đầy đủ thông tin để người mua nắm rõ thể trạng, giá cả và dễ dàng liên hệ với bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* KHU VỰC 1: HÌNH ẢNH & VIDEO — HẠNG MỤC ƯU TIÊN CAO NHẤT */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center space-x-2">
                <span>Hình ảnh & Video thực tế đàn bò</span>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Bắt buộc
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Chụp rõ toàn thân, đầu và chân bò. Hỗ trợ tải nhiều file, chụp ảnh trực tiếp từ camera.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
              {mediaList.length} tệp
            </span>
          </div>

          {/* Các nút tải lên & Camera */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Chọn từ thiết bị */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 border-2 border-dashed border-stone-300 hover:border-amber-600 hover:bg-amber-50/50 p-4 rounded-2xl transition-all text-stone-700 hover:text-amber-900 group"
            >
              <Upload className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-sm font-bold block">Chọn ảnh & video từ máy</span>
                <span className="text-[11px] text-stone-500">Có thể chọn nhiều tệp cùng lúc</span>
              </div>
            </button>

            {/* Chụp ảnh / Quay video trực tiếp bằng Camera */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 border-2 border-dashed border-stone-300 hover:border-emerald-600 hover:bg-emerald-50/50 p-4 rounded-2xl transition-all text-stone-700 hover:text-emerald-900 group"
            >
              <Camera className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-sm font-bold block">Chụp ảnh / Quay video trực tiếp</span>
                <span className="text-[11px] text-stone-500">Mở máy ảnh điện thoại ngay</span>
              </div>
            </button>
          </div>

          {/* Hidden Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Danh Sách Tệp Đã Chọn Với Tiến Trình & Trạng Thái Riêng Biệt */}
          {mediaList.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {mediaList.map((item) => (
                <div
                  key={item.id}
                  className={`relative rounded-xl overflow-hidden border-2 bg-stone-900 aspect-square flex flex-col justify-between group ${
                    item.isCover ? "border-amber-500 ring-2 ring-amber-500/30" : "border-stone-200"
                  }`}
                >
                  {/* Ảnh / Video Preview */}
                  {item.fileType === "VIDEO" ? (
                    <div className="w-full h-full flex items-center justify-center bg-stone-900">
                      <video src={item.previewUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Thanh Tiến Trình Khi Đang Tải */}
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-3 text-white">
                      <div className="w-full bg-stone-700 h-2 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-amber-500 h-full transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{item.progress}%</span>
                      <span className="text-[10px] text-stone-300">Đang tải tệp...</span>
                    </div>
                  )}

                  {/* Trạng Thái Lỗi & Nút Thử Lại Riêng */}
                  {item.status === "error" && (
                    <div className="absolute inset-0 bg-rose-950/85 flex flex-col items-center justify-center p-2 text-white text-center">
                      <AlertCircle className="w-6 h-6 text-rose-400 mb-1" />
                      <span className="text-[11px] font-bold text-rose-200 mb-2 leading-tight">
                        {item.errorMsg || "Lỗi tải"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRetryFile(item)}
                        className="inline-flex items-center space-x-1 bg-white text-rose-900 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs hover:bg-stone-100"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Thử lại</span>
                      </button>
                    </div>
                  )}

                  {/* Badge Ảnh Bìa */}
                  {item.isCover && item.status === "success" && (
                    <div className="absolute top-1.5 left-1.5 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded shadow-xs flex items-center space-x-0.5">
                      <Star className="w-3 h-3 fill-stone-950" />
                      <span>ẢNH BÌA</span>
                    </div>
                  )}

                  {/* Nút Xóa File & Đặt Làm Ảnh Bìa */}
                  <div className="absolute top-1.5 right-1.5 flex space-x-1">
                    {!item.isCover && item.status === "success" && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(item.id)}
                        className="p-1 rounded-full bg-black/60 hover:bg-amber-600 text-white transition-colors"
                        title="Đặt làm ảnh bìa"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(item.id)}
                      className="p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors"
                      title="Xóa tệp này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon thành công */}
                  {item.status === "success" && !item.isCover && (
                    <div className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Xong</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KHU VỰC 2: THÔNG TIN CHI TIẾT ĐÀN BÒ */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
            Thông tin chi tiết con bò / đàn bò
          </h2>

          {/* Tiêu đề tin */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
              Tiêu đề tin bán <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Bán đàn bò 3B đực 5 con 7 tháng tuổi, ăn khỏe, tăng trọng nhanh tại Ba Vì"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Giống bò */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                Giống bò <span className="text-red-500">*</span>
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-800 font-medium"
              >
                {COMMON_BREEDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="Khác">Giống khác (Tự nhập)</option>
              </select>
            </div>

            {/* Số lượng */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                Số lượng (con) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-800 font-medium"
              />
            </div>

            {/* Cân nặng trung bình */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                Cân nặng ước tính (kg/con)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={weightAvgKg}
                onChange={(e) => setWeightAvgKg(e.target.value)}
                placeholder="VD: 320"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-800 font-medium"
              />
            </div>
          </div>

          {breed === "Khác" && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                Nhập tên giống bò cụ thể
              </label>
              <input
                type="text"
                value={customBreed}
                onChange={(e) => setCustomBreed(e.target.value)}
                placeholder="VD: Bò lai Charolais"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm"
              />
            </div>
          )}

          {/* Hình thức báo giá & Số tiền */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                Cách tính giá bán
              </label>
              <select
                value={priceType}
                onChange={(e) =>
                  setPriceType(e.target.value as "PER_HEAD" | "PER_HERD" | "NEGOTIABLE")
                }
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-800 font-medium"
              >
                <option value="PER_HEAD">Bán theo con (VNĐ / con)</option>
                <option value="PER_HERD">Bán cả đàn (VNĐ trọn gói)</option>
                <option value="NEGOTIABLE">Giá thương lượng / Liên hệ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                Mức giá tham khảo (VNĐ)
              </label>
              <input
                type="text"
                disabled={priceType === "NEGOTIABLE"}
                value={priceAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPriceAmount(val ? Number(val).toLocaleString("vi-VN") : "");
                }}
                placeholder={priceType === "NEGOTIABLE" ? "Để trống (Hiện 'Liên hệ')" : "VD: 28.500.000"}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-amber-900 disabled:bg-stone-100 disabled:text-stone-400"
              />
            </div>
          </div>

          {/* Khu vực chăn nuôi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                Tỉnh / Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-800 font-medium"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                Huyện / Xã / Thôn cụ thể
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="VD: Huyện Ba Vì, gần trạm thú y"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-800"
              />
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
              Mô tả chi tiết thể trạng đàn bò
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi rõ tình trạng sức khỏe, tiêm phòng đầy đủ lở mồm long móng, thức ăn hiện tại (cỏ voi, bã bia, cám), tập tính hiền, có hỗ trợ vận chuyển hay không..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
            />
          </div>
        </div>

        {/* KHU VỰC 3: THÔNG TIN NGƯỜI BÁN NẾU CHƯA ĐĂNG NHẬP */}
        {!user && (
          <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
              Thông tin liên hệ của bạn (Người bán)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                  Số điện thoại gọi <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="VD: 0987654321"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                  Họ và tên / Tên trại bò
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="VD: Trại Bò Giống Hùng Cường"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                  Số Zalo (Nếu khác số gọi)
                </label>
                <input
                  type="tel"
                  value={sellerZalo}
                  onChange={(e) => setSellerZalo(e.target.value)}
                  placeholder="Để trống nếu trùng SĐT"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* KHU VỰC 4: QUYỀN ADMIN (NẾU LÀ ADMIN ĐANG ĐĂNG) */}
        {user?.role === "ADMIN" && (
          <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-800" />
              <div>
                <span className="text-xs font-bold text-amber-950 block">Quyền Quản Trị Viên</span>
                <span className="text-xs text-amber-800">
                  Bạn có thể chọn công khai tin bán ngay hoặc lưu riêng tư.
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setVisibility("PUBLIC")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  visibility === "PUBLIC"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-white text-stone-700 border border-stone-300"
                }`}
              >
                Công khai ngay
              </button>
              <button
                type="button"
                onClick={() => setVisibility("PRIVATE")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  visibility === "PRIVATE"
                    ? "bg-rose-700 text-white shadow-xs"
                    : "bg-white text-stone-700 border border-stone-300"
                }`}
              >
                Lưu riêng tư
              </button>
            </div>
          </div>
        )}

        {/* Lỗi Form nếu có */}
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3.5 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* Nút Đăng Tin */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-stone-500 flex items-center space-x-1">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>
              Tin của bạn sẽ được bảo vệ bản quyền và kết nối trực tiếp với hàng ngàn người mua bò.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Đang gửi tin bán...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Xác nhận đăng tin bán bò</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
