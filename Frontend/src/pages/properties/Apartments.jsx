import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
  propertyListingsAPI,
  uploadsAPI,
  universitiesAPI,
} from "../../services/api";
import TabButton from "../../components/common/TabButton";
import Alert from "../../components/common/Alert";
import nnuImg from "../../assets/nnu.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import PageLoader from "../../components/common/PageLoader";
import PropertyCard from "../../components/properties/PropertyCard";

const Apartments = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isRTL = language === "ar";

  // Listings state
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState("");
  const [totalListings, setTotalListings] = useState(0);

  // Filter state
  const [activeTab, setActiveTab] = useState("lastListings");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    city: "",
  });
  const [pendingFilters, setPendingFilters] = useState({
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    city: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    propertyTypes: ["Apartment", "House", "Room", "Studio"],
    priceRange: { min: 0, max: 10000 },
    bedrooms: [1, 2, 3, 4, 5],
    bathrooms: [1, 2, 3],
    cities: [],
  });
  const [filtersLoading, setFiltersLoading] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");

  // Post ad modal state
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");
  const [universities, setUniversities] = useState([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    propertyType: "Apartment",
    pricePerMonth: "",
    currency: "NIS",
    bedrooms: "1",
    bathrooms: "1",
    squareMeters: "",
    distanceToUniversity: "",
    leaseDuration: "",
    availableFrom: "",
    availableUntil: "",
    universityId: user?.universityId || "",
    acceptsPartners: false,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [universitiesFetched, setUniversitiesFetched] = useState(false);

  const canPostAd = Boolean(
    user?.role && ["landlord", "admin"].includes(user.role.toLowerCase())
  );

  // Fetch listings from backend
  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    setListingsError("");

    try {
      const queryFilters = {};

      if (filters.propertyType) queryFilters.propertyType = filters.propertyType;
      if (filters.minPrice) queryFilters.minPrice = filters.minPrice;
      if (filters.maxPrice) queryFilters.maxPrice = filters.maxPrice;
      if (filters.bedrooms) queryFilters.bedrooms = filters.bedrooms;
      if (filters.bathrooms) queryFilters.bathrooms = filters.bathrooms;
      if (filters.city) queryFilters.city = filters.city;

      // Sort based on active tab
      if (activeTab === "lastListings") {
        queryFilters.sortBy = "createdAt";
        queryFilters.sortOrder = "DESC";
      }

      const response = await propertyListingsAPI.list(queryFilters);
      setListings(response?.data?.listings || []);
      setTotalListings(response?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setListingsError(err.message || t("failedToLoadListings"));
    } finally {
      setListingsLoading(false);
    }
  }, [filters, activeTab, t]);

  // Fetch filter options from backend
  const fetchFilterOptions = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const response = await propertyListingsAPI.getFilterOptions();
      if (response?.data) {
        setFilterOptions((prev) => ({
          ...prev,
          propertyTypes: response.data.propertyTypes?.length
            ? response.data.propertyTypes
            : prev.propertyTypes,
          priceRange: response.data.priceRange || prev.priceRange,
          bedrooms: response.data.bedrooms?.length
            ? response.data.bedrooms
            : prev.bedrooms,
          bathrooms: response.data.bathrooms?.length
            ? response.data.bathrooms
            : prev.bathrooms,
          cities: response.data.cities || [],
        }));
      }
    } catch (err) {
      console.error("Failed to fetch filter options:", err);
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchListings();
    fetchFilterOptions();
  }, []);

  // Refetch when filters or tab change
  useEffect(() => {
    fetchListings();
  }, [filters, activeTab]);

  const handlePendingFilterChange = (key, value) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
  };

  // Filter listings by search query (client-side)
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;

    const query = searchQuery.toLowerCase();
    return listings.filter(
      (listing) =>
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.city?.toLowerCase().includes(query)
    );
  }, [listings, searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const emptyFilters = {
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      city: "",
    };
    setPendingFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const handlePostAdClick = () => {
    if (!canPostAd) {
      if (!isAuthenticated) {
        setAuthModalMessage("postAd");
        setShowAuthModal(true);
      }
      return;
    }
    setPostError("");
    setPostSuccess("");
    setUniversitiesFetched(false);
    setPostModalOpen(true);
  };

  const updateForm = (field, value) => {
    setPostForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setPostForm({
      title: "",
      description: "",
      propertyType: "Apartment",
      pricePerMonth: "",
      currency: "NIS",
      bedrooms: "1",
      bathrooms: "1",
      squareMeters: "",
      distanceToUniversity: "",
      leaseDuration: "",
      availableFrom: "",
      availableUntil: "",
      universityId: user?.universityId || "",
      acceptsPartners: false,
    });
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!canPostAd) return;

    setPostSubmitting(true);
    setPostError("");
    setPostSuccess("");

    try {
      // Validate images first - at least 1 image required
      if (selectedFiles.length === 0) {
        throw new Error(t("imagesRequired") || "At least one image is required");
      }
      if (selectedFiles.length > 10) {
        throw new Error(t("maxImagesError") || "Maximum 10 images per listing");
      }

      // Validate all required fields before uploading
      if (
        !postForm.title.trim() ||
        !postForm.description.trim() ||
        !postForm.pricePerMonth ||
        !postForm.squareMeters ||
        !postForm.distanceToUniversity ||
        !postForm.leaseDuration.trim() ||
        !postForm.availableFrom ||
        !(postForm.universityId || user?.universityId)
      ) {
        throw new Error(t("fillRequiredFields") || "Please fill in all required fields");
      }

      setUploadingImages(true);
      const uploadRes = await uploadsAPI.uploadListingImages(selectedFiles);
      const uploadedUrls = uploadRes?.data?.map((i) => i.url) || [];

      if (uploadedUrls.length === 0) {
        throw new Error(t("imageUploadFailed") || "Failed to upload images");
      }

      const payload = {
        title: postForm.title.trim(),
        description: postForm.description.trim(),
        propertyType: postForm.propertyType,
        pricePerMonth: Number(postForm.pricePerMonth),
        currency: postForm.currency || "NIS",
        bedrooms: Number(postForm.bedrooms),
        bathrooms: Number(postForm.bathrooms),
        squareFeet: Number(postForm.squareMeters),
        distanceToUniversity: Number(postForm.distanceToUniversity),
        leaseDuration: postForm.leaseDuration.trim(),
        availableFrom: postForm.availableFrom,
        availableUntil: postForm.availableUntil || null,
        universityId: postForm.universityId || user?.universityId,
        images: uploadedUrls,
        amenitiesJson: {
          partner: postForm.acceptsPartners,
        },
      };

      await propertyListingsAPI.create(payload);
      setPostSuccess(t("Ad created successfully"));
      resetForm();
      setSelectedFiles([]);
      setPostModalOpen(false);
      // Refresh listings
      fetchListings();
    } catch (err) {
      setPostError(err.message || t("failedToCreateAd") || "Failed to create ad");
    } finally {
      setPostSubmitting(false);
      setUploadingImages(false);
    }
  };

  const handleCancelModal = () => {
    resetForm();
    setSelectedFiles([]);
    setPostError("");
    setPostModalOpen(false);
  };

  const remainingImageSlots = useMemo(
    () => 10 - selectedFiles.length,
    [selectedFiles.length]
  );

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        setUniversitiesLoading(true);
        const res = await universitiesAPI.list();
        setUniversities(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch universities", err);
        setPostError(t("failedToLoadUniversities") || "Failed to load universities");
      } finally {
        setUniversitiesLoading(false);
        setUniversitiesFetched(true);
      }
    };

    if (postModalOpen && !universitiesFetched && !universitiesLoading) {
      loadUniversities();
    }
  }, [postModalOpen, universitiesFetched, universitiesLoading, t]);

  const handleImageSelect = (files) => {
    if (!files?.length) return;
    const fileArr = Array.from(files);
    if (fileArr.length > remainingImageSlots) {
      setPostError(
        `${t("canAddMoreImages") || "You can add"} ${remainingImageSlots} ${t("moreImages") || "more image(s)"}.`
      );
      return;
    }
    setSelectedFiles((prev) => [...prev, ...fileArr].slice(0, 10));
  };

  const handleRemoveSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  return (
    <PageLoader
      sessionKey="apartments_visited"
      message={t("loadingApartments")}
    >
      <PageLoader
        loading={postSubmitting}
        overlay
        message={t("Posting...") || "Posting ad..."}
      >
        <div className="min-h-screen themed-surface">
          {/* Hero Section */}
          <section className="relative py-12 px-8 text-center overflow-hidden">
            <img
              src={nnuImg}
              alt="Campus Background"
              className="absolute inset-0 w-full h-full object-cover blur-[2px]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 dark:from-black/60 dark:to-black/40"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <p className="text-center text-xl mb-8 text-white drop-shadow-md">
                {t("marketplaceSubtitle")}
              </p>

              <div className="max-w-2xl mx-auto bg-white dark:bg-white backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4 shadow-lg">
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-base text-gray-900 placeholder:text-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Tabs and Post Ad Button */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex gap-3 flex-wrap">
            <TabButton
              active={activeTab === "lastListings"}
              onClick={() => setActiveTab("lastListings")}
              icon={
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 7h8M6 10h8M6 13h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            >
              {t("lastListings")}
            </TabButton>
            <TabButton
              active={activeTab === "offers"}
              onClick={() => setActiveTab("offers")}
              icon={
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 13l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
              }
            >
              {t("offers")}
            </TabButton>
            <TabButton
              active={activeTab === "favorites"}
              onClick={() => setActiveTab("favorites")}
              icon={
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2.8l2.15 4.36 4.81.72-3.5 3.41.83 4.79-4.29-2.26-4.29 2.26.83-4.79-3.5-3.41 4.81-.72L10 2.8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              {t("favorites")}
            </TabButton>

            {canPostAd && (
              <button
                onClick={handlePostAdClick}
                className={`${isRTL ? "mr-auto flex-row-reverse" : "ml-auto"} flex items-center gap-2 px-6 py-3 rounded-full btn-primary text-sm hover:scale-105 transition-transform`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5v10M5 10h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {t("postAd")}
              </button>
            )}
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Filters Sidebar */}
            <aside
              className="themed-surface-alt p-6 rounded-xl mb-8 lg:mb-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto shadow-sm border border-[var(--color-border)]"
              aria-label={t("filters")}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 6h14M6 10h8M8 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {t("filters")}
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-[var(--color-accent)] hover:underline"
                >
                  {t("clearAll") || "Clear all"}
                </button>
              </div>

              {/* Property Type Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-[var(--color-text-soft)]">
                  {t("Property type")}
                </h4>
                <div className="space-y-2">
                  {filterOptions.propertyTypes.map((type) => (
                    <button
                      key={type}
                      className={`w-full flex justify-between items-center px-4 py-3 rounded-lg border transition-all ${
                        pendingFilters.propertyType === type
                          ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                          : "bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                      }`}
                      onClick={() =>
                        handlePendingFilterChange(
                          "propertyType",
                          pendingFilters.propertyType === type ? "" : type
                        )
                      }
                    >
                      <span className="font-medium text-sm">{t(type) || type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-[var(--color-text-soft)]">
                  {t("price")}
                </h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t("min") || "Min"}
                    value={pendingFilters.minPrice}
                    onChange={(e) => handlePendingFilterChange("minPrice", e.target.value)}
                    className="w-full input-field text-sm"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder={t("max") || "Max"}
                    value={pendingFilters.maxPrice}
                    onChange={(e) => handlePendingFilterChange("maxPrice", e.target.value)}
                    className="w-full input-field text-sm"
                    min="0"
                  />
                </div>
              </div>

              {/* Bedrooms Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-[var(--color-text-soft)]">
                  {t("Bedrooms")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.bedrooms.map((num) => (
                    <button
                      key={num}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        pendingFilters.bedrooms === String(num)
                          ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                          : "bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                      }`}
                      onClick={() =>
                        handlePendingFilterChange(
                          "bedrooms",
                          pendingFilters.bedrooms === String(num) ? "" : String(num)
                        )
                      }
                    >
                      {num}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-[var(--color-text-soft)]">
                  {t("Bathrooms")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.bathrooms.map((num) => (
                    <button
                      key={num}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        pendingFilters.bathrooms === String(num)
                          ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                          : "bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                      }`}
                      onClick={() =>
                        handlePendingFilterChange(
                          "bathrooms",
                          pendingFilters.bathrooms === String(num) ? "" : String(num)
                        )
                      }
                    >
                      {num}+
                    </button>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              {filterOptions.cities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 text-[var(--color-text-soft)]">
                    {t("city")}
                  </h4>
                  <select
                    value={pendingFilters.city}
                    onChange={(e) => handlePendingFilterChange("city", e.target.value)}
                    className="w-full input-field text-sm"
                  >
                    <option value="">{t("allCities") || "All cities"}</option>
                    {filterOptions.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Apply Filters Button */}
              <button
                onClick={applyFilters}
                className="w-full py-3 rounded-lg btn-primary text-sm font-semibold mb-4"
              >
                {t("applyFilters") || "Apply Filters"}
              </button>

              {/* Results Count */}
              <div className="pt-4 border-t border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-soft)]">
                  {t("showingResults") || "Showing"}{" "}
                  <span className="font-semibold text-[var(--color-text)]">
                    {filteredListings.length}
                  </span>{" "}
                  {t("properties") || "properties"}
                </p>
              </div>
            </aside>

            {/* Listings Grid */}
            <div>
              {listingsError && (
                <div className="mb-6 rounded-lg border border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
                  {listingsError}
                  <button
                    onClick={fetchListings}
                    className="ml-2 underline hover:no-underline"
                  >
                    {t("tryAgain") || "Try again"}
                  </button>
                </div>
              )}

              {listingsLoading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                  {[...Array(6)].map((_, idx) => (
                    <div
                      key={idx}
                      className="animate-pulse rounded-xl overflow-hidden themed-surface-alt"
                    >
                      <div className="pt-[75%] bg-[var(--color-border)]" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-[var(--color-border)] rounded w-3/4" />
                        <div className="h-6 bg-[var(--color-border)] rounded w-1/2" />
                        <div className="h-4 bg-[var(--color-border)] rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-16">
                  <svg
                    className="mx-auto mb-4 text-[var(--color-text-soft)]"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                    {t("noListingsFound") || "No listings found"}
                  </h3>
                  <p className="text-[var(--color-text-soft)] mb-4">
                    {t("tryAdjustingFilters") || "Try adjusting your filters or search query"}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-lg btn-primary text-sm"
                  >
                    {t("clearFilters") || "Clear filters"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                  {filteredListings.map((property, idx) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      delay={idx * 50}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {postSuccess && (
            <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-green-500/60 bg-green-500 text-white px-4 py-3 text-sm shadow-lg">
              {postSuccess}
            </div>
          )}

          {/* Post Ad Modal */}
          {postModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
              role="dialog"
              aria-modal="true"
              onClick={handleCancelModal}
            >
              <div
                className="w-full max-w-3xl max-h-[90vh] rounded-2xl themed-surface p-6 shadow-2xl border themed-border overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--color-text-soft)] mb-1">
                      {t("Create listing")}
                    </p>
                    <h3 className="text-xl font-semibold text-[var(--color-text)]">
                      {t("Post a Property Ad")}
                    </h3>
                  </div>
                  <button
                    onClick={handleCancelModal}
                    className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {postError && (
                  <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
                    {postError}
                  </div>
                )}

                <div className="overflow-y-auto max-h-[70vh] pr-2">
                  <form className="space-y-6" onSubmit={handleSubmitPost}>
                    {/* Listing Basics */}
                    <div className="rounded-xl border themed-border bg-[var(--color-surface-alt)] p-4 space-y-4">
                      <h4 className="text-sm font-semibold text-[var(--color-text)]">
                        {t("Listing basics")}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-[var(--color-text)]" htmlFor="title">
                            {t("Listing title")} *
                          </label>
                          <input
                            id="title"
                            className="w-full input-field mt-1"
                            value={postForm.title}
                            onChange={(e) => updateForm("title", e.target.value)}
                            placeholder={t("Cozy 2BR near campus")}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-[var(--color-text)]" htmlFor="description">
                            {t("Description")} *
                          </label>
                          <textarea
                            id="description"
                            className="w-full input-field mt-1 min-h-[110px]"
                            value={postForm.description}
                            onChange={(e) => updateForm("description", e.target.value)}
                            placeholder={t("Describe the place, amenities, nearby spots")}
                            required
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("Property type")}
                          </label>
                          <select
                            className="w-full input-field mt-1"
                            value={postForm.propertyType}
                            onChange={(e) => updateForm("propertyType", e.target.value)}
                          >
                            <option value="Apartment">{t("Apartment") || "Apartment"}</option>
                            <option value="House">{t("House") || "House"}</option>
                            <option value="Room">{t("Room") || "Room"}</option>
                            <option value="Studio">{t("Studio") || "Studio"}</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("University")} *
                          </label>
                          <select
                            className="w-full input-field mt-1"
                            value={postForm.universityId}
                            onChange={(e) => updateForm("universityId", e.target.value)}
                            disabled={universitiesLoading}
                            required
                          >
                            <option value="" disabled>
                              {universitiesLoading
                                ? t("Loading universities...")
                                : t("Select a university")}
                            </option>
                            {universities.map((uni) => (
                              <option key={uni.id} value={uni.id}>
                                {uni.name}
                                {uni.city ? ` — ${uni.city}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Details */}
                    <div className="rounded-xl border themed-border bg-[var(--color-surface-alt)] p-4 space-y-4">
                      <h4 className="text-sm font-semibold text-[var(--color-text)]">
                        {t("Pricing & details")}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("Monthly price")} *
                          </label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="number"
                              min="0"
                              className="w-full input-field"
                              value={postForm.pricePerMonth}
                              onChange={(e) => updateForm("pricePerMonth", e.target.value)}
                              placeholder="1500"
                              required
                            />
                            <select
                              className="w-28 input-field"
                              value={postForm.currency}
                              onChange={(e) => updateForm("currency", e.target.value)}
                            >
                              <option value="NIS">NIS</option>
                              <option value="JOD">JOD</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("Bedrooms")} *
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full input-field mt-1"
                            value={postForm.bedrooms}
                            onChange={(e) => updateForm("bedrooms", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("Bathrooms")} *
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full input-field mt-1"
                            value={postForm.bathrooms}
                            onChange={(e) => updateForm("bathrooms", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("Size (m²)")} *
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full input-field mt-1"
                            value={postForm.squareMeters}
                            onChange={(e) => updateForm("squareMeters", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("Distance to university (km)")} *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            className="w-full input-field mt-1"
                            value={postForm.distanceToUniversity}
                            onChange={(e) => updateForm("distanceToUniversity", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("Lease duration")} *
                          </label>
                          <input
                            className="w-full input-field mt-1"
                            value={postForm.leaseDuration}
                            onChange={(e) => updateForm("leaseDuration", e.target.value)}
                            placeholder={t("e.g. 12 months")}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("availableFrom") || "Available from"} *
                          </label>
                          <input
                            type="date"
                            className="w-full input-field mt-1"
                            value={postForm.availableFrom}
                            onChange={(e) => updateForm("availableFrom", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            {t("availableUntil") || "Available until"}
                          </label>
                          <input
                            type="date"
                            className="w-full input-field mt-1"
                            value={postForm.availableUntil}
                            onChange={(e) => updateForm("availableUntil", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Accept Partners Option */}
                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="acceptsPartners"
                          checked={postForm.acceptsPartners}
                          onChange={(e) => updateForm("acceptsPartners", e.target.checked)}
                          className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        />
                        <label htmlFor="acceptsPartners" className="text-sm font-medium text-[var(--color-text)] cursor-pointer">
                          {t("acceptsPartners") || "Accepts partners/roommates"}
                        </label>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="themed-surface-alt border themed-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {t("Upload images")} <span className="text-red-500">*</span>
                          </p>
                          <p className="text-xs text-[var(--color-text-soft)]">
                            {t("Up to 10 images. Remaining")}: {10 - selectedFiles.length}
                          </p>
                        </div>
                        {uploadingImages && (
                          <span className="text-xs text-[var(--color-accent)]">
                            {t("Uploading...")}
                          </span>
                        )}
                      </div>
                      <label className="mt-2 flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed themed-border text-sm text-[var(--color-text-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageSelect(e.target.files)}
                          disabled={uploadingImages}
                        />
                        {t("Click or drop to upload")}
                      </label>

                      {selectedFiles.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {selectedFiles.map((file) => (
                            <div key={file.name} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-20 object-cover rounded-lg border border-[var(--color-border)]"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveSelected(file.name)}
                                className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {t("remove")}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between gap-3 pt-2 pb-1">
                      <div className="text-xs text-[var(--color-text-soft)]">
                        {t("Tip")}: {t("Great photos increase engagement")}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCancelModal}
                          className="px-4 py-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)]"
                        >
                          {t("cancel")}
                        </button>
                        <button
                          type="submit"
                          disabled={postSubmitting}
                          className="px-5 py-2 rounded-md btn-primary disabled:opacity-60"
                        >
                          {postSubmitting ? t("Posting...") : t("postAd")}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Auth Required Alert */}
          <Alert
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            title={t("signInRequired")}
            message={
              authModalMessage === "message"
                ? t("pleaseSignInToMessage")
                : t("pleaseSignInToPostAd")
            }
            type="warning"
            confirmText={t("signIn")}
            cancelText={t("cancel")}
            onConfirm={() => navigate("/signin")}
          />
        </div>
      </PageLoader>
    </PageLoader>
  );
};

export default Apartments;
