"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChatConversationItem, ChatMessageItem, UserSession } from "@/types";
import { formatPriceDisplay } from "@/lib/format";
import {
  Send,
  MessageSquare,
  ArrowLeft,
  Phone,
  CheckCheck,
  User,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react";
import CattleLogoIcon from "@/components/icons/CattleLogoIcon";

function ChatInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetListingId = searchParams.get("listingId");

  const [user, setUser] = useState<UserSession | null>(null);
  const [conversations, setConversations] = useState<ChatConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);
  const [filterTab, setFilterTab] = useState<"ALL" | "UNREAD">("ALL");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.user) {
          router.push(targetListingId ? `/dang-nhap?redirect=/chat?listingId=${targetListingId}` : "/dang-nhap");
          return;
        }
        setUser(data.user);

        if (targetListingId) {
          try {
            const createRes = await fetch("/api/chats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ listingId: targetListingId }),
            });
            if (createRes.ok) {
              const cData = await createRes.json();
              setActiveConvId(cData.conversation.id);
              setIsMobileViewingChat(true);
            }
          } catch (err) {
            console.error("Error creating chat:", err);
          }
        }

        loadConversations();
      })
      .catch(() => router.push("/dang-nhap"))
      .finally(() => setLoadingConv(false));
  }, [targetListingId, router]);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (!activeConvId && data.conversations?.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768) {
          setActiveConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/chats/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    loadMessages(activeConvId);

    const interval = setInterval(() => {
      loadMessages(activeConvId);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConvId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeConvId || sending) return;

    const contentToSend = inputMsg.trim();
    setInputMsg("");
    setSending(true);

    try {
      const res = await fetch(`/api/chats/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
        loadConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const partner =
    activeConversation && user
      ? activeConversation.buyerId === user.id
        ? activeConversation.seller
        : activeConversation.buyer
      : null;

  if (loadingConv) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-48 mx-auto mb-6" />
        <div className="h-96 bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  const filteredConversations = conversations.filter((c) => {
    if (filterTab === "UNREAD") return (c.unreadCount || 0) > 0;
    return true;
  });

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-4.5rem)] py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-[80vh] flex flex-col md:flex-row">
          {/* CỘT TRÁI (MÀN 8): DANH SÁCH CUỘC TRÒ CHUYỆN (320-360px) */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50 ${
              isMobileViewingChat ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header danh sách tin nhắn */}
            <div className="p-4 bg-white border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="font-black text-base text-gray-900 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-[#056839]" />
                  <span>Tin Nhắn Sàn Bò</span>
                </h1>
                <button
                  onClick={loadConversations}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Cập nhật"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tab Tất cả vs Chưa đọc */}
              <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterTab("ALL")}
                  className={`py-1.5 rounded-lg transition-all ${
                    filterTab === "ALL"
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Tất cả ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("UNREAD")}
                  className={`py-1.5 rounded-lg transition-all ${
                    filterTab === "UNREAD"
                      ? "bg-white text-[#056839] shadow-2xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Chưa đọc ({conversations.filter((c) => (c.unreadCount || 0) > 0).length})
                </button>
              </div>
            </div>

            {/* Danh sách các cuộc chat */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <span className="text-3xl block mb-2">💬</span>
                  <p className="text-xs font-semibold text-gray-600">Chưa có tin nhắn nào</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Bấm &quot;Nhắn tin&quot; trên các tin bán bò để bắt đầu trao đổi với người bán!
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = conv.buyerId === user?.id ? conv.seller : conv.buyer;
                  const cover = conv.listing?.media?.[0];
                  const isSelected = conv.id === activeConvId;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setIsMobileViewingChat(true);
                      }}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-emerald-50/70" : "hover:bg-gray-100/70 bg-white"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-stone-900 overflow-hidden shrink-0 relative">
                        {cover ? (
                          <img
                            src={cover.fileUrl}
                            alt="Bò"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <CattleLogoIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <span className={`text-xs font-bold truncate ${isSelected ? "text-[#056839]" : "text-gray-900"}`}>
                            {other?.fullName || other?.phone || "Khách quan tâm"}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 truncate font-normal">
                          {conv.listing?.title || "Tin bán bò"}
                        </p>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[11px] text-[#d92d20] font-black">
                            {formatPriceDisplay(conv.listing?.priceAmount ?? null, conv.listing?.priceType ?? "PER_HEAD")}
                          </span>
                          {conv.unreadCount && conv.unreadCount > 0 ? (
                            <span className="bg-[#056839] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                              {conv.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CỘT PHẢI (MÀN 8): KHUNG CHAT VỚI BONG BÓNG XANH LÁ #056839 */}
          <div
            className={`flex-1 flex flex-col bg-gray-50/40 ${
              !isMobileViewingChat ? "hidden md:flex" : "flex"
            }`}
          >
            {activeConversation ? (
              <>
                {/* Header Khung Chat */}
                <div className="p-3.5 sm:p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-2xs z-10">
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => setIsMobileViewingChat(false)}
                      className="p-1 text-gray-600 hover:text-gray-900 rounded-lg md:hidden"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#056839] flex items-center justify-center font-black text-sm shrink-0 border border-emerald-200">
                      {partner?.fullName ? (
                        partner.fullName.charAt(0).toUpperCase()
                      ) : (
                        <CattleLogoIcon className="w-5 h-5 text-[#056839]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                        {partner?.fullName || partner?.phone || "Người liên hệ"}
                      </h2>
                      <div className="text-[11px] text-gray-500 flex items-center space-x-2">
                        <span className="text-emerald-700 font-medium flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#056839] mr-1 inline-block" />
                          Đang hoạt động
                        </span>
                        {partner?.phone && (
                          <span>• {partner.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nút Xem tin & Gọi điện */}
                  {activeConversation.listing && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <Link
                        href={`/listing/${activeConversation.listingId}`}
                        target="_blank"
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-700 hover:text-[#056839] bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <span className="hidden sm:inline">Xem tin bán</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {partner?.phone && (
                        <a
                          href={`tel:${partner.phone}`}
                          className="p-2 bg-[#056839] hover:bg-[#04522d] text-white rounded-lg transition-colors shadow-2xs"
                          title="Gọi điện ngay"
                        >
                          <Phone className="w-4 h-4 stroke-[2.5]" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Vùng Tin Nhắn */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  <div className="text-center my-2">
                    <span className="text-[11px] bg-gray-200/80 text-gray-600 px-3 py-1 rounded-full font-medium">
                      Bắt đầu cuộc trao đổi về tin bán: <strong>{activeConversation.listing?.title}</strong>
                    </span>
                  </div>

                  {messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-2xs ${
                            isMine
                              ? "bg-[#056839] text-white rounded-br-xs"
                              : "bg-white text-gray-900 border border-gray-100 rounded-bl-xs"
                          }`}
                        >
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                          <div
                            className={`flex items-center justify-end space-x-1 text-[9px] mt-1 ${
                              isMine ? "text-emerald-200" : "text-gray-400"
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMine && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Khung Nhập & Nút Gửi */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Nhập nội dung trao đổi (VD: Bò còn không anh, có bớt tiền xe không?)..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#056839]"
                  />
                  <button
                    type="submit"
                    disabled={!inputMsg.trim() || sending}
                    className="px-4 py-2.5 bg-[#056839] hover:bg-[#04522d] active:scale-98 text-white rounded-full font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <span className="text-4xl mb-3">💬</span>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  Chọn một cuộc trò chuyện
                </h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  Chọn từ danh sách bên trái hoặc bấm &quot;Nhắn tin&quot; trên các tin bán bò để bắt đầu trao đổi.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Đang tải khung chat...</div>}>
      <ChatInner />
    </Suspense>
  );
}
