import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { properties } from "../data/properties";

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const property = properties.find((p) => p.id === parseInt(id));

  if (!property) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <h2>Property not found</h2>
        <Link
          to="/marketplace"
          className="text-primary no-underline font-semibold hover:underline"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen themed-surface pb-12">
      <div className="themed-surface-alt py-4 border-b themed-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-2 text-sm">
          <Link to="/" className="text-primary no-underline hover:underline">
            {t("home")}
          </Link>
          <span className="text-[var(--color-text-soft)]"> / </span>
          <Link
            to="/marketplace"
            className="text-primary no-underline hover:underline"
          >
            {t("marketplace")}
          </Link>
          <span className="text-[var(--color-text-soft)]"> / </span>
          <span className="text-[var(--color-text-soft)]">
            {t("lastListings")}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] gap-8 items-start">
        <div className="lg:col-span-1">
          <div className="relative pt-[75%] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 mb-4">
            <img
              src={property.images[0]}
              alt={property.name}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
          {property.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {property.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="relative pt-[75%] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 cursor-pointer transition-transform hover:scale-105"
                >
                  <img
                    src={image}
                    alt={`${property.name} ${index + 2}`}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 themed-surface-alt p-8 rounded-2xl">
          <div className="flex justify-between items-start mb-6">
            <h1 className="heading-font text-3xl text-[var(--color-text)] m-0">
              {property.name}
            </h1>
            <button className="themed-surface border-2 themed-border rounded-full w-12 h-12 flex items-center justify-center cursor-pointer transition-all hover:border-[var(--color-accent)] hover:scale-110">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 25l-1.69-1.54C6.3 17.92 2 14.06 2 9.58 2 6.32 4.42 4 7.5 4c1.74 0 3.41.81 4.5 2.09C13.09 4.81 14.76 4 16.5 4 19.58 4 22 6.32 22 9.58c0 4.48-4.3 8.34-10.31 13.88L14 25z"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[var(--color-text)]"
                />
              </svg>
            </button>
          </div>

          <p className="text-[var(--color-text-soft)] leading-relaxed mb-8">
            {property.description}
          </p>

          <div className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] p-6 rounded-xl mb-8">
            <h2 className="text-white text-3xl m-0 heading-font">
              {property.price}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="themed-surface p-6 rounded-xl text-center">
              <h3 className="text-sm text-[var(--color-text-soft)] mb-2 font-medium">
                {t("squareMeter")}
              </h3>
              <p className="text-lg text-[var(--color-text)] font-semibold m-0">
                {property.squareMeter}
              </p>
            </div>
            <div className="themed-surface p-6 rounded-xl text-center">
              <h3 className="text-sm text-[var(--color-text-soft)] mb-2 font-medium">
                {t("availableIn")}
              </h3>
              <p className="text-lg text-[var(--color-text)] font-semibold m-0">
                {property.availableIn}
              </p>
            </div>
            <div className="themed-surface p-6 rounded-xl text-center">
              <h3 className="text-sm text-[var(--color-text-soft)] mb-2 font-medium">
                {t("garage")}
              </h3>
              <p className="text-lg text-[var(--color-text)] font-semibold m-0">
                {property.garage ? t("yes") : t("no")}
              </p>
            </div>
          </div>

          <div className="themed-surface p-6 rounded-xl mb-6">
            <h3 className="text-base text-[var(--color-text)] mb-3 font-semibold">
              {t("rooms")}
            </h3>
            <p className="text-[var(--color-text-soft)] m-0">
              {t("kitchen")}, {property.rooms.bathrooms}
              {t("baths")}, {property.rooms.bedrooms}
              {t("beds")}, {t("livingRoom")}
            </p>
          </div>

          <div className="themed-surface p-6 rounded-xl">
            <h3 className="text-base text-[var(--color-text)] mb-3 font-semibold">
              {t("partner")}
            </h3>
            <p className="text-[var(--color-text-soft)] m-0">
              {property.partner ? t("yes") : t("no")}
            </p>
          </div>
        </div>
        <div className="lg:col-span-1 themed-surface-alt p-8 rounded-2xl text-center sticky top-24">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
            {property.owner.avatar ? (
              <img
                src={property.owner.avatar}
                alt={property.owner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full">
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 60 60"
                  fill="none"
                  className="w-full h-full"
                >
                  <circle cx="30" cy="30" r="28" fill="#E0E0E0" />
                  <path
                    d="M30 32c-6 0-11 5-11 11v5h22v-5c0-6-5-11-11-11zM30 28a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
                    fill="#999"
                  />
                </svg>
              </div>
            )}
          </div>
          <h3 className="text-xl text-[var(--color-text)] mb-2 heading-font">
            {property.owner.name}
          </h3>
          <p className="text-[var(--color-text-soft)] text-sm mb-6">
            {t("ownerOfBuilding")}
          </p>
          <button className="w-full btn-primary mb-4 text-base">
            {t("messageNow")}
          </button>
          <a
            href={`tel:${property.owner.phone}`}
            className="block font-semibold text-lg no-underline text-[var(--color-text)] hover:text-[var(--color-accent)]"
          >
            {property.owner.phone}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
