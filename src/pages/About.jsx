import { useLanguage } from "../context/LanguageContext";
import AnimatedFeatures from "../components/AnimatedFeatures";
import Reveal from "../components/Reveal";
import { Link } from "react-router-dom";

const About = () => {
  const { t } = useLanguage();

  const howItWorks = [
    {
      step: t("hiwDiscoverTitle"),
      desc: t("hiwDiscoverDesc"),
    },
    {
      step: t("hiwCompareTitle"),
      desc: t("hiwCompareDesc"),
    },
    {
      step: t("hiwConnectTitle"),
      desc: t("hiwConnectDesc"),
    },
    {
      step: t("hiwMoveInTitle"),
      desc: t("hiwMoveInDesc"),
    },
  ];

  return (
    <div className="themed-surface">
      {/* Hero */}
      <section className="px-8 pt-12 pb-10 text-center">
        <Reveal
          as="h1"
          className="heading-font text-5xl font-bold mb-6 text-[var(--color-text)]"
        >
          {t("about")}
        </Reveal>
        <Reveal
          as="p"
          className="text-lg max-w-4xl mx-auto leading-relaxed text-[var(--color-text-soft)]"
        >
          {t("aboutUsText")}
        </Reveal>
      </section>

      {/* Mission & Illustration */}
      <section className="px-8 py-12 themed-surface-alt">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Reveal
              as="h2"
              className="heading-font text-3xl font-bold mb-4 text-[var(--color-text)]"
            >
              {t("ourMission")}
            </Reveal>
            <Reveal
              as="p"
              className="text-base leading-relaxed text-[var(--color-text-soft)] mb-6"
            >
              {t("missionParagraph")}
            </Reveal>
            <Reveal
              as="ul"
              className="list-disc pl-5 space-y-2 text-[var(--color-text-soft)] text-sm"
            >
              <li>{t("missionPoint1")}</li>
              <li>{t("missionPoint2")}</li>
              <li>{t("missionPoint3")}</li>
              <li>{t("missionPoint4")}</li>
            </Reveal>
          </div>
          <div className="flex justify-center">
            <Reveal className="drop-shadow-md">
              <svg
                width="320"
                height="320"
                viewBox="0 0 320 320"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60B5EF" />
                    <stop offset="100%" stopColor="#4A9FD8" />
                  </linearGradient>
                </defs>
                <rect
                  x="20"
                  y="20"
                  width="280"
                  height="180"
                  rx="24"
                  fill="#E8F4F8"
                />
                <rect
                  x="40"
                  y="60"
                  width="100"
                  height="80"
                  rx="12"
                  fill="url(#grad)"
                />
                <rect
                  x="160"
                  y="60"
                  width="120"
                  height="20"
                  rx="6"
                  fill="#9ED4F6"
                />
                <rect
                  x="160"
                  y="90"
                  width="120"
                  height="20"
                  rx="6"
                  fill="#B8E2FA"
                />
                <rect
                  x="160"
                  y="120"
                  width="90"
                  height="20"
                  rx="6"
                  fill="#D1EEFD"
                />
                <path
                  d="M60 250c20-40 120-40 140 0 20 40 60 40 80 0"
                  stroke="#60B5EF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="100" cy="230" r="22" fill="#60B5EF" />
                <circle cx="180" cy="230" r="22" fill="#4A9FD8" />
                <circle cx="260" cy="230" r="22" fill="#9ED4F6" />
              </svg>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-8 py-16">
        <h2 className="heading-font text-3xl font-bold mb-10 text-center text-[var(--color-text)]">
          {t("coreValues")}
        </h2>
        <div className="max-w-5xl mx-auto">
          <AnimatedFeatures variant="about" />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-8 pb-20">
        <Reveal
          as="h2"
          className="heading-font text-3xl font-bold mb-8 text-center text-[var(--color-text)]"
        >
          {t("howItWorks")}
        </Reveal>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
          {howItWorks.map((item, i) => (
            <Reveal
              key={item.step}
              className="how-it-works-card themed-surface-alt rounded-xl p-5 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="badge-animated inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-accent)] text-white font-bold">
                  {i + 1}
                </span>
                <h3 className="m-0 font-semibold text-[var(--color-text)]">
                  {item.step}
                </h3>
              </div>
              <p className="m-0 text-sm leading-relaxed text-[var(--color-text-soft)]">
                {item.desc}
              </p>
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <Reveal>
            <Link
              to="/marketplace"
              className="inline-block px-10 py-3.5 rounded-full font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-[var(--color-ring)] animate-glow-pulse"
            >
              {t("startExploring")}
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default About;
