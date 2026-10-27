export type UserRole = "ADMIN" | "SELLER";

export type ListingStatus = "SELLING" | "SOLD" | "HIDDEN";

export type ListingVisibility = "PUBLIC" | "PRIVATE";

export type PriceType = "PER_HEAD" | "PER_HERD" | "NEGOTIABLE";

export type MediaType = "IMAGE" | "VIDEO";

export interface UserSession {
  id: string;
  phone: string;
  fullName: string | null;
  zaloNumber: string | null;
  role: UserRole;
}

export interface ListingMediaItem {
  id: string;
  listingId: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileType: MediaType;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
}

export interface PriceHistoryItem {
  id: string;
  listingId: string;
  oldPrice: number | null;
  newPrice: number | null;
  oldPriceType: PriceType | null;
  newPriceType: PriceType;
  changedByUserId: string;
  changedAt: string;
  changedByUser?: {
    fullName: string | null;
    phone: string;
  };
}

export interface SellerInfo {
  id: string;
  phone: string;
  fullName: string | null;
  zaloNumber: string | null;
  role: UserRole;
}

export interface ListingItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  breed: string;
  quantity: number;
  weightAvgKg: number | null;
  priceType: PriceType;
  priceAmount: number | null;
  status: ListingStatus;
  visibility: ListingVisibility;
  createdByAdmin: boolean;
  province: string | null;
  district: string | null;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  seller: SellerInfo;
  media: ListingMediaItem[];
  priceHistories?: PriceHistoryItem[];
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversationItem {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string;
  createdAt: string;
  listing?: {
    id: string;
    title: string;
    priceAmount: number | null;
    priceType: PriceType;
    media: ListingMediaItem[];
  };
  buyer?: SellerInfo;
  seller?: SellerInfo;
  messages?: ChatMessageItem[];
  unreadCount?: number;
}

export interface SiteSettingsMap {
  site_name: string;
  site_slogan: string;
  hotline: string;
  zalo_admin: string;
  notice_banner: string;
}

export interface ListingFilterParams {
  search?: string;
  breed?: string;
  province?: string;
  priceType?: PriceType;
  priceMin?: number;
  priceMax?: number;
  weightMin?: number;
  weightMax?: number;
  status?: ListingStatus;
}
