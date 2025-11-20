import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 backdrop-blur shadow-sm border-b themed-border bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-6 py-3">
        <Link
          to="/"
          className="text-xl heading-font font-bold tracking-tight text-[var(--color-text)]"
        >
          UniNest
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {[
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
            {
              to: "/contact",
              label: t("contact"),
              match: (p) => p === "/contact",
            },
          ].map((link) => (
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
        </div>
      </div>
    </header>
  );
};

export default Header;
