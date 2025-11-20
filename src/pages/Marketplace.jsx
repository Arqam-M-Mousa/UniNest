import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { properties } from "../data/properties";

const Marketplace = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("lastListings");
  const [selectedPrice, setSelectedPrice] = useState("all");

  const priceRanges = [
    { label: "Arqam", count: 15 },
    { label: "Arqam", count: 20 },
    { label: "Arqam", count: 30 },
    { label: "Arqam", count: 12 },
  ];

  return (
    <div className="min-h-screen themed-surface">
      <section className="py-12 px-8 text-center">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-bg-alt)] to-[var(--color-bg)] dark:from-[var(--color-bg-alt)] dark:to-[var(--color-bg)]"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="heading-font text-4xl font-bold text-[var(--color-text)]">
              {t("marketplaceTitle")}
            </h1>
            <Link
              to="/signin"
              className="flex items-center gap-2 text-sm text-[var(--color-text-soft)] hover:text-[var(--color-accent)]"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16 17v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              {t("signIn")} / {t("signUp").replace("Sign Up", "Register")}
            </Link>
          </div>
        </div>

        <p className="text-center text-xl mb-8 text-[var(--color-text-soft)]">
          {t("marketplaceSubtitle")}
        </p>

        <div className="max-w-2xl mx-auto themed-surface-alt rounded-full px-6 py-3 flex items-center gap-4">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
              stroke="#999"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="flex-1 bg-transparent border-none outline-none text-base text-[var(--color-text)] placeholder:text-[var(--color-text-soft)]"
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex gap-3 flex-wrap">
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 font-medium text-sm transition-all ${
            activeTab === "lastListings"
              ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
              : "btn-outline"
          }`}
          onClick={() => setActiveTab("lastListings")}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect
              x="2"
              y="2"
              width="16"
              height="16"
              rx="3"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M6 7h8M6 10h8M6 13h5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {t("lastListings")}
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 font-medium text-sm transition-all ${
            activeTab === "offers"
              ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
              : "btn-outline"
          }`}
          onClick={() => setActiveTab("offers")}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M7 13l6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="8" cy="8" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
          {t("offers")}
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 font-medium text-sm transition-all ${
            activeTab === "favorites"
              ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
              : "btn-outline"
          }`}
          onClick={() => setActiveTab("favorites")}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2.8l2.15 4.36 4.81.72-3.5 3.41.83 4.79-4.29-2.26-4.29 2.26.83-4.79-3.5-3.41 4.81-.72L10 2.8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="14.5" cy="5" r="1" fill="currentColor" />
          </svg>
          {t("favorites")}
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 font-medium text-sm transition-all ${
            activeTab === "masonry"
              ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
              : "btn-outline"
          }`}
          onClick={() => setActiveTab("masonry")}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect
              x="2.5"
              y="2.5"
              width="7"
              height="5"
              rx="1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="11"
              y="2.5"
              width="6.5"
              height="8"
              rx="1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="2.5"
              y="9.5"
              width="4.5"
              height="8"
              rx="1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="8"
              y="11"
              width="9.5"
              height="6.5"
              rx="1"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          {t("masonry")}
        </button>
        <button className="ml-auto flex items-center gap-2 px-6 py-3 rounded-full btn-primary text-sm">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 5v10M5 10h10"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {t("postAd")}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 grid lg:grid-cols-[250px_1fr] gap-8">
        <aside className="themed-surface-alt p-6 rounded-xl sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-6 text-[var(--color-text)]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 6h14M6 10h8M8 14h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {t("filters")}
          </h3>

          {[...Array(4)].map((_, sectionIdx) => (
            <div key={sectionIdx} className="mb-8">
              <h4 className="flex items-center gap-2 text-sm font-medium mb-4 text-[var(--color-text-soft)]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  {sectionIdx === 0 && (
                    <path
                      d="M3 4h10M5 8h6M7 12h2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}
                  {sectionIdx === 1 && (
                    <>
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 5v3l2 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                  {sectionIdx === 2 && (
                    <>
                      <path
                        d="M4 4h8v8H4z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path d="M6 6h4v4H6z" fill="currentColor" />
                    </>
                  )}
                  {sectionIdx === 3 && (
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  )}
                </svg>
                {t("price")}
              </h4>
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <button
                    key={`filter-${sectionIdx}-${index}`}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-lg border transition-all ${
                      selectedPrice === range.label && sectionIdx === 0
                        ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                        : "bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-white hover:border-[var(--color-accent)]"
                    }`}
                    onClick={() =>
                      sectionIdx === 0 && setSelectedPrice(range.label)
                    }
                  >
                    <span className="font-medium text-sm">{range.label}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedPrice === range.label && sectionIdx === 0
                          ? "bg-white text-[var(--color-accent)]"
                          : "bg-white dark:bg-[var(--color-surface-alt)] text-[var(--color-accent)]"
                      }`}
                    >
                      {range.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {properties.map((property) => (
            <Link
              key={property.id}
              to={`/marketplace/${property.id}`}
              className="themed-surface-alt rounded-xl overflow-hidden no-underline text-inherit transition-all hover:-translate-y-1 hover:shadow-xl shadow-card"
            >
              <div className="relative pt-[75%] bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <button className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-xl mb-2 text-[var(--color-text)]">
                  {property.price}
                </h3>
                <p className="text-[var(--color-text-soft)] text-sm m-0">
                  {property.rooms.bedrooms}
                  {t("beds")}, {property.rooms.bathrooms}
                  {t("baths")}, {property.squareMeter}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
