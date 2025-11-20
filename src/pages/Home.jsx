import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { heroFeatureItems } from "../components/FeatureIcons";

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      <section className="relative min-h-[500px] bg-hero-pattern-light dark:bg-hero-pattern-dark bg-cover bg-center flex items-center justify-center text-center text-slate-800 dark:text-white px-8 py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-95">
            {t("heroSubtitle")}
          </p>
          <Link
            to="/marketplace"
            className="inline-block bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary text-white px-10 py-3.5 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {t("startSearching")}
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {heroFeatureItems.map(({ key, Icon, bg, color }) => (
              <div key={key} className="flex flex-col items-center text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${bg}`}
                >
                  <Icon className={`w-10 h-10 ${color}`} aria-hidden="true" />
                </div>
                <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-base">
                  {t(key)}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-800">
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
              <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">
                {t("aboutUs")}
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {t("aboutUsText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-16 bg-gradient-to-r from-primary to-primary-dark dark:from-slate-700 dark:to-slate-800"
        id="offers"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-4xl font-bold text-white mb-12">
            {t("ourOffers")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="md:row-span-2 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 min-h-[400px] flex items-end p-6">
                <div className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-lg">
                  1500$
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 min-h-[200px] flex items-end p-6">
                <div className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold text-lg">
                  1500$
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 min-h-[200px] flex items-end p-6">
                <div className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold text-lg">
                  1500$
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="border-4 border-primary dark:border-primary-dark rounded-3xl p-12 bg-white dark:bg-slate-800">
            <h2 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">
              {t("readyTitle")}
            </h2>
            <Link
              to="/marketplace"
              className="inline-block bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary text-white px-10 py-3.5 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {t("startSearching")}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative min-h-[400px] bg-final-pattern bg-cover bg-center flex items-center justify-center text-white text-center px-8 py-16 dark:brightness-90">
        <div>
          <h2 className="text-4xl font-bold mb-4">{t("builtForStudents")}</h2>
          <p className="text-xl opacity-95">{t("weUnderstand")}</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
