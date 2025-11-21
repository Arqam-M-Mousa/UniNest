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
      <section className="relative flex items-center justify-center text-center px-4 sm:px-6 py-20 md:py-32 overflow-hidden min-h-[420px] md:min-h-[520px]">
        {/* Background Image with blur */}
        <img
          src={heroImg}
          alt="Campus Background"
          className="absolute inset-0 w-full h-full object-cover object-center scale-108 blur-[2px]"
          loading="eager"
        />
        {/* Overlay with gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 dark:from-black/50 dark:via-black/40 dark:to-black/60"
          aria-hidden="true"
        />
        <div className="relative max-w-4xl z-10 px-2 sm:px-4">
          <Reveal
            as="h1"
            className="heading-font text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-2xl tracking-tight"
            style={{
              textShadow:
                "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {t("heroTitle")}
          </Reveal>
          <Reveal
            as="p"
            className="text-base sm:text-lg md:text-2xl mb-8 md:mb-10 text-white font-medium drop-shadow-lg max-w-2xl mx-auto leading-relaxed"
            style={{
              textShadow:
                "0 2px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)",
            }}
          >
            {t("heroSubtitle")}
          </Reveal>
          <Reveal>
            <Link
              to="/marketplace"
              className="inline-block px-10 py-3.5 rounded-full font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-md shadow-black/10 dark:shadow-black/40 transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--color-ring)] anim-btn-pulse"
            >
              {t("startSearching")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-16 themed-surface features-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedFeatures variant="home" />
        </div>
      </section>

      {/* About Us */}
      <section className="py-14 sm:py-16 themed-bg-alt">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="flex justify-center">
              <img
                src={campusClockImg}
                alt="Campus Clock"
                className="w-full max-w-[569px] h-auto rounded-lg shadow-lg object-cover aspect-[16/10] md:aspect-auto"
                loading="lazy"
                sizes="(min-width: 1024px) 45vw, 90vw"
              />
            </div>
            <div>
              <h2 className="heading-font text-2xl sm:text-3xl font-bold mb-6 text-[var(--color-text)]">
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
        className="py-14 sm:py-16 bg-[var(--color-surface)] dark:bg-[var(--color-surface-alt)]"
        id="offers"
      >
        <div className="max-w-6xl mx-auto px-4">
          <Reveal
            as="h2"
            className="heading-font text-center text-4xl font-bold mb-12 text-[var(--color-text)]"
          >
            {t("ourOffers")}
          </Reveal>
          {/* 3 rotating cards layout */}
          <div className="relative flex items-center justify-center gap-4 md:gap-8 max-w-6xl mx-auto px-4 min-h-[400px]">
            {[
              { src: campusClockImg, alt: "Campus Clock", price: "1500$" },
              { src: nnuImg, alt: "Campus Housing", price: "1500$" },
              { src: heroImg, alt: "Student Life", price: "1500$" },
            ].map((offer, i) => (
              <Reveal
                key={i}
                className={`group relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer
                  ${
                    i === 1
                      ? "w-[45%] md:w-[400px] h-[350px] md:h-[400px] z-20 scale-100"
                      : "w-[25%] md:w-[280px] h-[280px] md:h-[320px] z-10 opacity-70"
                  }
                  hover:scale-105 hover:opacity-100 hover:z-30 hover:shadow-3xl
                `}
                style={{
                  transform:
                    i === 0
                      ? "perspective(1000px) rotateY(8deg)"
                      : i === 2
                      ? "perspective(1000px) rotateY(-8deg)"
                      : "perspective(1000px) rotateY(0deg)",
                }}
              >
                <div className="relative h-full flex flex-col">
                  {/* Image */}
                  <img
                    src={offer.src}
                    alt={offer.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading={i === 1 ? "eager" : "lazy"}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                  {/* Price pill */}
                  <div
                    className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-[var(--color-surface)] px-6 py-2 rounded-full font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110 animate-float-slow ${
                      i !== 1 ? "text-sm px-4 py-1" : ""
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

      {/* Ready CTA (Animated) */}
      <section className="py-16 md:py-20 themed-surface">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative rounded-3xl md:rounded-[50px] p-10 md:p-16 themed-surface-alt border-4 themed-border shadow-2xl overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)]/15 dark:bg-[var(--color-accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2 animate-float-slow"></div>
            <div
              className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-accent)]/15 dark:bg-[var(--color-accent)]/5 rounded-full translate-y-1/2 -translate-x-1/2 animate-float-slow"
              style={{ animationDelay: "1.2s" }}
            ></div>

            <div className="relative z-10">
              <Reveal delay={0}>
                <h2 className="heading-font text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[var(--color-text)]">
                  {t("readyTitle")}
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-base sm:text-lg text-[var(--color-text-soft)] mb-8 md:mb-10 max-w-2xl mx-auto">
                  {t("ctaBrowseSubtitle")}
                </p>
              </Reveal>
              <Reveal delay={260}>
                <Link
                  to="/marketplace"
                  className="inline-block px-12 py-4 rounded-full font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-all hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--color-ring)] animate-glow-pulse"
                >
                  {t("startSearching")}
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Final Banner */}
      <section className="relative min-h-[300px] sm:min-h-[320px] flex items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-20 overflow-hidden">
        <img
          src={studentsImg}
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover blur-[1px]"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative max-w-3xl z-10">
          <Reveal
            as="h2"
            className="heading-font text-3xl sm:text-4xl font-bold mb-4 text-white drop-shadow-lg"
          >
            {t("builtForStudents")}
          </Reveal>
          <Reveal
            as="p"
            className="text-lg sm:text-xl text-white drop-shadow-md max-w-2xl mx-auto"
          >
            {t("weUnderstand")}
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
