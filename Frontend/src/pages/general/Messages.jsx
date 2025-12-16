import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { conversationsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useSocket } from "../../context/SocketContext";
import PageLoader from "../../components/common/PageLoader";

const MessageBubble = ({ message, isMine }) => {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMine
            ? "bg-[var(--color-accent)] text-white"
            : "bg-[var(--color-surface-alt)] text-[var(--color-text)]"
          }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p className="text-[10px] mt-1 opacity-80">
          {new Date(message.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const ThreadView = ({ conversation, messages, onSend, sending, isTyping }) => {
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { emitTypingStart, emitTypingStop } = useSocket();
  const typingTimeoutRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll on new messages (only if user hasn't scrolled up)
  useEffect(() => {
    if (!userScrolled) {
      scrollToBottom();
    }
  }, [messages, userScrolled]);

  // Detect user scroll
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setUserScrolled(!isAtBottom);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    await onSend(draft.trim());
    setDraft("");
    setUserScrolled(false); // Reset scroll state when sending
    setTimeout(() => scrollToBottom("smooth"), 100);
  };

  const handleTyping = (e) => {
    setDraft(e.target.value);

    if (!conversation?.id) return;

    // Emit typing start
    emitTypingStart(conversation.id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop(conversation.id);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full border rounded-2xl themed-border themed-surface shadow-card">
      <div className="px-4 py-3 border-b themed-border">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {conversation?.property?.title || "Conversation"}
        </p>
        <p className="text-xs themed-text-soft">
          {conversation?.landlord?.firstName} {conversation?.landlord?.lastName}
        </p>
      </div>
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--color-bg)]"
      >
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isMine={m.senderId === conversation.viewerId}
          />
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl px-4 py-2 text-sm bg-[var(--color-surface-alt)] text-[var(--color-text-soft)] italic">
              typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="p-3 border-t themed-border flex gap-2 bg-[var(--color-surface)]"
      >
        <input
          value={draft}
          onChange={handleTyping}
          className="flex-1 rounded-xl px-3 py-2 bg-[var(--color-bg-alt)] border themed-border focus:outline-none"
          placeholder="Type a message"
        />
        <button
          type="submit"
          disabled={sending}
          className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white font-semibold disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
};

const ConversationList = ({ items, activeId, onSelect }) => {
  return (
    <div className="border rounded-2xl themed-border themed-surface shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b themed-border flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          Messages
        </p>
        <span className="text-xs themed-text-soft">{items.length} chats</span>
      </div>
      <div className="max-h-[70vh] overflow-y-auto divide-y divide-[var(--color-border)]">
        {items.length === 0 && (
          <p className="p-4 text-sm themed-text-soft">No conversations yet.</p>
        )}
        {items.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left px-4 py-3 hover:bg-[var(--color-surface-alt)] transition-colors ${c.id === activeId ? "bg-[var(--color-surface-alt)]" : ""
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold flex items-center justify-center">
                {(c.landlord?.firstName || "")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                  {c.property?.title || "Conversation"}
                </p>
                <p className="text-xs themed-text-soft line-clamp-2">
                  {c.lastMessage?.content || "No messages yet"}
                </p>
                <p className="text-[10px] themed-text-soft mt-1">
                  {c.lastMessage?.createdAt
                    ? new Date(c.lastMessage.createdAt).toLocaleString()
                    : new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-semibold h-fit">
                  {c.unreadCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const Messages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { socket, isConnected, joinConversation, leaveConversation } = useSocket();
  const viewerId = user?.id;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeId, setActiveId] = useState(id || null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messageCache = useRef({});

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  const isTyping = typingUsers.size > 0;

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await conversationsAPI.list();
      const items = Array.isArray(res.data) ? res.data : [];
      setConversations(items.map((c) => ({ ...c, viewerId })));
      if (!activeId && items.length > 0) {
        setActiveId(items[0].id);
        navigate(`/messages/${items[0].id}`, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId, { force = false } = {}) => {
    if (!conversationId) return;

    // Serve from cache unless forced
    if (!force && messageCache.current[conversationId]) {
      setMessages(messageCache.current[conversationId]);
    } else {
      const res = await conversationsAPI.listMessages(conversationId, 200, 0);
      const msgs = Array.isArray(res.data) ? res.data : [];
      messageCache.current[conversationId] = msgs;
      setMessages(msgs);
    }

    // Mark as read without refetching all conversations; update local state
    await conversationsAPI.markRead(conversationId);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSend = async (content) => {
    if (!activeId) return;
    setSending(true);
    try {
      await conversationsAPI.sendMessage(activeId, { content });
      // Message will be added via Socket.io event
    } finally {
      setSending(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when activeId changes
  useEffect(() => {
    if (id) {
      setActiveId(id);
      loadMessages(id);
    }
  }, [id]);

  // Join/leave conversation rooms via Socket.io
  useEffect(() => {
    if (activeId && socket && isConnected) {
      joinConversation(activeId);
      return () => {
        leaveConversation(activeId);
      };
    }
  }, [activeId, socket, isConnected]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Update cache and state
      setMessages((prev) => {
        const updated = [...prev, message];
        if (message.conversationId) {
          messageCache.current[message.conversationId] = updated;
        }
        return updated;
      });

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversationId
            ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
            : c
        )
      );
    };

    const handleTypingStart = ({ userId, conversationId }) => {
      if (conversationId === activeId && userId !== viewerId) {
        setTypingUsers((prev) => new Set(prev).add(userId));
      }
    };

    const handleTypingStop = ({ userId, conversationId }) => {
      if (conversationId === activeId) {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, activeId, viewerId]);

  const handleSelect = (conversationId) => {
    setActiveId(conversationId);
    navigate(`/messages/${conversationId}`);
    loadMessages(conversationId);
    setTypingUsers(new Set()); // Clear typing indicators
  };

  return (
    <PageLoader
      sessionKey="messages_visited"
      loading={loading && conversations.length === 0}
      message={t("loadingMessages") || "Loading messages..."}
    >
      <div className="themed-surface min-h-[calc(100vh-140px)] px-6 py-8">
        {/* Connection status indicator */}
        {!isConnected && (
          <div className="max-w-6xl mx-auto mb-4 px-4 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Disconnected - Messages may not update in real-time
          </div>
        )}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[320px_1fr] gap-6">
          <div className="lg:h-[75vh]">
            <ConversationList
              items={conversations}
              activeId={activeId}
              onSelect={handleSelect}
            />
          </div>
          <div className="lg:h-[75vh]">
            {activeConversation ? (
              <ThreadView
                conversation={activeConversation}
                messages={messages}
                onSend={handleSend}
                sending={sending}
                isTyping={isTyping}
              />
            ) : loading ? (
              <div className="h-full rounded-2xl border themed-border themed-surface shadow-card flex items-center justify-center text-sm themed-text-soft">
                Loading conversations...
              </div>
            ) : (
              <div className="h-full rounded-2xl border themed-border themed-surface shadow-card flex items-center justify-center text-sm themed-text-soft">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default Messages;
