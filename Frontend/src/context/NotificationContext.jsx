import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { notificationsAPI, conversationsAPI } from "../services/api";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { socket } = useSocket();

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  // Conversations/Messages state
  const [conversations, setConversations] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const totalUnreadMessages = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setNotifLoading(true);
      const res = await notificationsAPI.list();
      setNotifications(res.data?.items || []);
      setNotifUnread(res.data?.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setNotifLoading(false);
    }
  }, [isAuthenticated]);

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setMsgLoading(true);
      const res = await conversationsAPI.list();
      const items = Array.isArray(res.data) ? res.data : [];
      setConversations(items);
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setMsgLoading(false);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setNotifUnread((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }, []);

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setNotifUnread(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  }, []);

  // Update conversation unread count (e.g., when user reads messages)
  const markConversationRead = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, []);

  // Fetch notifications and conversations on login
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadConversations();
    } else {
      // Clear state on logout
      setNotifications([]);
      setNotifUnread(0);
      setConversations([]);
    }
  }, [isAuthenticated, loadNotifications, loadConversations]);

  // Socket listener for real-time message notifications
  useEffect(() => {
    if (!socket || !isAuthenticated || !user) return;

    const handleNewMessage = (message) => {
      // Only increment unread count if this message is NOT from the current user
      if (message.senderId === user.id) {
        return;
      }

      // Update conversations state
      setConversations((prev) => {
        // If conversations haven't been loaded yet, load them
        if (prev.length === 0) {
          loadConversations();
          return prev;
        }

        // Find and update the conversation
        const conversationExists = prev.find((c) => c.id === message.conversationId);

        if (conversationExists) {
          // Update existing conversation
          return prev.map((c) =>
            c.id === message.conversationId
              ? {
                  ...c,
                  lastMessage: message,
                  lastMessageAt: message.createdAt,
                  unreadCount: (c.unreadCount || 0) + 1,
                }
              : c
          );
        } else {
          // Conversation not in list, reload all conversations
          loadConversations();
          return prev;
        }
      });
    };

    // Listen for new notifications via socket
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setNotifUnread((prev) => prev + 1);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, isAuthenticated, user, loadConversations]);

  const value = {
    // Notifications
    notifications,
    notifUnread,
    notifLoading,
    loadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    // Conversations/Messages
    conversations,
    msgLoading,
    totalUnreadMessages,
    loadConversations,
    markConversationRead,
    setConversations,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
