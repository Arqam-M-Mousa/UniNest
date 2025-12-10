import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import HeartButton from "./HeartButton";
import Reveal from "../common/Reveal";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";

const PropertyCard = ({ property, delay = 0, className = "" }) => {
  const { t } = useLanguage();

  // Handle both backend and static data formats
  const getImage = () => {
    if (property.images && property.images.length > 0) {
      // Backend format: images is array of objects with url property
      if (typeof property.images[0] === "object" && property.images[0].url) {
        return property.images[0].url;
      }
      // Static format: images is array of strings
      return property.images[0];
    }
    return DEFAULT_IMAGE;
  };

  const getPrice = () => {
    // Backend format
    if (property.pricePerMonth !== undefined) {
      return `${property.pricePerMonth} ${property.currency || "NIS"}`;
    }
    // Static format
    return property.price;
  };

  const getBedrooms = () => {
    // Backend format
    if (property.bedrooms !== undefined) {
      return property.bedrooms;
    }
    // Static format
    return property.rooms?.bedrooms || 0;
  };

  const getBathrooms = () => {
    // Backend format
    if (property.bathrooms !== undefined) {
      return property.bathrooms;
    }
    // Static format
    return property.rooms?.bathrooms || 0;
  };

  const getSquareMeters = () => {
    // Backend format
    if (property.squareFeet !== undefined) {
      return `${property.squareFeet} m²`;
    }
    // Static format
    return property.squareMeter;
  };

  const getTitle = () => {
    return property.title || property.name || t("propertyListing");
  };

  return (
    <Reveal delay={delay} className={`w-full ${className}`}>
      <Link
        to={`/apartments/${property.id}`}
        className="market-card themed-surface-alt rounded-xl overflow-hidden no-underline text-inherit shadow-card ring-0 hover:ring-2 hover:ring-[var(--color-accent)] transition-shadow block"
      >
        {/* Property Image */}
        <div className="market-card-img-wrapper relative pt-[75%] bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)]">
          <img
            src={getImage()}
            alt={getTitle()}
            className="absolute top-0 left-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = DEFAULT_IMAGE;
            }}
          />
          <span className="market-card-gradient" aria-hidden="true" />

          {/* Heart Button */}
          <div className="absolute top-4 right-4">
            <HeartButton size={40} propertyId={property.id} />
          </div>

          {/* Property Type Badge */}
          {property.propertyType && (
            <span className="absolute top-4 left-4 bg-[var(--color-accent)] text-white text-xs px-2 py-1 rounded-full">
              {property.propertyType}
            </span>
          )}
        </div>

        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1 truncate">
            {getTitle()}
          </h3>
          <p className="text-xl font-bold text-[var(--color-accent)] mb-2">
            {getPrice()}
          </p>
          <p className="text-[var(--color-text-soft)] text-sm m-0 flex items-center gap-2 flex-wrap">
            <span>
              {getBedrooms()} {t("beds")}
            </span>
            <span className="opacity-40">•</span>
            <span>
              {getBathrooms()} {t("baths")}
            </span>
            <span className="opacity-40">•</span>
            <span>{getSquareMeters()}</span>
          </p>
          {property.city && (
            <p className="text-[var(--color-text-soft)] text-xs mt-2 flex items-center gap-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {property.city}
            </p>
          )}
        </div>
      </Link>
    </Reveal>
  );
};

export default PropertyCard;
