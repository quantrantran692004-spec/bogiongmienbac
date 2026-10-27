import { PriceType } from "@/types";

export function formatPriceDisplay(
  amount: number | null | undefined,
  type: PriceType
): string {
  if (type === "NEGOTIABLE" || amount === null || amount === undefined || amount <= 0) {
    return "Liên hệ";
  }

  const formatted = new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  if (type === "PER_HEAD") {
    return `${formatted} / con`;
  }
  if (type === "PER_HERD") {
    return `${formatted} / cả đàn`;
  }
  return formatted;
}

export function formatPrice(
  amount: number | null | undefined,
  type: PriceType,
  showReferenceBadge = true
): { text: string; subText?: string; badge?: string } {
  if (type === "NEGOTIABLE" || amount === null || amount === undefined || amount <= 0) {
    return {
      text: "Liên hệ",
      subText: "Giá thương lượng trực tiếp",
    };
  }

  const formatted = new Intl.NumberFormat("vi-VN").format(amount) + " đ";

  if (type === "PER_HEAD") {
    return {
      text: formatted,
      subText: "Giá tính trên 1 con",
      badge: showReferenceBadge ? "Giá tham khảo" : undefined,
    };
  }

  if (type === "PER_HERD") {
    return {
      text: formatted,
      subText: "Giá tính trọn cả đàn",
      badge: showReferenceBadge ? "Giá tham khảo" : undefined,
    };
  }

  return { text: formatted };
}

export function formatWeight(kg: number | null | undefined): string {
  if (!kg) return "Chưa cập nhật";
  return `${kg} kg/con`;
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "";
  }
}

export function cleanPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.replace(/[^0-9]/g, "");
}

export function getTelLink(phone: string | null | undefined): string {
  const p = cleanPhone(phone);
  return p ? `tel:${p}` : "#";
}

export function getZaloLink(zalo: string | null | undefined): string {
  const z = cleanPhone(zalo);
  return z ? `https://zalo.me/${z}` : "#";
}
