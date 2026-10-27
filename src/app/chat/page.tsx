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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Tải thông tin người dùng & khởi tạo hội thoại nếu có listingId
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.user) {
          // Chưa đăng nhập thì chuyển hướng sang trang đăng nhập
          router.push(targetListingId ? `/dang-nhap?redirect=/chat?listingId=${targetListingId}` : "/dang-nhap");
          return;
        }
        setUser(data.user);

        // Nếu có listingId truyền vào từ nút "Nhắn tin", tạo hoặc mở hội thoại ngay
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

        // Tải danh sách hội thoại
        loadConversations();
      })
      .catch(() => router.push("/dang-nhap"))
      .finally(() => setLoadingConv(false));
  }, [targetListingId, router]);

  // 2. Tải danh sách hội thoại
  const loadConversations = async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        // Nếu chưa chọn cuộc hội thoại nào và có danh sách, chọn cuộc đầu tiên trên desktop
        if (!activeConvId && data.conversations?.length > 0 && window.innerWidth >= 768) {
          setActiveConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Tải tin nhắn của hội thoại đang chọn
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

    // Polling định kỳ mỗi 4 giây để nhận tin nhắn mới
    const interval = setInterval(() => {
      loadMessages(activeConvId);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConvId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn
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
        loadConversations(); // Cập nhật lại vị trí trên danh sách
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  // Tìm đối tác trong cuộc trò chuyện (nếu mình là buyer thì đối tác là seller và ngược lại)
  const partner =
    activeConversation && user
      ? activeConversation.buyerId === user.id
        ? activeConversation.seller
        : activeConversation.buyer
      : null;

  if (loadingConv) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center animate-pulse">
        <div className="h-8 bg-stone-200 rounded-xl w-48 mx-auto mb-6" />
        <div className="h-96 bg-stone-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-6">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden h-[82vh] flex flex-col md:flex-row">
        {/* CỘT TRÁI: DANH SÁCH CUỘC HỘI THOẠI (Ẩn trên mobile nếu đang mở xem chat) */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-stone-200 flex flex-col bg-stone-50/50 ${
            isMobileViewingChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header danh sách chat */}
          <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
            <h1 className="font-bold text-base text-stone-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-amber-800" />
              <span>Tin nhắn trao đổi</span>
            </h1>
            <button
              onClick={loadConversations}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              title="Cập nhật tin nhắn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Danh sách các cuộc chat */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <span className="text-3xl block mb-2">💬</span>
                <p className="text-xs">Chưa có cuộc trò chuyện nào.</p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Hãy bấm &quot;Nhắn tin&quot; trên các tin bán bò để trao đổi cùng người bán!
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
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
                    className={`p-3 sm:p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-amber-100/60" : "hover:bg-stone-100/80 bg-white"
                    }`}
                  >
                    {/* Ảnh bò thu nhỏ */}
                    <div className="w-12 h-12 rounded-xl bg-stone-900 overflow-hidden shrink-0 relative">
                      {cover ? (
                        <img
                          src={cover.fileUrl}
                          alt="Bò"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-400">
                          <CattleLogoIcon className="w-5 h-5 text-amber-200" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {other?.fullName || other?.phone || "Khách quan tâm"}
                        </span>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 truncate font-medium">
                        {conv.listing?.title || "Tin bán bò"}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-amber-900 font-bold">
                          {formatPriceDisplay(conv.listing?.priceAmount ?? null, conv.listing?.priceType ?? "PER_HEAD")}
                        </span>
                        {conv.unreadCount && conv.unreadCount > 0 ? (
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
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

        {/* CỘT PHẢI: KHUNG CHAT VỚI NGƯỜI BÁN / NGƯỜI MUA */}
        <div
          className={`flex-1 flex flex-col bg-stone-50 ${
            !isMobileViewingChat ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConversation ? (
            <>
              {/* Header Khung Chat */}
              <div className="p-3 sm:p-4 bg-white border-b border-stone-200 flex items-center justify-between shadow-2xs z-10">
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Nút lùi lại danh sách trên mobile */}
                  <button
                    onClick={() => setIsMobileViewingChat(false)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg md:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {partner?.fullName ? (
                      partner.fullName.charAt(0).toUpperCase()
                    ) : (
                      <CattleLogoIcon className="w-4 h-4 text-amber-100" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                      {partner?.fullName || partner?.phone || "Người liên hệ"}
                    </h2>
                    <div className="text-[11px] text-stone-500 flex items-center space-x-2">
                      <span className="text-emerald-600 font-medium flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 inline-block" />
                        Đang kết nối
                      </span>
                      {partner?.phone && (
                        <span>• SĐT: <strong>{partner.phone}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thẻ Tin Bán Gắn Kèm Trên Đầu Khung Chat */}
                {activeConversation.listing && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      href={`/listing/${activeConversation.listingId}`}
                      target="_blank"
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors"
                      title="Mở xem tin bán bò"
                    >
                      <span className="hidden sm:inline">Xem tin bán</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {partner?.phone && (
                      <a
                        href={`tel:${partner.phone}`}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs"
                        title="Gọi điện ngay"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Vùng Tin Nhắn */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
                {/* Tin chào đầu hội thoại */}
                <div className="text-center my-3">
                  <span className="text-[11px] bg-stone-200/80 text-stone-600 px-3 py-1 rounded-full">
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
                        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                          isMine
                            ? "bg-amber-800 text-white rounded-br-xs"
                            : "bg-white text-stone-900 border border-stone-200 rounded-bl-xs"
                        }`}
                      >
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                        <div
                          className={`flex items-center justify-end space-x-1 text-[9px] mt-1 ${
                            isMine ? "text-amber-200" : "text-stone-400"
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
                className="p-3 bg-white border-t border-stone-200 flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Nhập nội dung trao đổi (VD: Bò còn không anh, có bớt tiền xe không?)..."
                  className="flex-1 px-4 py-2.5 bg-stone-100 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || sending}
                  className="p-2.5 sm:px-4 sm:py-2.5 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center space-x-1 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-8 text-center">
              <span className="text-4xl mb-3">💬</span>
              <h3 className="text-base font-bold text-stone-700 mb-1">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-xs text-stone-500 max-w-sm">
                Chọn từ danh sách bên trái hoặc bấm &quot;Nhắn tin&quot; trên các tin bán bò để bắt đầu trao đổi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Đang tải khung chat...</div>}>
      <ChatInner />
    </Suspense>
  );
}
