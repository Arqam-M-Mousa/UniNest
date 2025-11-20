import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { heroFeatureItems } from "../components/FeatureIcons";
import campusClockImg from "../assets/campus_clock.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import nnuImg from "../assets/nnu.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import heroImg from "../assets/image.jpg";
import studentsImg from "../assets/lhrm_ljdyd_jm_lnjh.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center text-center px-6 py-24 md:py-32 overflow-hidden min-h-[500px]">
        {/* Background Image */}
        <img
          src={heroImg}
          alt="Campus Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-white/40 dark:bg-black/40"
          aria-hidden="true"
        />
        <div className="relative max-w-4xl z-10">
          <h1 className="heading-font text-4xl md:text-5xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
            {t("heroTitle")}
          </h1>
          <p className="text-lg md:text-xl mb-10 text-white/90 drop-shadow-md">
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
              <img
                src={campusClockImg}
                alt="Campus Clock"
                className="w-full max-w-[569px] h-auto rounded-lg shadow-lg object-cover"
              />
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
      <section className="py-20 themed-surface">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative rounded-[50px] p-16 themed-surface-alt border-4 themed-border shadow-2xl overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)]/15 dark:bg-[var(--color-accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-accent)]/15 dark:bg-[var(--color-accent)]/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <h2 className="heading-font text-4xl md:text-5xl font-bold mb-4 text-[var(--color-text)]">
                {t("readyTitle")}
              </h2>
              <p className="text-lg text-[var(--color-text-soft)] mb-10 max-w-2xl mx-auto">
                Browse hundreds of verified student-friendly apartments and find
                your perfect home today
              </p>
              <Link
                to="/marketplace"
                className="inline-block px-12 py-4 rounded-full font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-all hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--color-ring)]"
              >
                {t("startSearching")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Banner */}
      <section className="relative min-h-[320px] flex items-center justify-center text-center px-6 py-20 overflow-hidden">
        <img
          src={studentsImg}
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative max-w-3xl z-10">
          <h2 className="heading-font text-4xl font-bold mb-4 text-white drop-shadow-lg">
            {t("builtForStudents")}
          </h2>
          <p className="text-xl text-white drop-shadow-md">
            {t("weUnderstand")}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
