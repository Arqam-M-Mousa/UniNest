import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";

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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleSignOut = () => {
    signout();
    setUserMenuOpen(false);
  };

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Escape key to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
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
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen, userMenuOpen]);

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
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          >
            {language === "en" ? "العربية" : "English"}
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          >
            {theme === "light" ? (
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
                  d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414"
                />
                <circle cx="12" cy="12" r="5" />
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
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                />
              </svg>
            )}
          </button>

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
          <div className="flex justify-between items-center gap-2 px-4 py-4 bg-[var(--color-surface)]">
            <button
              onClick={toggleLanguage}
              className="flex-1 px-3 py-2 rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            >
              {language === "en" ? "العربية" : "English"}
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            >
              {theme === "light" ? (
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
                    d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414"
                  />
                  <circle cx="12" cy="12" r="5" />
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
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
