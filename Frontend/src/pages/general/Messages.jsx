import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { conversationsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useSocket } from "../../context/SocketContext";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, CheckIcon, EllipsisVerticalIcon, TrashIcon, ClockIcon } from "@heroicons/react/24/outline";

const MessageBubble = ({ message, isMine, sender, showAvatar = true, showName = true, conversation, onDelete, t, language }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef(null);

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';

    if (isToday) {
      return messageDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatTimestampParts = (date) => {
    const messageDate = new Date(date);
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return {
      time: messageDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
      date: messageDate.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
    };
  };

  // Calculate if message has been read by the other user
  const isRead = () => {
    if (!isMine || !conversation) return false;

    // Determine which lastReadAt to check based on who sent the message
    const otherUserLastReadAt = message.senderId === conversation.studentId
      ? conversation.landlordLastReadAt
      : conversation.studentLastReadAt;

    if (!otherUserLastReadAt) return false;

    // Message is read if the other user's lastReadAt is after the message was created
    return new Date(otherUserLastReadAt) >= new Date(message.createdAt);
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleDeleteClick = () => {
    setMenuOpen(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
    setShowDeleteConfirm(false);
  };

  const timestamp = formatTimestampParts(message.createdAt);

  return (
    <>
      <div className={`group flex gap-2.5 ${isMine ? "justify-end" : "justify-start"} items-end relative`}>
        {/* Three-dot menu for own messages - appears on hover */}
        {isMine && (
          <div className="relative flex items-center" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-[var(--color-surface-alt)] transition-all duration-200"
              aria-label={t("messageOptions") || "Message options"}
            >
              <EllipsisVerticalIcon className="w-4 h-4 text-[var(--color-text-soft)]" />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-48 rounded-lg border themed-border shadow-lg bg-[var(--color-surface)] z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
                {/* Timestamp */}
                <div className="px-3 py-2 border-b themed-border">
                  <div className="flex items-start gap-2 text-xs themed-text-soft">
                    <ClockIcon className="w-3.5 h-3.5 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--color-text)]">
                        {timestamp.time}
                      </span>
                      <span className="text-[10px] opacity-80">
                        {timestamp.date}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Delete option */}
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-3 py-2 flex items-center gap-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>{t("deleteMessage") || "Delete message"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {!isMine && (
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0" style={{ visibility: showAvatar ? 'visible' : 'hidden' }}>
            {sender?.avatarUrl || sender?.profilePictureUrl ? (
              <img
                src={sender.avatarUrl || sender.profilePictureUrl}
                alt={sender?.firstName || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{(sender?.firstName || 'U')[0].toUpperCase()}</span>
            )}
          </div>
        )}
        <div
          className={`max-w-[70%] rounded-[18px] px-4 py-2.5 ${isMine
            ? "bg-[var(--color-accent)] text-white"
            : "bg-[var(--color-surface-alt)] text-[var(--color-text)] border border-[var(--color-border)]"
            }`}
        >
          <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.4]">{message.content}</p>
        </div>
        {isMine && (
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {isRead() ? (
              <div className="relative">
                <CheckIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" strokeWidth={2.5} />
                <CheckIcon className="w-3.5 h-3.5 text-[var(--color-accent)] absolute top-0 left-0.5" strokeWidth={2.5} />
              </div>
            ) : (
              <CheckIcon className="w-3.5 h-3.5 text-[var(--color-text-soft)]" strokeWidth={2} />
            )}
          </div>
        )}
      </div>

      <Alert
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t("deleteMessage")}
        message={t("deleteMessageConfirm") || "Are you sure you want to delete this message? This action cannot be undone."}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        onConfirm={confirmDelete}
      />
    </>
  );
};

const ThreadView = ({ conversation, messages, onSend, sending, isTyping, viewerId, onDeleteMessage, t, language }) => {
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { emitTypingStart, emitTypingStop } = useSocket();
  const typingTimeoutRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);

  // Helper to get the other user in a conversation
  const otherUser = useMemo(() => {
    if (!conversation) return null;
    return conversation.studentId === viewerId ? conversation.landlord : conversation.student;
  }, [conversation, viewerId]);

  // Helper to get conversation title
  const conversationTitle = useMemo(() => {
    if (!conversation) return "";
    if (conversation.property?.listing?.title) return conversation.property.listing.title;
    if (conversation.property?.city) return conversation.property.city;
    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Conversation";
  }, [conversation, otherUser]);

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
    if (!draft.trim() || sending) return;
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Group messages by sender
  const groupedMessages = useMemo(() => {
    const groups = [];
    messages.forEach((msg, idx) => {
      const prevMsg = messages[idx - 1];
      const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
      const showName = showAvatar;
      groups.push({ ...msg, showAvatar, showName });
    });
    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--color-surface)]">
      <div className="flex-shrink-0 px-5 py-4 border-b themed-border bg-[var(--color-surface)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold flex items-center justify-center flex-shrink-0 shadow-sm">
            {otherUser?.avatarUrl || otherUser?.profilePictureUrl ? (
              <img
                src={otherUser.avatarUrl || otherUser.profilePictureUrl}
                alt={otherUser.firstName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{(otherUser?.firstName || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-[var(--color-text)] truncate">
              {conversationTitle}
            </p>
            <p className="text-[11px] themed-text-soft">
              {otherUser?.firstName} {otherUser?.lastName}
              {conversation?.property?.city && ` • ${conversation.property.city}`}
            </p>
          </div>
        </div>
      </div>
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 space-y-1.5 bg-[var(--color-bg)]"
      >
        {groupedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-[var(--color-text-soft)]" />
            </div>
            <p className="text-xl font-light text-[var(--color-text)] mb-2">Your messages</p>
            <p className="text-sm themed-text-soft">Send a message to start a chat</p>
          </div>
        ) : (
          groupedMessages.map((m) => {
            const sender = m.senderId === conversation?.studentId ? conversation?.student : conversation?.landlord;
            return (
              <MessageBubble
                key={m.id}
                message={m}
                isMine={m.senderId === viewerId}
                sender={sender || { firstName: "User" }}
                showAvatar={m.showAvatar}
                showName={m.showName}
                conversation={conversation}
                onDelete={onDeleteMessage}
                t={t}
                language={language}
              />
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start items-end gap-2.5 min-h-[32px]">
            <div className="w-8 h-8 flex-shrink-0" />
            <div className="px-3 py-1.5 rounded-[18px] bg-[var(--color-surface-alt)] border border-[var(--color-border)] inline-flex items-center">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-[var(--color-text-soft)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--color-text-soft)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--color-text-soft)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex-shrink-0 border-t themed-border bg-[var(--color-surface)]">
        <form
          onSubmit={handleSend}
          className="p-3 flex items-end gap-2"
        >
          <textarea
            value={draft}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 rounded-[20px] px-4 py-2.5 bg-[var(--color-bg-alt)] border themed-border focus:outline-none focus:border-[var(--color-accent)] transition-all resize-none text-sm"
            placeholder="Message..."
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="h-10 w-10 rounded-full bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
            aria-label="Send message"
          >
            {sending ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const ConversationList = ({ items, activeId, onSelect, viewerId }) => {
  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Helper to get the other user in a conversation
  const getOtherUser = (c) => {
    if (c.studentId === viewerId) {
      return c.landlord;
    }
    return c.student;
  };

  // Helper to get conversation title
  const getConversationTitle = (c) => {
    if (c.property?.listing?.title) {
      return c.property.listing.title;
    }
    if (c.property?.city) {
      return c.property.city;
    }
    // Direct conversation - use other user's name
    const otherUser = getOtherUser(c);
    if (otherUser) {
      return `${otherUser.firstName} ${otherUser.lastName}`;
    }
    return "Conversation";
  };

  return (
    <div className="bg-[var(--color-surface)] h-full flex flex-col">
      <div className="px-5 py-4 border-b themed-border bg-[var(--color-surface)]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--color-text)]">Messages</h2>
          <span className="px-2.5 py-1 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold">
            {items.length}
          </span>
        </div>
      </div>
      <div className="max-h-[calc(70vh-80px)] overflow-y-auto divide-y divide-[var(--color-border)]">
        {items.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center mx-auto mb-3">
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-[var(--color-text-soft)]" />
            </div>
            <p className="text-base font-medium text-[var(--color-text)] mb-1">No messages yet</p>
            <p className="text-xs themed-text-soft">Start a conversation to begin chatting</p>
          </div>
        )}
        {items.map((c) => {
          const otherUser = getOtherUser(c);
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-5 py-4 hover:bg-[var(--color-surface)] transition-all duration-200 cursor-pointer relative ${c.id === activeId ? "bg-[var(--color-surface)]" : ""
                } ${c.unreadCount > 0 ? "border-l-[3px] border-[var(--color-accent)]" : "border-l-[3px] border-transparent"}`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold flex items-center justify-center shadow-sm">
                    {otherUser?.avatarUrl || otherUser?.profilePictureUrl ? (
                      <img
                        src={otherUser.avatarUrl || otherUser.profilePictureUrl}
                        alt={otherUser.firstName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{(otherUser?.firstName || 'U')[0].toUpperCase()}</span>
                    )}
                  </div>
                  {c.unreadCount > 0 && (
                    <>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[var(--color-surface-alt)] shadow-sm">
                        {c.unreadCount > 9 ? '9+' : c.unreadCount}
                      </div>
                      <div className="absolute -left-1 top-1 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className={`text-sm truncate ${c.unreadCount > 0 ? 'font-extrabold text-[var(--color-text)]' : 'font-bold text-[var(--color-text)]'
                      }`}>
                      {getConversationTitle(c)}
                    </p>
                    <span className="text-[11px] themed-text-soft flex-shrink-0">
                      {formatTime(c.lastMessage?.createdAt || c.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs themed-text-soft mb-1.5 font-medium">
                    {otherUser?.firstName} {otherUser?.lastName}
                  </p>
                  <p className={`text-xs line-clamp-1 ${c.unreadCount > 0 ? 'text-[var(--color-text)] font-semibold' : 'themed-text-soft font-normal'
                    }`}>
                    {c.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Messages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
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

      // Only auto-navigate if there's no ID in the URL and no active conversation
      if (!id && !activeId && items.length > 0) {
        setActiveId(items[0].id);
        navigate(`/messages/${items[0].id}`, { replace: true });
      }
      return items; // Return items for chaining
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Don't throw, just log - let the UI handle the empty state
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId, { force = false } = {}) => {
    if (!conversationId) return;

    try {
      // Serve from cache unless forced
      if (!force && messageCache.current[conversationId]) {
        setMessages(messageCache.current[conversationId]);
      } else {
        const res = await conversationsAPI.listMessages(conversationId, 200, 0);
        const msgs = Array.isArray(res.data) ? res.data : [];
        messageCache.current[conversationId] = msgs;
        setMessages(msgs);
      }

      // Mark as read and get the updated conversation with new lastReadAt timestamps
      const markReadResponse = await conversationsAPI.markRead(conversationId);
      const updatedConversation = markReadResponse.data;

      // Update local state with the new lastReadAt timestamps
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
              ...c,
              unreadCount: 0,
              studentLastReadAt: updatedConversation.studentLastReadAt,
              landlordLastReadAt: updatedConversation.landlordLastReadAt,
            }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
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

  const handleDeleteMessage = async (messageId) => {
    if (!activeId || !messageId) return;
    try {
      await conversationsAPI.deleteMessage(activeId, messageId);
      // Remove message from local state
      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== messageId);
        messageCache.current[activeId] = updated;
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadConversations();
  }, []);

  // When conversations load, check if there's an ID in the URL to activate
  useEffect(() => {
    if (conversations.length > 0 && id && !activeId) {
      const conversationExists = conversations.find(c => c.id === id);
      if (conversationExists) {
        setActiveId(id);
        loadMessages(id);
      }
    }
  }, [conversations.length, id]);

  // Load messages when activeId changes (user clicks on a conversation)
  useEffect(() => {
    console.log('Active ID changed:', activeId);
    if (activeId && conversations.length > 0) {
      const conversationExists = conversations.find(c => c.id === activeId);

      if (conversationExists) {
        console.log('Loading messages for conversation:', activeId);
        loadMessages(activeId);
      } else {
        // Conversation doesn't exist, might be newly created
        console.log('Conversation not found, reloading conversations...');
        loadConversations().then((items) => {
          const updatedConversation = items.find(c => c.id === activeId);
          if (updatedConversation) {
            console.log('Found conversation after reload, loading messages');
            loadMessages(activeId);
          }
        });
      }
    }
  }, [activeId, conversations.length]);

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
      // Only handle messages for the currently active conversation
      if (message.conversationId !== activeId) {
        // Still update conversation list for other conversations
        setConversations((prev) =>
          prev.map((c) =>
            c.id === message.conversationId
              ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
              : c
          )
        );
        return;
      }

      // Update cache and state - prevent duplicates by checking message ID
      setMessages((prev) => {
        // Check if message already exists (prevent duplicates from multiple socket events)
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        const updated = [...prev, message];
        messageCache.current[message.conversationId] = updated;
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

    const handleConversationRead = ({ conversationId, studentLastReadAt, landlordLastReadAt }) => {
      // Update the conversation state with new lastReadAt timestamps
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
              ...c,
              studentLastReadAt,
              landlordLastReadAt,
            }
            : c
        )
      );
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("conversation:read", handleConversationRead);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("conversation:read", handleConversationRead);
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
      <div className="themed-surface h-[calc(100vh-80px)] px-6 py-6">
        {/* Connection status indicator */}
        {!isConnected && (
          <div className="max-w-6xl mx-auto mb-4 px-4 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Disconnected - Messages may not update in real-time
          </div>
        )}
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 border themed-border rounded-2xl overflow-hidden shadow-lg h-full">
            <div className="h-[50vh] lg:h-full border-b lg:border-b-0 lg:border-r themed-border">
              <ConversationList
                items={conversations}
                activeId={activeId}
                onSelect={handleSelect}
                viewerId={viewerId}
              />
            </div>
            <div className="h-[50vh] lg:h-full overflow-hidden">
              {activeConversation ? (
                <ThreadView
                  conversation={activeConversation}
                  messages={messages}
                  onSend={handleSend}
                  sending={sending}
                  isTyping={isTyping}
                  viewerId={viewerId}
                  onDeleteMessage={handleDeleteMessage}
                  t={t}
                  language={language}
                />
              ) : loading ? (
                <div className="h-full rounded-2xl border themed-border bg-[var(--color-surface)] shadow-lg flex flex-col items-center justify-center text-center px-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mb-4"></div>
                  <p className="text-sm themed-text-soft">Loading conversations...</p>
                </div>
              ) : (
                <div className="h-full rounded-2xl border themed-border bg-[var(--color-surface)] shadow-lg flex flex-col items-center justify-center text-center px-4">
                  <div className="w-24 h-24 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center mb-4">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-[var(--color-text-soft)]" />
                  </div>
                  <p className="text-xl font-light text-[var(--color-text)] mb-2">Your messages</p>
                  <p className="text-sm themed-text-soft">Select a message to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default Messages;
