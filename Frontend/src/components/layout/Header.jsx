import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingLibraryIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useEffect, useState, useRef } from "react";
import CloudinaryImage from "../media/CloudinaryImage";

const navLinksConfig = (t, user) => [
  { to: "/", label: t("home"), match: (p) => p === "/" },
  {
    to: "/apartments",
    label: t("apartments"),
    match: (p) => p === "/apartments",
  },
  {
    to: "/roommates",
    label: t("roommates"),
    match: (p) => p.startsWith("/roommates"),
    studentOnly: true,
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
  const {
    notifications,
    notifUnread,
    notifLoading,
    loadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    conversations,
    msgLoading,
    totalUnreadMessages,
    loadConversations,
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const guestMenuRef = useRef(null);

  const handleSignOut = () => {
    signout();
    setUserMenuOpen(false);
    navigate("/");
  };

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
    setNotifOpen(false);
    setMsgOpen(false);
    setGuestMenuOpen(false);
  }, [location.pathname]);

  // Escape key to close menus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotifOpen(false);
        setMsgOpen(false);
        setUserMenuOpen(false);
        setGuestMenuOpen(false);
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
      if (
        guestMenuOpen &&
        guestMenuRef.current &&
        !guestMenuRef.current.contains(e.target)
      ) {
        setGuestMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen, userMenuOpen, notifOpen, msgOpen, guestMenuOpen]);


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
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinksConfig(t, user)
            .filter(link => !link.studentOnly || (user?.role === "Student"))
            .map((link) => (
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
                  <BellIcon className="h-5 w-5" />
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
                        {t("notifications")}
                      </p>
                      <button
                        className="text-xs text-[var(--color-accent)] hover:underline"
                        onClick={() => markAllNotificationsRead()}
                      >
                        {t("markAllRead")}
                      </button>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                      {notifLoading ? (
                        <p className="p-4 text-sm themed-text-soft">
                          {t("loading")}
                        </p>
                      ) : notifications.length === 0 ? (
                        <p className="p-4 text-sm themed-text-soft">
                          {t("noNotifications")}
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            className={`w-full text-left px-4 py-3 hover:bg-[var(--color-surface-alt)] transition-colors ${n.isRead ? "themed-text-soft" : ""
                              }`}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.actionUrl)
                                navigate(n.actionUrl);
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
                  className={`relative p-2 rounded-md border themed-border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] ${msgOpen || totalUnreadMessages > 0
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
                        {t("messages")}
                      </p>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                      {msgLoading ? (
                        <p className="p-4 text-sm themed-text-soft">
                          {t("loading")}
                        </p>
                      ) : conversations.length === 0 ? (
                        <p className="p-4 text-sm themed-text-soft">
                          {t("noConversations")}
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
                                  {c.property?.title || t("conversation")}
                                </p>
                                <p className="text-xs themed-text-soft line-clamp-2">
                                  {c.lastMessage?.content || t("noMessagesYet")}
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
                className="p-2 h-10 w-10 flex items-center justify-center rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                aria-label={t("accountMenu")}
              >
                {user?.profilePictureUrl ? (
                  <CloudinaryImage
                    src={user.profilePictureUrl}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-md object-contain bg-[var(--color-surface)]"
                  />
                ) : (
                  <UserCircleIcon className="h-6 w-6" />
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border themed-border shadow-2xl themed-surface backdrop-blur-sm overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent border-b themed-border">
                    <div className="flex items-center gap-3 mb-2">
                      {user?.profilePictureUrl ? (
                        <CloudinaryImage
                          src={user.profilePictureUrl}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-md object-contain bg-[var(--color-surface)] border-2 border-[var(--color-accent)]/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </div>
                      )}
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
                      {user?.role === "Student"
                        ? t("student")
                        : user?.role === "Landlord"
                          ? t("landlord")
                          : user?.role === "SuperAdmin"
                            ? t("superadmin")
                            : t("admin")}
                    </span>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm themed-text-soft hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-all group"
                    >
                      <UserCircleIcon className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
                      <span className="font-medium">
                        {t("myProfile")}
                      </span>
                    </Link>
                    {user?.role === "Student" && (
                      <Link
                        to="/roommates/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm themed-text-soft hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-all group"
                      >
                        <UserCircleIcon className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
                        <span className="font-medium">
                          {t("roommateProfile")}
                        </span>
                      </Link>
                    )}
                    {(user?.role?.toLowerCase() === "landlord" || user?.role?.toLowerCase() === "superadmin") && (
                      <Link
                        to="/my-listings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm themed-text-soft hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-all group"
                      >
                        <HomeModernIcon className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
                        <span className="font-medium">
                          {t("myListings") || "My Listings"}
                        </span>
                      </Link>
                    )}
                    {user?.role?.toLowerCase() === "superadmin" && (
                      <div className="border-t themed-border">
                        <div className="px-4 py-2 text-xs font-semibold text-[var(--color-text-soft)] uppercase tracking-wider">
                          {t("administration")}
                        </div>
                        <Link
                          to="/admin/universities"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm themed-text-soft hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-all group"
                        >
                          <BuildingLibraryIcon className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{t("universities")}</span>
                        </Link>
                        <Link
                          to="/admin/manage-admins"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm themed-text-soft hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-all group"
                        >
                          <UserCircleIcon className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{t("adminManagement") || "Admin Management"}</span>
                        </Link>
                        <Link
                          to="/admin/verification"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm themed-text-soft hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-all group"
                        >
                          <svg className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="font-medium">{t("verification") || "Verification"}</span>
                        </Link>
                      </div>
                    )}
                    {(user?.role === "Admin") && (
                      <div className="border-t themed-border">
                        <div className="px-4 py-2 text-xs font-semibold text-[var(--color-text-soft)] uppercase tracking-wider">
                          {t("administration")}
                        </div>
                        <Link
                          to="/admin/verification"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm themed-text-soft hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-all group"
                        >
                          <svg className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="font-medium">{t("verification") || "Verification"}</span>
                        </Link>
                      </div>
                    )}
                    <div className="px-4 py-3 text-sm border-t themed-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {theme === "dark" ? (
                          <MoonIcon className="w-4 h-4 text-[var(--color-accent)]" />
                        ) : (
                          <SunIcon className="w-4 h-4 text-[var(--color-accent)]" />
                        )}
                        <span className="font-medium">{t("theme")}</span>
                      </div>
                      <button
                        onClick={() => {
                          toggleTheme();
                        }}
                        className="px-3 py-1 rounded-full border themed-border text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
                      >
                        {theme === "dark" ? t("dark") : t("light")}
                      </button>
                    </div>
                    <div className="px-4 py-3 text-sm border-t themed-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LanguageIcon className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="font-medium">{t("language")}</span>
                      </div>
                      <button
                        onClick={() => {
                          toggleLanguage();
                        }}
                        className="px-3 py-1 rounded-full border themed-border text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
                      >
                        {language === "en" ? t("english") : t("arabic")}
                      </button>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all group"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">
                        {t("logout") || "Sign Out"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={guestMenuRef}>
              <button
                onClick={() => setGuestMenuOpen(!guestMenuOpen)}
                className="p-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                aria-label={t("guestMenu")}
              >
                <UserCircleIcon className="h-6 w-6" />
              </button>

              {guestMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border themed-border shadow-2xl themed-surface backdrop-blur-sm overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    <Link
                      to="/signin"
                      onClick={() => setGuestMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm themed-text-soft hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-all group"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
                      <span className="font-medium">
                        {t("signIn") || "Sign In"}
                      </span>
                    </Link>
                    <div className="px-4 py-3 text-sm border-t themed-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {theme === "dark" ? (
                          <MoonIcon className="w-4 h-4 text-[var(--color-accent)]" />
                        ) : (
                          <SunIcon className="w-4 h-4 text-[var(--color-accent)]" />
                        )}
                        <span className="font-medium">{t("theme")}</span>
                      </div>
                      <button
                        onClick={() => {
                          toggleTheme();
                        }}
                        className="px-3 py-1 rounded-full border themed-border text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
                      >
                        {theme === "dark" ? t("dark") : t("light")}
                      </button>
                    </div>
                    <div className="px-4 py-3 text-sm border-t themed-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LanguageIcon className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="font-medium">{t("language")}</span>
                      </div>
                      <button
                        onClick={() => {
                          toggleLanguage();
                        }}
                        className="px-3 py-1 rounded-full border themed-border text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
                      >
                        {language === "en" ? t("english") : t("arabic")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            {navLinksConfig(t, user)
              .filter(link => !link.studentOnly || (user?.role === "Student"))
              .map((link) => (
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
