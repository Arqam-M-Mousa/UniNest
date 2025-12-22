import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { propertyListingsAPI, conversationsAPI } from "../../services/api";
import StatsCard from "../../components/features/home/StatsCard";
import HeartButton from "../../components/properties/HeartButton";
import Alert from "../../components/common/Alert";
import { useState, useEffect } from "react";
import PageLoader from "../../components/common/PageLoader";
import Image360Viewer from "../../components/media/Image360Viewer";
import MapView from "../../components/properties/MapView";
import VerifiedBadge from "../../components/common/VerifiedBadge";
import CostCalculator from "../../components/properties/CostCalculator";
import { MapPinIcon, XMarkIcon, MapIcon } from "@heroicons/react/24/outline";

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Constants
  const DEFAULT_CURRENCY = "NIS";
  const DEFAULT_OWNER_NAME = "Property Owner";
  const DEFAULT_CONTACT = "Contact via message";
  const DEFAULT_SQUARE_METER = "N/A";

  // State
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showMapModal, setShowMapModal] = useState(false);

  // Add ESC key listener for closing image modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showImageModal) setShowImageModal(false);
        if (showMapModal) setShowMapModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, showMapModal]);

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
          price: `${data.pricePerMonth} ${data.currency || DEFAULT_CURRENCY}`,
          pricePerMonth: data.pricePerMonth,
          currency: data.currency,
          location: data.city,
          squareMeter: data.squareFeet ? `${data.squareFeet} ` : DEFAULT_SQUARE_METER,
          rooms: {
            bedrooms: data.bedrooms || 0,
            bathrooms: data.bathrooms || 0,
          },
          images: data.images?.map(img => ({
            url: img.url || img,
            is360: img.is360 || false,
          })) || [],
          distanceToUniversity: data.distanceToUniversity ? `${data.distanceToUniversity}m` : null,
          maxOccupants: data.maxOccupants || 1,
          leaseDuration: data.leaseDuration || "N/A",
          latitude: data.latitude,
          longitude: data.longitude,
          owner: {
            id: data.owner?.id || data.ownerId,
            name: data.owner
              ? `${data.owner.firstName || ""} ${data.owner.lastName || ""}`.trim()
              : DEFAULT_OWNER_NAME,
            avatar: data.owner?.avatarUrl || data.owner?.profilePictureUrl || data.owner?.avatar || null,
            phone: data.owner?.phoneNumber || data.owner?.phone || DEFAULT_CONTACT,
            isVerified: data.owner?.isIdentityVerified || false,
          },
        };

        setProperty(transformedProperty);
        setActiveImage(transformedProperty.images[0]?.url || transformedProperty.images[0] || null);
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

  const handleMessageClick = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Prevent messaging own property
    if (user?.id === property.owner?.id) {
      setError("You cannot message your own property");
      return;
    }

    try {
      setLoading(true);

      // Determine student and landlord IDs
      const studentId = user.id;
      const landlordId = property.owner?.id;

      if (!landlordId) {
        setError("Property owner information not available");
        return;
      }

      // Create or fetch conversation
      const response = await conversationsAPI.create({
        studentId,
        landlordId,
        propertyId: property.id,
      });

      const conversationId = response.data.id;
      // Navigate to messages page with this conversation
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError(err.message || "Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = (image) => {
    if (!property.images || property.images.length === 0) return;
    const index = property.images.indexOf(image);
    setModalImageIndex(index >= 0 ? index : 0);
    setShowImageModal(true);
  };

  const closeModal = () => {
    setShowImageModal(false);
  };

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setModalImageIndex((prev) => (prev + 1) % property.images.length);
    } else {
      setModalImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const has360Images = property?.images?.some(img => img.is360);
  const regularImages = property?.images?.filter(img => !img.is360) || [];
  const image360s = property?.images?.filter(img => img.is360) || [];

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
              <div
                className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-700 cursor-pointer"
                onClick={() => openImageModal(activeImage)}
              >
                <img
                  src={typeof activeImage === 'string' ? activeImage : activeImage?.url || property.images?.[0]?.url || property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"}
                  alt={property.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"
                  aria-hidden="true"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-accent)] text-white shadow-md">
                    {property.price}
                  </span>
                </div>

                {/* Header Actions: Map & Heart */}
                <div className="absolute top-4 right-4 flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMapModal(true);
                    }}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur border-2 border-white/60 shadow-sm hover:scale-105 transition-transform"
                    title={t("showOnMap") || "Show on Map"}
                  >
                    <MapIcon className="w-6 h-6 text-slate-700" />
                  </button>
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

              {regularImages.length > 1 && (
                <div className="p-4 bg-[var(--color-bg)] dark:bg-[var(--color-surface)]">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {regularImages.slice(0, 3).map((image, index) => {
                      const imgUrl = typeof image === 'string' ? image : image.url;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => openImageModal(image)}
                          className={`relative pt-[75%] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 transition-transform hover:scale-[1.02] border ${activeImage === imgUrl || activeImage?.url === imgUrl
                            ? "border-[var(--color-accent)] shadow-lg"
                            : "border-[var(--color-border)]"
                            }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`${property.name} ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                  {regularImages.length > 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        console.log("View all button clicked, images:", property.images);
                        openImageModal(regularImages[0]);
                      }}
                      className="w-full py-2 px-4 rounded-lg bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                    >
                      {t("viewAllImages")} ({regularImages.length} {t("images")})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 360 Image Viewer Section */}
            {has360Images && (
              <div className="themed-surface-alt border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 bg-[var(--color-bg)] dark:bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {t("360Image") || "360° Panorama"}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-accent)] text-white">
                      {image360s.length} {image360s.length === 1 ? (t("image") || "image") : (t("images") || "images")}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {image360s.map((img, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <Image360Viewer
                        imageUrl={img.url}
                        height={400}
                        autoRotate={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="themed-surface-alt border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="heading-font text-2xl text-[var(--color-text)] m-0">
                  {t("overview") || "Overview"}
                </h2>
                <p className="text-[var(--color-text-soft)] text-sm m-0">
                  {property.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {property.rooms.bedrooms} {t("beds")}
                </span>
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {property.rooms.bathrooms} {t("baths")}
                </span>
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {property.squareMeter} m²
                </span>
                {property.distanceToUniversity && (
                  <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                    {t("distance")}: {property.distanceToUniversity}
                  </span>
                )}
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {t("maxOccupants")}: {property.maxOccupants}
                </span>
                <span className="px-3 py-2 rounded-full text-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]">
                  {t("leaseDuration")}: {property.leaseDuration}
                </span>
              </div>
            </div>

          </div>

          <div className="sticky top-24 space-y-6">
            <div className="themed-surface-alt p-8 rounded-2xl border border-[var(--color-border)] shadow-lg">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-[var(--color-border)]">
                {property.owner.avatar ? (
                  <img
                    src={property.owner.avatar}
                    alt={property.owner.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {property.owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-xl text-[var(--color-text)] mb-1 heading-font text-center flex items-center justify-center gap-2">
                {property.owner.name}
                {property.owner.isVerified && <VerifiedBadge size="md" />}
              </h3>
              <p className="text-[var(--color-text-soft)] text-sm mb-6 text-center">
                {t("ownerOfProperty")}
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
            </div>
            <CostCalculator rent={property.pricePerMonth} currency={property.currency} />
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

        {/* Map Modal */}
        {showMapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl h-[80vh] bg-[var(--color-surface)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute top-4 right-4 z-[1001]">
                <button
                  onClick={() => setShowMapModal(false)}
                  className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors text-gray-800"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="w-full h-full">
                <MapView
                  properties={[property]}
                  universities={[]}
                  height="100%"
                  showPropertyCount={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && property.images && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Close images"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="max-w-7xl max-h-[90vh] px-20">
              <img
                src={typeof property.images[modalImageIndex] === 'string' ? property.images[modalImageIndex] : property.images[modalImageIndex]?.url}
                alt={`${property.name} ${modalImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              <div className="text-center mt-4 text-white text-sm">
                {modalImageIndex + 1} / {property.images.length}
              </div>
            </div>

            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Next image"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default PropertyDetails;
