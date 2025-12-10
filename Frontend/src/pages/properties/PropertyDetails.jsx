import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { propertyListingsAPI } from "../../services/api";
import StatsCard from "../../components/features/home/StatsCard";
import HeartButton from "../../components/properties/HeartButton";
import Alert from "../../components/common/Alert";
import { useState, useEffect } from "react";
import PageLoader from "../../components/common/PageLoader";

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await propertyListingsAPI.getById(id);
        const data = response.data;
        
        // Transform API response to match expected format
        const transformedProperty = {
          id: data.id,
          listingId: data.listingId,
          name: data.title,
          description: data.description,
          price: `${data.pricePerMonth} ${data.currency || "NIS"}`,
          pricePerMonth: data.pricePerMonth,
          currency: data.currency,
          location: data.city,
          squareMeter: data.squareFeet ? `${data.squareFeet} ` : "N/A",
          availableIn: data.availableFrom 
            ? new Date(data.availableFrom).toLocaleDateString() 
            : "Now",
          garage: data.amenitiesJson?.garage || false,
          partner: data.amenitiesJson?.partner || false,
          rooms: {
            bedrooms: data.bedrooms || 0,
            bathrooms: data.bathrooms || 0,
          },
          images: data.images?.map(img => img.url) || [],
          owner: {
            name: data.owner 
              ? `${data.owner.firstName || ""} ${data.owner.lastName || ""}`.trim() 
              : "Property Owner",
            avatar: data.owner?.avatarUrl || null,
            phone: data.owner?.phoneNumber || "Contact via message",
          },
        };
        
        setProperty(transformedProperty);
        setActiveImage(transformedProperty.images[0] || null);
      } catch (err) {
        console.error("Failed to fetch property:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Determine if we're on apartments or marketplace route
  const isApartmentsRoute = window.location.pathname.startsWith("/apartments");
  const parentRoute = isApartmentsRoute ? "/apartments" : "/marketplace";
  const parentLabel = isApartmentsRoute ? t("apartments") : t("marketplace");

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)]"></div>
        <p className="text-[var(--color-text-soft)]">{t("loading") || "Loading..."}</p>
      </div>
    );
  }

  // Show error or not found state
  if (error || !property) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <h2>{t("propertyNotFound")}</h2>
        <Link
          to={parentRoute}
          className="text-primary no-underline font-semibold hover:underline"
        >
          {t("backToMarketplace")}
        </Link>
      </div>
    );
  }

  const handleMessageClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      // Handle messaging logic here
      console.log("Opening message conversation");
    }
  };

  return (
    <PageLoader
      sessionKey={`property_visited_${id}`}
      message={t("loadingProperty")}
    >
      <div className="min-h-screen themed-surface pb-12">
        <div className="themed-surface-alt py-4 border-b themed-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-2 text-sm">
            <Link to="/" className="text-primary no-underline hover:underline">
              {t("home")}
            </Link>
            <span className="text-[var(--color-text-soft)]"> / </span>
            <Link
              to={parentRoute}
              className="text-primary no-underline hover:underline"
            >
              {parentLabel}
            </Link>
            <span className="text-[var(--color-text-soft)]"> / </span>
            <span className="text-[var(--color-text-soft)]">
              {t("lastListings")}
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
          <div className="space-y-6">
            <div className="themed-surface-alt border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
              <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-700">
                <img
                  src={activeImage || property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"}
                  alt={property.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"
                  aria-hidden="true"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-900">
                    {t("availableIn")}: {property.availableIn}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-accent)] text-white shadow-md">
                    {property.price}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <HeartButton
                    size={48}
                    propertyId={property.id}
                    listingId={property.listingId}
                    className="bg-white/90 backdrop-blur border-2 border-white/60"
                  />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-3">
                  <h1 className="heading-font text-3xl md:text-4xl text-white m-0 drop-shadow">
                    {property.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white border border-white/20">
                    {property.location || t("marketplace")}
                  </span>
                </div>
              </div>

              {property.images?.length > 1 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-[var(--color-bg)] dark:bg-[var(--color-surface)]">
                  {property.images.slice(0, 8).map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={`relative pt-[75%] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 transition-transform hover:scale-[1.02] border ${activeImage === image
                        ? "border-[var(--color-accent)] shadow-lg"
                        : "border-[var(--color-border)]"
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${property.name} ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <StatsCard
                label={t("squareMeter")}
                value={property.squareMeter}
              />
              <StatsCard
                label={t("availableIn")}
                value={property.availableIn}
              />
              <StatsCard
                label={t("garage")}
                value={property.garage ? t("yes") : t("no")}
              />
            </div>

            <div className="themed-surface-alt border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="heading-font text-2xl text-[var(--color-text)] m-0">
                    {t("overview") || "Overview"}
                  </h2>
                  <p className="text-[var(--color-text-soft)] text-sm m-0">
                    {property.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--color-text-soft)] m-0">
                    {t("startingFrom") || "Starting from"}
                  </p>
                  <p className="text-3xl font-bold text-[var(--color-accent)] m-0">
                    {property.price}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {property.rooms.bedrooms} {t("beds")}
                </span>
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {property.rooms.bathrooms} {t("baths")}
                </span>
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {t("kitchen")}
                </span>
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {t("livingRoom")}
                </span>
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {property.squareMeter} m²
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="themed-surface border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
                <h3 className="text-base text-[var(--color-text)] mb-3 font-semibold">
                  {t("rooms")}
                </h3>
                <p className="text-[var(--color-text-soft)] m-0">
                  {t("kitchen")}, {property.rooms.bathrooms}
                  {t("baths")}, {property.rooms.bedrooms}
                  {t("beds")}, {t("livingRoom")}
                </p>
              </div>

              <div className="themed-surface border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
                <h3 className="text-base text-[var(--color-text)] mb-3 font-semibold">
                  {t("partner")}
                </h3>
                <p className="text-[var(--color-text-soft)] m-0">
                  {property.partner ? t("yes") : t("no")}
                </p>
              </div>
            </div>
          </div>

          <div className="themed-surface-alt p-8 rounded-2xl border border-[var(--color-border)] shadow-lg sticky top-24">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-[var(--color-border)]">
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
            <h3 className="text-xl text-[var(--color-text)] mb-1 heading-font text-center">
              {property.owner.name}
            </h3>
            <p className="text-[var(--color-text-soft)] text-sm mb-6 text-center">
              {t("ownerOfBuilding")}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleMessageClick}
                className="w-full btn-primary text-base py-3 rounded-xl shadow-md"
              >
                {t("messageNow")}
              </button>
              <a
                href={`tel:${property.owner.phone}`}
                className="block w-full text-center font-semibold text-lg no-underline text-[var(--color-text)] hover:text-[var(--color-accent)]"
              >
                {property.owner.phone}
              </a>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-[var(--color-bg)] dark:bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-soft)]">
              <p className="m-0">
                {t("availableIn")}: {property.availableIn}
              </p>
              <p className="m-0">
                {t("garage")}: {property.garage ? t("yes") : t("no")}
              </p>
              <p className="m-0">
                {t("partner")}: {property.partner ? t("yes") : t("no")}
              </p>
            </div>
          </div>
        </div>

        <Alert
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title={t("signInRequired")}
          message={t("pleaseSignInToMessage")}
          confirmText={t("signIn")}
          cancelText={t("cancel")}
          onConfirm={() => navigate("/signin")}
          type="warning"
        />
      </div>
    </PageLoader>
  );
};

export default PropertyDetails;
