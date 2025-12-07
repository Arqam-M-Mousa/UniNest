import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { notificationsAPI, conversationsAPI } from "../services/api";

const navLinksConfig = (t) => [
  { to: "/", label: t("home"), match: (p) => p === "/" },
  {
    to: "/apartments",
    label: t("apartments"),
    match: (p) => p === "/apartments",
  },
  {
    to: "/marketplace",
    label: t("marketplace"),
    match: (p) => p.startsWith("/marketplace"),
  },
  { to: "/about", label: t("about"), match: (p) => p === "/about" },
  { to: "/contact", label: t("contact"), match: (p) => p === "/contact" },
];

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const totalUnreadMessages = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  const handleSignOut = () => {
    signout();
    setUserMenuOpen(false);
  };

  const loadNotifications = async () => {
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
  };

  const loadConversations = async () => {
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
  };

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
    setNotifOpen(false);
    setMsgOpen(false);
  }, [location.pathname]);

  // Escape key to close menus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotifOpen(false);
        setMsgOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close menus
  useEffect(() => {
    const onClick = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
      if (
        notifOpen &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
      if (msgOpen && msgRef.current && !msgRef.current.contains(e.target)) {
        setMsgOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen, userMenuOpen, notifOpen, msgOpen]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur shadow-sm border-b themed-border bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 py-3">
        {/* Left: Brand + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xl heading-font font-bold tracking-tight text-[var(--color-text)]"
          >
            UniNest
          </Link>
          <button
            type="button"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 border themed-border text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] transition-colors"
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinksConfig(t).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={
                (link.match(location.pathname)
                  ? "text-[var(--color-accent)] font-semibold"
                  : "themed-text-soft hover:text-[var(--color-accent)]") +
                " transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    const next = !notifOpen;
                    setNotifOpen(next);
                    if (next) loadNotifications();
                    setMsgOpen(false);
                    setUserMenuOpen(false);
                  }}
                  className="relative p-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                  aria-label="Notifications"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notifUnread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] px-1 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      {notifUnread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 max-h-[70vh] overflow-y-auto rounded-xl border themed-border shadow-2xl themed-surface backdrop-blur-sm z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 py-3 border-b themed-border">
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        Notifications
                      </p>
                      <button
                        className="text-xs text-[var(--color-accent)] hover:underline"
                        onClick={() =>
                          notificationsAPI.markAllRead().then(loadNotifications)
                        }
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                      {notifLoading ? (
                        <p className="p-4 text-sm themed-text-soft">
                          Loading...
                        </p>
                      ) : notifications.length === 0 ? (
                        <p className="p-4 text-sm themed-text-soft">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            className={`w-full text-left px-4 py-3 hover:bg-[var(--color-surface-alt)] transition-colors ${
                              n.isRead ? "themed-text-soft" : ""
                            }`}
                            onClick={() => {
                              notificationsAPI
                                .markRead(n.id)
                                .then(loadNotifications);
                              if (n.actionUrl)
                                window.location.href = n.actionUrl;
                            }}
                          >
                            <p className="text-sm font-semibold text-[var(--color-text)] line-clamp-1">
                              {n.title}
                            </p>
                            <p className="text-xs themed-text-soft line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[10px] themed-text-soft mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={msgRef}>
                <button
                  onClick={() => {
                    const next = !msgOpen;
                    setMsgOpen(next);
                    if (next) loadConversations();
                    setNotifOpen(false);
                    setUserMenuOpen(false);
                  }}
                  className={`relative p-2 rounded-md border themed-border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] ${
                    msgOpen || totalUnreadMessages > 0
                      ? "bg-[var(--color-surface-alt)] text-[var(--color-accent)]"
                      : "themed-text-soft hover:bg-[var(--color-surface-alt)]"
                  }`}
                  aria-label="Messages"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] px-1 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      {totalUnreadMessages}
                    </span>
                  )}
                </button>
                {msgOpen && (
                  <div className="absolute right-0 mt-3 w-96 max-h-[70vh] overflow-y-auto rounded-xl border themed-border shadow-2xl themed-surface backdrop-blur-sm z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b themed-border flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        Messages
                      </p>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                      {msgLoading ? (
                        <p className="p-4 text-sm themed-text-soft">
                          Loading...
                        </p>
                      ) : conversations.length === 0 ? (
                        <p className="p-4 text-sm themed-text-soft">
                          No conversations yet.
                        </p>
                      ) : (
                        conversations.map((c) => (
                          <button
                            key={c.id}
                            className="w-full text-left px-4 py-3 hover:bg-[var(--color-surface-alt)] transition-colors"
                            onClick={() => {
                              setMsgOpen(false);
                              navigate(`/messages/${c.id}`);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold flex items-center justify-center">
                                {c.landlord && c.landlord.firstName?.[0]}
                                {c.landlord && c.landlord.lastName?.[0]}
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
                                    ? new Date(
                                        c.lastMessage.createdAt
                                      ).toLocaleString()
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
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                aria-label="Account menu"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border themed-border shadow-2xl themed-surface backdrop-blur-sm overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent border-b themed-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs themed-text-soft truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs font-medium">
                      {user?.role}
                    </span>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm themed-text-soft hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-all group"
                    >
                      <svg
                        className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="font-medium">
                        {t("My profile") || "My Profile"}
                      </span>
                    </Link>
                    <div className="px-4 py-3 text-sm border-t themed-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-[var(--color-accent)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-7.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707"
                          />
                        </svg>
                        <span className="font-medium">Theme</span>
                      </div>
                      <button
                        onClick={() => {
                          toggleTheme();
                        }}
                        className="px-3 py-1 rounded-full border themed-border text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
                      >
                        {theme === "dark" ? "Dark" : "Light"}
                      </button>
                    </div>
                    <div className="px-4 py-3 text-sm border-t themed-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-[var(--color-accent)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 5v14m7-7H5"
                          />
                        </svg>
                        <span className="font-medium">Language</span>
                      </div>
                      <button
                        onClick={() => {
                          toggleLanguage();
                        }}
                        className="px-3 py-1 rounded-full border themed-border text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
                      >
                        {language === "en" ? "English" : "Arabic"}
                      </button>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all group"
                    >
                      <svg
                        className="w-4 h-4 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="font-medium">
                        {t("logout") || "Sign Out"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="p-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
              aria-label="Account"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={
          "md:hidden fixed inset-x-0 top-[60px] z-40 px-4 pb-8 pt-4 transition-transform duration-300 " +
          (menuOpen
            ? "translate-y-0"
            : "-translate-y-4 pointer-events-none opacity-0")
        }
        aria-hidden={!menuOpen}
      >
        <div className="rounded-xl border themed-border shadow-lg themed-surface-alt overflow-hidden">
          <nav
            className="flex flex-col divide-y divide-[var(--color-border)]"
            role="navigation"
          >
            {navLinksConfig(t).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={
                  "px-4 py-3 text-sm font-medium transition-colors " +
                  (link.match(location.pathname)
                    ? "bg-[var(--color-surface)] text-[var(--color-accent)]"
                    : "themed-text-soft hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
