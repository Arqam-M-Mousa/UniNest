import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="themed-surface-alt border-t themed-border">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center text-2xl heading-font font-bold mb-8 text-[var(--color-text)]">
          UniNest
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5 text-sm">
          <div className="space-y-3 text-center sm:text-left">
            <Link
              to="/"
              className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase no-underline hover:text-[var(--color-accent)] transition-colors inline-block"
            >
              {t("home")}
            </Link>
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
          <div className="space-y-3 text-center sm:text-left">
            <Link
              to="/apartments"
              className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase no-underline hover:text-[var(--color-accent)] transition-colors inline-block"
            >
              {t("apartments")}
            </Link>
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <Link
              to="/marketplace"
              className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase no-underline hover:text-[var(--color-accent)] transition-colors inline-block"
            >
              {t("marketplace")}
            </Link>
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <Link
              to="/about"
              className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase no-underline hover:text-[var(--color-accent)] transition-colors inline-block"
            >
              {t("about")}
            </Link>
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <h3 className="heading-font text-[var(--color-text)] text-xs tracking-wide uppercase">
              {t("connect")}
            </h3>
            <a
              href="mailto:arqam.mousa@gmail.com"
              className="no-underline text-[var(--color-text-soft)] hover:text-[var(--color-accent)] transition-colors break-all"
              aria-label="Email UniNest"
            >
              arqam.mousa@gmail.com
            </a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t themed-border text-center text-xs text-[var(--color-text-soft)]">
          {t("rightsReserved")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
