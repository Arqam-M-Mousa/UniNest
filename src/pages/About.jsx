import { useLanguage } from "../context/LanguageContext";
import { heroFeatureItems } from "../components/FeatureIcons";
import { Link } from "react-router-dom";

const About = () => {
  const { t } = useLanguage();

  const howItWorks = [
    {
      step: "Discover",
      desc: "Browse verified, student-friendly listings near campus.",
    },
    {
      step: "Compare",
      desc: "Filter by budget, distance, amenities and roommate options.",
    },
    {
      step: "Connect",
      desc: "Message owners securely and schedule viewings fast.",
    },
    {
      step: "Move In",
      desc: "Start your semester settled, confident and prepared.",
    },
  ];

  return (
    <div className="themed-surface">
      {/* Hero */}
      <section className="px-8 pt-12 pb-10 text-center">
        <h1 className="heading-font text-5xl font-bold mb-6 text-[var(--color-text)]">
          {t("about")}
        </h1>
        <p className="text-lg max-w-4xl mx-auto leading-relaxed text-[var(--color-text-soft)]">
          {t("aboutUsText")}
        </p>
      </section>

      {/* Mission & Illustration */}
      <section className="px-8 py-12 themed-surface-alt">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="heading-font text-3xl font-bold mb-4 text-[var(--color-text)]">
              Our Mission
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-text-soft)] mb-6">
              We exist to remove friction from student housing. No more endless
              social feed posts or unreliable landlord chains. UniNest
              centralizes trusted listings, transparent pricing and simple
              communication—so you can focus on your studies and campus life.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[var(--color-text-soft)] text-sm">
              <li>Verified listings & fair pricing transparency.</li>
              <li>
                Tools that match lifestyle (quiet, social, partner-ready).
              </li>
              <li>Support for international & first-year students.</li>
              <li>Inclusive approach to budget & accessibility needs.</li>
            </ul>
          </div>
          <div className="flex justify-center">
            {/* Simple inline illustration */}
            <svg
              width="320"
              height="320"
              viewBox="0 0 320 320"
              className="drop-shadow-md"
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
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-8 py-16">
        <h2 className="heading-font text-3xl font-bold mb-10 text-center text-[var(--color-text)]">
          Core Values
        </h2>
        <div className="max-w-5xl mx-auto grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {heroFeatureItems.map(({ key, Icon }, idx) => (
            <div
              key={key + idx}
              className="themed-surface-alt rounded-2xl p-6 flex flex-col items-center text-center shadow-card hover:-translate-y-1 transition-transform"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)]">
                <Icon className="w-10 h-10 text-[var(--color-accent)]" />
              </div>
              <h3 className="font-semibold mb-2 text-[var(--color-text)] text-sm uppercase tracking-wide">
                {key.replace(/([A-Z])/g, " $1")}
              </h3>
              <p className="text-xs text-[var(--color-text-soft)] leading-relaxed">
                {idx === 0 &&
                  "Trust & safety first in every listing we verify."}
                {idx === 1 &&
                  "Designed for student life: proximity, community, balance."}
                {idx === 2 &&
                  "Affordability matters—options for different budgets."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-8 pb-20">
        <h2 className="heading-font text-3xl font-bold mb-8 text-center text-[var(--color-text)]">
          How It Works
        </h2>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
          {howItWorks.map((item, i) => (
            <div
              key={item.step}
              className="themed-surface-alt rounded-xl p-5 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-accent)] text-white font-bold">
                  {i + 1}
                </span>
                <h3 className="m-0 font-semibold text-[var(--color-text)]">
                  {item.step}
                </h3>
              </div>
              <p className="m-0 text-sm leading-relaxed text-[var(--color-text-soft)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/marketplace"
            className="inline-block px-10 py-3.5 rounded-full font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-[var(--color-ring)]"
          >
            Start Exploring
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
