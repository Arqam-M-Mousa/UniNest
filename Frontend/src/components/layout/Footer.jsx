import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="themed-surface-alt border-t themed-border">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Logo and Navigation Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <Link to="/" className="text-xl heading-font font-bold text-[var(--color-text)] no-underline hover:text-[var(--color-accent)] transition-colors">
            UniNest
          </Link>
          
          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              to="/"
              className="text-[var(--color-text-soft)] no-underline hover:text-[var(--color-accent)] transition-colors"
            >
              {t("home")}
            </Link>
            <Link
              to="/apartments"
              className="text-[var(--color-text-soft)] no-underline hover:text-[var(--color-accent)] transition-colors"
            >
              {t("apartments")}
            </Link>
            <Link
              to="/marketplace"
              className="text-[var(--color-text-soft)] no-underline hover:text-[var(--color-accent)] transition-colors"
            >
              {t("marketplace")}
            </Link>
            <Link
              to="/about"
              className="text-[var(--color-text-soft)] no-underline hover:text-[var(--color-accent)] transition-colors"
            >
              {t("about")}
            </Link>
            <a
              href="mailto:arqam.mousa@gmail.com"
              className="text-[var(--color-text-soft)] no-underline hover:text-[var(--color-accent)] transition-colors"
            >
              {t("connect")}
            </a>
          </nav>
        </div>
        
        {/* Copyright */}
        <div className="pt-4 border-t themed-border text-center text-xs text-[var(--color-text-soft)]">
          {t("rightsReserved")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
