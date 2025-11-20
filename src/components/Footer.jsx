import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 bg-gradient-to-r from-primary to-primary-dark text-white dark:from-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center text-3xl font-bold mb-10">UniNest</div>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5 text-sm">
          <div className="space-y-3">
            <h3 className="font-semibold tracking-wide uppercase">
              {t("home")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:underline">
                  {t("aboutUsLink")}
                </Link>
              </li>
              <li>
                <Link to="/#offers" className="hover:underline">
                  {t("ourOffers")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold tracking-wide uppercase">
              {t("apartments")}
            </h3>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold tracking-wide uppercase">
              {t("marketplace")}
            </h3>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold tracking-wide uppercase">
              {t("about")}
            </h3>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold tracking-wide uppercase">
              {t("connect")}
            </h3>
            <a href="mailto:UniNest@hotmail.com" className="hover:underline">
              UniNest@hotmail.com
            </a>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/20 text-center text-xs opacity-80">
          {t("rightsReserved")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
