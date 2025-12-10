import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import HeartButton from "./HeartButton";
import Reveal from "../common/Reveal";

const PropertyCard = ({ property, delay = 0, className = "" }) => {
    const { t } = useLanguage();

    return (
        <Reveal delay={delay} className={`w-full ${className}`}>
            <Link
                to={`/apartments/${property.id}`}
                className="market-card themed-surface-alt rounded-xl overflow-hidden no-underline text-inherit shadow-card ring-0 hover:ring-2 hover:ring-[var(--color-accent)] transition-shadow"
            >
                {/* Property Image */}
                <div className="market-card-img-wrapper relative pt-[75%] bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)]">
                    <img
                        src={property.images[0]}
                        alt={property.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        loading="lazy"
                    />
                    <span className="market-card-gradient" aria-hidden="true" />

                    {/* Heart Button */}
                    <div className="absolute top-4 right-4">
                        <HeartButton size={40} />
                    </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                    <h3 className="text-xl mb-2 text-[var(--color-text)] font-semibold tracking-tight">
                        {property.price}
                    </h3>
                    <p className="text-[var(--color-text-soft)] text-sm m-0 flex items-center gap-2">
                        <span>
                            {property.rooms.bedrooms}
                            {t("beds")}
                        </span>
                        <span className="opacity-40">•</span>
                        <span>
                            {property.rooms.bathrooms}
                            {t("baths")}
                        </span>
                        <span className="opacity-40">•</span>
                        <span>{property.squareMeter}</span>
                    </p>
                </div>
            </Link>
        </Reveal>
    );
};

export default PropertyCard;
