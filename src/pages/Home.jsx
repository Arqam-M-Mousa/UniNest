import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { heroFeatureItems } from "../components/FeatureIcons";

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center text-center px-6 py-24 md:py-32">
        <div
          className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-alt)] to-[var(--color-bg)] dark:from-[var(--color-bg-alt)] dark:to-[var(--color-bg)]"
          aria-hidden="true"
        />
        <div className="relative max-w-4xl">
          <h1 className="heading-font text-4xl md:text-5xl font-bold mb-6 leading-tight text-[var(--color-text)]">
            {t("heroTitle")}
          </h1>
          <p className="text-lg md:text-xl mb-10 text-[var(--color-text-soft)]">
            {t("heroSubtitle")}
          </p>
          <Link
            to="/marketplace"
            className="inline-block px-10 py-3.5 rounded-full font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-md shadow-black/10 dark:shadow-black/40 transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--color-ring)]"
          >
            {t("startSearching")}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 themed-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {heroFeatureItems.map(({ key, Icon }) => (
              <div key={key} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)]">
                  <Icon
                    className="w-10 h-10 text-[var(--color-accent)]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-semibold text-base text-[var(--color-text)]">
                  {t(key)}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16 themed-bg-alt">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="#E0E7FF" />
                <path
                  d="M100 40 L60 80 L60 140 L140 140 L140 80 Z"
                  fill="#6366f1"
                />
                <rect x="85" y="100" width="30" height="40" fill="#4f46e5" />
                <circle cx="70" cy="60" r="15" fill="#06b6d4" opacity="0.8" />
              </svg>
            </div>
            <div>
              <h2 className="heading-font text-3xl font-bold mb-6 text-[var(--color-text)]">
                {t("aboutUs")}
              </h2>
              <p className="text-base leading-relaxed text-[var(--color-text-soft)]">
                {t("aboutUsText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offers */}
      <section
        className="py-16 bg-[var(--color-surface)] dark:bg-[var(--color-surface-alt)]"
        id="offers"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="heading-font text-center text-4xl font-bold mb-12 text-[var(--color-text)]">
            {t("ourOffers")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[400, 200, 200].map((h, i) => (
              <div
                key={i}
                className={`rounded-2xl overflow-hidden shadow-2xl ${
                  i === 0 ? "md:row-span-2" : ""
                }`}
              >
                <div
                  className={`relative bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] min-h-[${h}px] flex items-end p-6`}
                >
                  <div className="themed-surface px-6 py-2 rounded-full font-bold text-lg">
                    1500$
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready CTA */}
      <section className="py-16 themed-surface">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="border-4 border-[var(--color-accent)] rounded-3xl p-12 themed-surface-alt">
            <h2 className="heading-font text-3xl font-bold mb-8 text-[var(--color-text)]">
              {t("readyTitle")}
            </h2>
            <Link
              to="/marketplace"
              className="inline-block px-10 py-3.5 rounded-full font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--color-ring)]"
            >
              {t("startSearching")}
            </Link>
          </div>
        </div>
      </section>

      {/* Final Banner */}
      <section className="relative min-h-[320px] flex items-center justify-center text-center px-6 py-20">
        <div
          className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] opacity-90 dark:opacity-75"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <h2 className="heading-font text-4xl font-bold mb-4 text-white drop-shadow-sm">
            {t("builtForStudents")}
          </h2>
          <p className="text-xl text-white/90">{t("weUnderstand")}</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
