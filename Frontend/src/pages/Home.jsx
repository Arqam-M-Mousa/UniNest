import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import AnimatedFeatures from "../components/AnimatedFeatures";
import campusClockImg from "../assets/campus_clock.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import nnuImg from "../assets/nnu.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import heroImg from "../assets/image.jpg";
import studentsImg from "../assets/lhrm_ljdyd_jm_lnjh.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import Reveal from "../components/Reveal";

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center text-center px-4 sm:px-6 py-24 md:py-36 overflow-hidden min-h-[500px] md:min-h-[600px]">
        {/* Background Image */}
        <img
          src={heroImg}
          alt="Campus Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Simplified overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"
          aria-hidden="true"
        />
        <div className="relative max-w-5xl z-10 px-4 sm:px-6">
          <Reveal
            as="h1"
            className="heading-font text-4xl sm:text-5xl md:text-7xl font-extrabold mb-8 leading-tight text-white tracking-tight"
            style={{
              textShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          >
            {t("heroTitle")}
          </Reveal>
          <Reveal
            as="p"
            className="text-lg sm:text-xl md:text-2xl mb-10 md:mb-12 text-white/95 font-medium max-w-3xl mx-auto leading-relaxed"
            style={{
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            {t("heroSubtitle")}
          </Reveal>
          <Reveal>
            <Link
              to="/marketplace"
              className="inline-block px-12 py-4 rounded-full font-semibold text-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              {t("startSearching")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 themed-surface features-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedFeatures variant="home" />
        </div>
      </section>

      {/* About Us */}
      <section className="py-16 sm:py-20 themed-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="flex justify-center order-2 md:order-1">
              <img
                src={campusClockImg}
                alt="Campus Clock"
                className="w-full max-w-[600px] h-auto rounded-2xl shadow-xl object-cover"
                loading="lazy"
                sizes="(min-width: 1024px) 45vw, 90vw"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="heading-font text-3xl sm:text-4xl font-bold mb-6 text-[var(--color-text)]">
                {t("aboutUs")}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[var(--color-text-soft)]">
                {t("aboutUsText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offers */}
      <section
        className="py-16 sm:py-20 bg-[var(--color-surface)] dark:bg-[var(--color-surface-alt)]"
        id="offers"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal
            as="h2"
            className="heading-font text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-16 text-[var(--color-text)]"
          >
            {t("ourOffers")}
          </Reveal>
          {/* Improved 3-card carousel layout */}
          <div className="relative flex items-center justify-center gap-6 md:gap-10 max-w-6xl mx-auto px-4 min-h-[450px]">
            {[
              { src: campusClockImg, alt: "Campus Clock", price: "1500$" },
              { src: nnuImg, alt: "Campus Housing", price: "1500$" },
              { src: heroImg, alt: "Student Life", price: "1500$" },
            ].map((offer, i) => (
              <Reveal
                key={i}
                className={`group relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 cursor-pointer
                  ${
                    i === 1
                      ? "w-[45%] md:w-[420px] h-[380px] md:h-[450px] z-20"
                      : "w-[27%] md:w-[300px] h-[300px] md:h-[360px] z-10 opacity-80"
                  }
                  hover:scale-105 hover:opacity-100 hover:z-30 hover:shadow-2xl
                `}
                style={{
                  transform:
                    i === 0
                      ? "perspective(1200px) rotateY(6deg)"
                      : i === 2
                      ? "perspective(1200px) rotateY(-6deg)"
                      : "perspective(1200px) rotateY(0deg)",
                }}
              >
                <div className="relative h-full flex flex-col">
                  {/* Image */}
                  <img
                    src={offer.src}
                    alt={offer.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading={i === 1 ? "eager" : "lazy"}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500"></div>
                  {/* Price badge */}
                  <div
                    className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-[var(--color-surface)] px-8 py-3 rounded-full font-bold shadow-xl transition-all duration-300 group-hover:scale-110 ${
                      i !== 1 ? "text-base px-5 py-2" : "text-xl"
                    }`}
                  >
                    <span className="text-[var(--color-text)]">
                      {offer.price}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ready CTA */}
      <section className="py-20 md:py-24 themed-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative rounded-3xl p-12 md:p-20 themed-surface-alt border-2 themed-border shadow-xl overflow-hidden">
            {/* Simplified decorative elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--color-accent)]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--color-accent)]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

            <div className="relative z-10">
              <Reveal delay={0}>
                <h2 className="heading-font text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-[var(--color-text)]">
                  {t("readyTitle")}
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-lg sm:text-xl text-[var(--color-text-soft)] mb-10 max-w-2xl mx-auto leading-relaxed">
                  {t("ctaBrowseSubtitle")}
                </p>
              </Reveal>
              <Reveal delay={260}>
                <Link
                  to="/marketplace"
                  className="inline-block px-14 py-4 rounded-full font-semibold text-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-all hover:scale-105 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[var(--color-ring)]"
                >
                  {t("startSearching")}
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Final Banner */}
      <section className="relative min-h-[350px] sm:min-h-[400px] flex items-center justify-center text-center px-4 sm:px-6 py-20 sm:py-24 overflow-hidden">
        <img
          src={studentsImg}
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" aria-hidden="true" />
        <div className="relative max-w-4xl z-10 px-4">
          <Reveal
            as="h2"
            className="heading-font text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}
          >
            {t("builtForStudents")}
          </Reveal>
          <Reveal
            as="p"
            className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          >
            {t("weUnderstand")}
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
