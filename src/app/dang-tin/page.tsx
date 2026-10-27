"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  ChevronRight,
  ChevronLeft,
  Check,
  Eye,
  Scale,
  MapPin,
  DollarSign,
  Tag,
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
];

export default function DangTinPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [user, setUser] = useState<UserSession | null>(null);

  // Form Fields - Bước 1: Thông tin cơ bản
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

  // Thông tin liên hệ nếu chưa đăng nhập
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerZalo, setSellerZalo] = useState("");

  // Media files - Bước 2
  const [mediaList, setMediaList] = useState<UploadFileItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const [createdVisibility, setCreatedVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setSellerPhone(data.user.phone || "");
          setSellerName(data.user.fullName || "");
          setSellerZalo(data.user.zaloNumber || "");
        }
      })
      .catch(() => {});
  }, []);

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
    newItems.forEach((item) => uploadSingleFile(item));
    e.target.value = "";
  };

  const uploadSingleFile = (item: UploadFileItem) => {
    setMediaList((prev) =>
      prev.map((m) =>
        m.id === item.id ? { ...m, status: "uploading", progress: 15, errorMsg: undefined } : m
      )
    );

    const formData = new FormData();
    formData.append("file", item.file);

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
                ? { ...m, status: "success", progress: 100, uploadedUrl: res.fileUrl }
                : m
            )
          );
        } catch {
          setMediaList((prev) =>
            prev.map((m) =>
              m.id === item.id ? { ...m, status: "error", errorMsg: "Máy chủ phản hồi lỗi" } : m
            )
          );
        }
      } else {
        setMediaList((prev) =>
          prev.map((m) =>
            m.id === item.id ? { ...m, status: "error", errorMsg: "Tải file thất bại" } : m
          )
        );
      }
    };

    xhr.onerror = () => {
      setMediaList((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...m, status: "error", errorMsg: "Lỗi kết nối mạng" } : m
        )
      );
    };

    xhr.send(formData);
  };

  const handleRemoveFile = (id: string) => {
    setMediaList((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      if (filtered.length > 0 && !filtered.some((m) => m.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const handleSetCover = (id: string) => {
    setMediaList((prev) =>
      prev.map((m) => ({
        ...m,
        isCover: m.id === id,
      }))
    );
  };

  const validateStep1 = () => {
    setFormError(null);
    if (!title.trim() || title.trim().length < 5) {
      setFormError("Tiêu đề tin bán bò phải có ít nhất 5 ký tự.");
      return false;
    }
    if (!province) {
      setFormError("Vui lòng chọn Tỉnh / Thành phố nơi nuôi đàn bò.");
      return false;
    }
    if (priceType !== "NEGOTIABLE") {
      const cleanPrice = parseFloat(priceAmount.replace(/\D/g, ""));
      if (isNaN(cleanPrice) || cleanPrice <= 0) {
        setFormError("Vui lòng nhập mức giá bán hợp lệ hoặc chọn 'Giá thương lượng / Liên hệ'.");
        return false;
      }
    }
    if (!user) {
      const cleanPhone = sellerPhone.replace(/\s+/g, "");
      if (!cleanPhone || !/^0\d{9}$/.test(cleanPhone)) {
        setFormError("Vui lòng nhập số điện thoại hợp lệ của bạn (10 chữ số, ví dụ 0912345678).");
        return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    setFormError(null);
    const hasUploading = mediaList.some((m) => m.status === "uploading");
    if (hasUploading) {
      setFormError("Ảnh/video đang tải lên máy chủ, vui lòng chờ trong giây lát.");
      return false;
    }
    const successfulMedia = mediaList.filter((m) => m.status === "success" && m.uploadedUrl);
    if (successfulMedia.length === 0) {
      setFormError("Vui lòng tải lên ít nhất 1 hình ảnh đàn bò thực tế rõ nét.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    setSubmitting(true);

    try {
      const successfulMedia = mediaList
        .filter((m) => m.status === "success" && m.uploadedUrl)
        .map((m, idx) => ({
          fileUrl: m.uploadedUrl as string,
          fileType: m.fileType,
          isCover: m.isCover,
          sortOrder: idx,
        }));

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
      if (!res.ok) throw new Error(data.error || "Không thể đăng tin");

      setCreatedVisibility(data.listing.visibility || "PRIVATE");
      setSuccessId(data.listing.id);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    const isPublic = createdVisibility === "PUBLIC";

    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center shadow-xs space-y-5">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm ${
              isPublic
                ? "bg-emerald-100 text-[#056839]"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <h2 className="text-2xl font-black text-gray-900">
            {isPublic ? "Đăng Tin Bán Bò Thành Công!" : "Tiếp Nhận Tin Đăng Thành Công!"}
          </h2>

          <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
            {isPublic
              ? "Tin bán bò của bạn đã được công khai trực tiếp ngay trên trang chủ. Người mua có thể tìm kiếm, gọi điện và nhắn tin trao đổi với bạn ngay lập tức!"
              : "Tin bán bò của bạn đã được gửi tới Ban Quản Trị để kiểm duyệt nhằm đảm bảo tính minh bạch và an toàn giao dịch. Quản trị viên sẽ xem xét và kích hoạt hiển thị công khai sớm nhất."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={isPublic ? `/listing/${successId}` : "/tai-khoan"}
              className="px-6 py-3 bg-[#056839] hover:bg-[#04522d] text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
            >
              {isPublic ? "Xem tin vừa đăng" : "Theo dõi trong Quản lý tài khoản"}
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccessId(null);
                setCurrentStep(1);
                setTitle("");
                setDescription("");
                setMediaList([]);
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl transition-colors"
            >
              Đăng thêm tin khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Tiêu đề & Breadcrumb */}
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
            <Link href="/" className="hover:text-[#056839]">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">Đăng tin bán</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Đăng Tin Bán Bò Giống
          </h1>
        </div>

        {/* STEPPER 3 BƯỚC ĐÚNG MÀN 4 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {/* Bước 1 */}
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep >= 1 ? "bg-[#056839] text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {currentStep > 1 ? <Check className="w-5 h-5 stroke-[2.5]" /> : "1"}
              </div>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  currentStep === 1 ? "text-[#056839]" : "text-gray-600"
                }`}
              >
                1. Thông tin cơ bản
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-3 sm:mx-6 transition-colors ${
                currentStep >= 2 ? "bg-[#056839]" : "bg-gray-200"
              }`}
            />

            {/* Bước 2 */}
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep >= 2 ? "bg-[#056839] text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {currentStep > 2 ? <Check className="w-5 h-5 stroke-[2.5]" /> : "2"}
              </div>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  currentStep === 2 ? "text-[#056839]" : "text-gray-600"
                }`}
              >
                2. Hình ảnh & Video
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-3 sm:mx-6 transition-colors ${
                currentStep >= 3 ? "bg-[#056839]" : "bg-gray-200"
              }`}
            />

            {/* Bước 3 */}
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep === 3 ? "bg-[#056839] text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  currentStep === 3 ? "text-[#056839]" : "text-gray-600"
                }`}
              >
                3. Hoàn tất
              </span>
            </div>
          </div>
        </div>

        {/* NỘI DUNG TỪNG BƯỚC */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-2xs space-y-6">
          {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tiêu đề tin bán <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Bán đàn bò 3B đực 5 con 7 tháng tuổi, ăn khỏe, tăng trọng nhanh tại Ba Vì"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#056839]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Giống bò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium"
                  >
                    {COMMON_BREEDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="Khác">Giống khác (Tự nhập)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số lượng (con) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Cân nặng ước tính (kg/con)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={weightAvgKg}
                    onChange={(e) => setWeightAvgKg(e.target.value)}
                    placeholder="VD: 320"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              {breed === "Khác" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tên giống bò cụ thể
                  </label>
                  <input
                    type="text"
                    value={customBreed}
                    onChange={(e) => setCustomBreed(e.target.value)}
                    placeholder="VD: Bò lai Charolais Pháp"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              )}

              {/* Hình thức báo giá & Số tiền */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Hình thức giá bán
                  </label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value as "PER_HEAD" | "PER_HERD" | "NEGOTIABLE")}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                  >
                    <option value="PER_HEAD">Bán theo con (VNĐ / con)</option>
                    <option value="PER_HERD">Bán cả đàn (VNĐ trọn gói)</option>
                    <option value="NEGOTIABLE">Giá thương lượng / Liên hệ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mức giá mong muốn (VNĐ)
                  </label>
                  <input
                    type="text"
                    disabled={priceType === "NEGOTIABLE"}
                    value={priceAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPriceAmount(val ? Number(val).toLocaleString("vi-VN") : "");
                    }}
                    placeholder={priceType === "NEGOTIABLE" ? "Hiện 'Liên hệ trực tiếp'" : "VD: 25.000.000"}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#d92d20] disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Địa điểm chăn nuôi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Huyện / Xã / Thôn cụ thể
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="VD: Xã Ba Trại, Huyện Ba Vì"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Thông tin người bán nếu chưa login */}
              {!user && (
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                  <h4 className="font-bold text-sm text-[#056839]">Thông tin liên hệ người nuôi</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        SĐT gọi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        placeholder="0987..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Họ tên / Tên trại</label>
                      <input
                        type="text"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        placeholder="Trại Bò Nam Ba Vì"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Số Zalo</label>
                      <input
                        type="tel"
                        value={sellerZalo}
                        onChange={(e) => setSellerZalo(e.target.value)}
                        placeholder="Trùng SĐT nếu để trống"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BƯỚC 2: HÌNH ẢNH & VIDEO */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center space-x-3 border-2 border-dashed border-gray-300 hover:border-[#056839] hover:bg-emerald-50/40 p-6 rounded-2xl transition-all group"
                >
                  <Upload className="w-6 h-6 text-[#056839] group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="font-bold text-sm text-gray-900 block">Tải ảnh & video từ thiết bị</span>
                    <span className="text-xs text-gray-500">Hỗ trợ JPG, PNG, MP4</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center space-x-3 border-2 border-dashed border-gray-300 hover:border-amber-600 hover:bg-amber-50/40 p-6 rounded-2xl transition-all group"
                >
                  <Camera className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="font-bold text-sm text-gray-900 block">Chụp ảnh camera trực tiếp</span>
                    <span className="text-xs text-gray-500">Mở máy ảnh điện thoại ngay</span>
                  </div>
                </button>
              </div>

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

              {/* Danh sách ảnh đã chọn */}
              {mediaList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-stone-900 group ${
                        item.isCover ? "border-[#056839] ring-2 ring-[#056839]/30" : "border-gray-200"
                      }`}
                    >
                      <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />

                      {/* Tiến trình upload */}
                      {item.status === "uploading" && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2">
                          <span className="text-xs font-bold">{item.progress}%</span>
                          <span className="text-[10px]">Đang tải...</span>
                        </div>
                      )}

                      {/* Nút đặt cover & Xóa */}
                      <div className="absolute top-1.5 right-1.5 flex space-x-1">
                        {!item.isCover && item.status === "success" && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(item.id)}
                            className="p-1 rounded-full bg-black/60 hover:bg-[#056839] text-white"
                            title="Đặt làm ảnh bìa"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.id)}
                          className="p-1 rounded-full bg-black/60 hover:bg-red-600 text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.isCover && (
                        <div className="absolute bottom-1.5 left-1.5 bg-[#056839] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          ẢNH BÌA
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Mô tả chi tiết ở Bước 2 */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mô tả đặc điểm & ghi chú đàn bò
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi rõ tình trạng sức khỏe, chế độ ăn (cỏ voi, cám), tiêm phòng, vận chuyển..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#056839]"
                />
              </div>
            </div>
          )}

          {/* BƯỚC 3: HOÀN TẤT & XEM LẠI */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {user?.role === "ADMIN" ? (
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-[#056839] shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Đăng tin với quyền Quản Trị Viên</h4>
                    <p className="text-xs text-gray-600">
                      Tin đăng của bạn sẽ tự động xuất hiện công khai trên sàn Bò Giống Miền Bắc ngay lập tức.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center space-x-3">
                  <Info className="w-6 h-6 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Gửi tin đăng tới Ban Quản Trị kiểm duyệt</h4>
                    <p className="text-xs text-gray-600">
                      Để bảo vệ quyền lợi người mua và người bán, tin đăng của bạn sẽ được Ban Quản Trị rà soát và duyệt hiển thị công khai trên sàn trong thời gian sớm nhất.
                    </p>
                  </div>
                </div>
              )}

              {/* Bản xem trước tóm tắt */}
              <div className="border border-gray-200 rounded-2xl p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="font-bold text-gray-900 text-sm">Xem trước tin đăng</span>
                  <span className="text-xs font-bold text-[#056839] bg-emerald-50 px-2.5 py-1 rounded-md">
                    {breed}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900">{title}</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                  <div><strong>Số lượng:</strong> {quantity} con</div>
                  <div><strong>Cân nặng:</strong> {weightAvgKg ? `${weightAvgKg} kg` : "Chưa rõ"}</div>
                  <div><strong>Khu vực:</strong> {[district, province].filter(Boolean).join(", ")}</div>
                  <div><strong>Số ảnh:</strong> {mediaList.length} tệp</div>
                </div>

                <div className="pt-2">
                  <span className="text-xs text-gray-500">Giá bán: </span>
                  <span className="text-xl font-black text-[#d92d20]">
                    {priceType === "NEGOTIABLE" ? "Liên hệ trực tiếp" : `${priceAmount || "0"} VNĐ`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Thông báo lỗi nếu có */}
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* NÚT ĐIỀU HƯỚNG BƯỚC (QUAY LẠI, LƯU NHÁP, TIẾP TỤC / ĐĂNG TIN) */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1 === 1 ? 1 : 2))}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-[#056839] hover:bg-[#04522d] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Tiếp tục</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-[#056839] hover:bg-[#04522d] active:scale-98 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Đang xuất bản tin...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{user?.role === "ADMIN" ? "Xác nhận đăng tin công khai" : "Gửi tin tới Ban Quản Trị"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
