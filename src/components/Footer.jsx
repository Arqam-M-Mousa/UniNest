import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="themed-surface-alt border-t themed-border">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-2xl heading-font font-bold mb-6 text-[var(--color-text)]">
          UniNest
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-5 text-sm">
          <div className="space-y-3">
            <h3 className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase">
              {t("home")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="no-underline text-[var(--color-text-soft)] hover:text-[var(--color-accent)] transition-colors"
                >
                  {t("aboutUsLink")}
                </Link>
              </li>
              <li>
                <Link
                  to="/#offers"
                  className="no-underline text-[var(--color-text-soft)] hover:text-[var(--color-accent)] transition-colors"
                >
                  {t("ourOffers")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <Link
              to="/apartments"
              className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase no-underline hover:text-[var(--color-accent)] transition-colors block"
            >
              {t("apartments")}
            </Link>
          </div>
          <div className="space-y-3">
            <Link
              to="/marketplace"
              className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase no-underline hover:text-[var(--color-accent)] transition-colors block"
            >
              {t("marketplace")}
            </Link>
          </div>
          <div className="space-y-3">
            <Link
              to="/about"
              className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase no-underline hover:text-[var(--color-accent)] transition-colors block"
            >
              {t("about")}
            </Link>
          </div>
          <div className="space-y-3">
            <h3 className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase">
              {t("connect")}
            </h3>
            <a
              href="mailto:UniNest@hotmail.com"
              className="no-underline text-[var(--color-text-soft)] hover:text-[var(--color-accent)] transition-colors"
              aria-label="Email UniNest"
            >
              UniNest@hotmail.com
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t themed-border text-center text-xs text-[var(--color-text-soft)]">
          {t("rightsReserved")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
