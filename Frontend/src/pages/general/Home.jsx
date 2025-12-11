import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { propertyListingsAPI } from "../../services/api";
import AnimatedFeatures from "../../components/features/home/AnimatedFeatures";
import campusClockImg from "../../assets/campus_clock.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import nnuImg from "../../assets/nnu.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import heroImg from "../../assets/image.jpg";
import studentsImg from "../../assets/lhrm_ljdyd_jm_lnjh.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import Reveal from "../../components/common/Reveal";

const Home = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(1);
  const [latestProperties, setLatestProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  // Fetch latest 3 properties
  useEffect(() => {
    const fetchLatestProperties = async () => {
      try {
        setPropertiesLoading(true);
        const response = await propertyListingsAPI.list({
          sortBy: "createdAt",
          sortOrder: "DESC",
          limit: 3,
        });
        setLatestProperties(response.data.listings || []);
      } catch (error) {
        console.error("Failed to fetch latest properties:", error);
        // Keep empty array on error
      } finally {
        setPropertiesLoading(false);
      }
    };

    fetchLatestProperties();
  }, []);

  // Auto-rotate cards every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
              to="/apartments"
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
          {/* Improved 3-card carousel layout */}
          <div className="relative h-[450px] md:h-[550px] max-w-6xl mx-auto px-4 w-full">
            {propertiesLoading ? (
              // Loading skeleton
              <div className="text-center text-[var(--color-text-soft)]">
                <div className="animate-pulse">Loading latest properties...</div>
              </div>
            ) : latestProperties.length > 0 ? (
              latestProperties.map((property, i) => {
                // Calculate relative position: -1 (left), 0 (center), 1 (right)
                const relativePos = (i - activeIndex + 3) % 3;
                const position = relativePos === 0 ? 0 : relativePos === 1 ? 1 : -1;
                const isCenter = position === 0;

                // Get primary image or fallback
                const primaryImage = property.images?.find(img => img.isPrimary)?.url ||
                  property.images?.[0]?.url ||
                  heroImg;

                return (
                  <Link
                    to={`/apartments/${property.id}`}
                    key={property.id}
                    className={`group absolute top-1/2 cursor-pointer rounded-2xl overflow-hidden bg-[var(--color-surface-alt)] no-underline
                    ${isCenter
                        ? "w-[85%] md:w-[450px] h-[380px] md:h-[450px] opacity-100 shadow-2xl ring-4 ring-[var(--color-accent)]/30"
                        : "w-[70%] md:w-[320px] h-[300px] md:h-[360px] opacity-50 shadow-xl"
                      }
                    hover:opacity-100
                  `}
                    style={{
                      left: position === 0 ? "50%" : position === -1 ? "15%" : "85%",
                      transform: `translate(-50%, -50%) scale(${isCenter ? 1 : 0.85})`,
                      zIndex: position === 0 ? 20 : 10,
                      transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="relative h-full flex flex-col bg-[var(--color-surface-alt)]">
                      {/* Image */}
                      <img
                        src={primaryImage}
                        alt={property.title || "Property"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading={isCenter ? "eager" : "lazy"}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500"></div>
                      {/* Property title */}
                      {isCenter && (
                        <div className="absolute top-6 left-6 right-6">
                          <h3 className="text-white font-bold text-lg md:text-xl line-clamp-2" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                            {property.title}
                          </h3>
                        </div>
                      )}
                      {/* Price badge */}
                      <div
                        className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-[var(--color-surface)] px-8 py-3 rounded-full font-bold shadow-xl transition-all duration-300 group-hover:scale-110 ${!isCenter ? "text-base px-5 py-2" : "text-xl"
                          }`}
                      >
                        <span className="text-[var(--color-text)]">
                          {property.pricePerMonth} {property.currency || "NIS"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              // Fallback to static images if no properties
              [
                { src: campusClockImg, alt: "Campus Clock", price: "1500$" },
                { src: nnuImg, alt: "Campus Housing", price: "1500$" },
                { src: heroImg, alt: "Student Life", price: "1500$" },
              ].map((offer, i) => {
                const relativePos = (i - activeIndex + 3) % 3;
                const position = relativePos === 0 ? 0 : relativePos === 1 ? 1 : -1;
                const isCenter = position === 0;

                return (
                  <div
                    key={i}
                    className={`group absolute top-1/2 cursor-pointer rounded-2xl overflow-hidden bg-[var(--color-surface-alt)]
                    ${isCenter
                        ? "w-[85%] md:w-[450px] h-[380px] md:h-[450px] opacity-100 shadow-2xl ring-4 ring-[var(--color-accent)]/30"
                        : "w-[70%] md:w-[320px] h-[300px] md:h-[360px] opacity-50 shadow-xl"
                      }
                    hover:opacity-100
                  `}
                    style={{
                      left: position === 0 ? "50%" : position === -1 ? "15%" : "85%",
                      transform: `translate(-50%, -50%) scale(${isCenter ? 1 : 0.85})`,
                      zIndex: position === 0 ? 20 : 10,
                      transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="relative h-full flex flex-col bg-[var(--color-surface-alt)]">
                      <img
                        src={offer.src}
                        alt={offer.alt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading={isCenter ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500"></div>
                      <div
                        className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-[var(--color-surface)] px-8 py-3 rounded-full font-bold shadow-xl transition-all duration-300 group-hover:scale-110 ${!isCenter ? "text-base px-5 py-2" : "text-xl"
                          }`}
                      >
                        <span className="text-[var(--color-text)]">
                          {offer.price}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
                  to="/apartments"
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
