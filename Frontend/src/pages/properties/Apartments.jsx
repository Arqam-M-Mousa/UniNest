import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
  propertyListingsAPI,
  uploadsAPI,
  universitiesAPI,
  favoritesAPI,
} from "../../services/api";
import { QueueListIcon, HeartIcon, PlusIcon, MapIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import TabButton from "../../components/common/TabButton";
import Alert from "../../components/common/Alert";
import nnuImg from "../../assets/nnu.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import PageLoader from "../../components/common/PageLoader";
import PropertyCard from "../../components/properties/PropertyCard";
import LocationPicker from "../../components/properties/LocationPicker";
import MapView from "../../components/properties/MapView";
import { calculateDistance } from "../../utils/mapUtils";

const Apartments = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isRTL = language === "ar";

  // Constants
  const SEARCH_DELAY_MS = 500;
  const FILTER_APPLY_DELAY_MS = 500;
  const FILTER_CLEAR_DELAY_MS = 250;

  const EMPTY_FILTERS = {
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    city: "",
    universityId: "",
    maxDistance: "",
  };

  const DISTANCE_OPTIONS = [
    { value: "200", labelKey: "distance200m" },
    { value: "500", labelKey: "distance500m" },
    { value: "1000", labelKey: "distance1km" },
    { value: "2000", labelKey: "distance2km" },
    { value: "5000", labelKey: "distance5km" },
  ];

  // Listings state
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState("");
  const [totalListings, setTotalListings] = useState(0);

  // Filter state
  const [activeTab, setActiveTab] = useState("lastListings");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] = useState({
    propertyTypes: ["Apartment", "House", "Room", "Studio"],
    priceRange: { min: 0, max: 10000 },
    bedrooms: [1, 2, 3, 4, 5],
    bathrooms: [1, 2, 3],
    cities: [],
  });
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterApplyLoading, setFilterApplyLoading] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");

  // Post ad modal state
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");
  const [image360Flags, setImage360Flags] = useState({});
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
    listingDuration: "1month",
    latitude: null,
    longitude: null,
    universityId: user?.universityId || "",
    maxOccupants: "1",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [universitiesFetched, setUniversitiesFetched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const canPostAd = Boolean(
    user?.role && ["landlord", "superadmin"].includes(user.role.toLowerCase())
  );

  // Fetch listings from backend
  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    setListingsError("");

    try {
      // If favorites tab is active, fetch favorites instead
      if (activeTab === "favorites") {
        const response = await favoritesAPI.list();
        setListings(response?.data?.listings || []);
        setTotalListings(response?.data?.total || 0);
        return;
      }

      const queryFilters = {};

      if (filters.propertyType) queryFilters.propertyType = filters.propertyType;
      if (filters.minPrice) queryFilters.minPrice = filters.minPrice;
      if (filters.maxPrice) queryFilters.maxPrice = filters.maxPrice;
      if (filters.bedrooms) queryFilters.bedrooms = filters.bedrooms;
      if (filters.bathrooms) queryFilters.bathrooms = filters.bathrooms;
      if (filters.city) queryFilters.city = filters.city;
      if (filters.universityId) queryFilters.universityId = filters.universityId;

      // Distance filter - requires university selection to get center coordinates
      if (filters.maxDistance && filters.universityId) {
        const selectedUni = universities.find(u => String(u.id) === String(filters.universityId));
        console.log("Distance filter - selectedUni:", selectedUni);
        console.log("Distance filter - filters:", { maxDistance: filters.maxDistance, universityId: filters.universityId });
        if (selectedUni?.latitude && selectedUni?.longitude) {
          queryFilters.maxDistance = filters.maxDistance;
          queryFilters.centerLat = selectedUni.latitude;
          queryFilters.centerLng = selectedUni.longitude;
          queryFilters.sortBy = "distance";
          queryFilters.sortOrder = "ASC";
          console.log("Distance filter applied:", queryFilters);
        } else {
          console.log("Distance filter NOT applied - missing university coordinates");
        }
      }

      // Sort based on active tab (if not sorting by distance)
      if (activeTab === "lastListings" && !queryFilters.sortBy) {
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
  }, [filters, activeTab, t, universities]);

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

  // Fetch universities for map
  const fetchUniversities = useCallback(async () => {
    try {
      const response = await universitiesAPI.list();
      if (response?.data) {
        setUniversities(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch universities:", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchListings();
    fetchFilterOptions();
    fetchUniversities();
  }, []);

  // Refetch when filters or tab change
  useEffect(() => {
    fetchListings();
  }, [filters, activeTab]);

  const handlePendingFilterChange = (key, value) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = async () => {
    setFilterApplyLoading(true);
    setFilters(pendingFilters);
    await new Promise(resolve => setTimeout(resolve, FILTER_APPLY_DELAY_MS));
    setFilterApplyLoading(false);
  };

  // Filter listings by search query (only when Enter is pressed)
  const filteredListings = useMemo(() => {
    if (!activeSearchQuery.trim()) return listings;

    const query = activeSearchQuery.toLowerCase();
    return listings.filter(
      (listing) =>
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.city?.toLowerCase().includes(query)
    );
  }, [listings, activeSearchQuery]);

  // Handle search on Enter key
  const handleSearchKeyPress = async (e) => {
    if (e.key === 'Enter') {
      setSearchLoading(true);
      setActiveSearchQuery(searchQuery);
      await new Promise(resolve => setTimeout(resolve, SEARCH_DELAY_MS));
      setSearchLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = async () => {
    setFilterApplyLoading(true);
    setPendingFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setSearchQuery("");
    setActiveSearchQuery("");
    await new Promise(resolve => setTimeout(resolve, FILTER_CLEAR_DELAY_MS));
    setFilterApplyLoading(false);
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

  const handleFavoritesTabClick = () => {
    if (!isAuthenticated) {
      setAuthModalMessage("favorites");
      setShowAuthModal(true);
      return;
    }
    setActiveTab("favorites");
  };

  const updateForm = (field, value) => {
    setPostForm((prev) => ({ ...prev, [field]: value }));
  };



  // Auto-calculate distance when location or university changes
  useEffect(() => {
    if (postForm.latitude && postForm.longitude && (postForm.universityId || user?.universityId)) {
      const uniId = postForm.universityId || user?.universityId;
      const uni = universities.find(u => u.id === uniId);

      if (uni?.latitude && uni?.longitude) {
        const dist = calculateDistance(
          parseFloat(postForm.latitude),
          parseFloat(postForm.longitude),
          parseFloat(uni.latitude),
          parseFloat(uni.longitude)
        );
        updateForm("distanceToUniversity", dist);
      }
    }
  }, [postForm.latitude, postForm.longitude, postForm.universityId, user?.universityId, universities]);

  const [viewMode, setViewMode] = useState("grid");
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
      listingDuration: "1month",
      latitude: null,
      longitude: null,
      universityId: user?.universityId || "",
      maxOccupants: "1",
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
      if (!postForm.title.trim()) {
        throw new Error(t("titleRequired") || "Title is required");
      }
      if (!postForm.description.trim()) {
        throw new Error(t("descriptionRequired") || "Description is required");
      }
      if (!postForm.propertyType) {
        throw new Error(t("propertyTypeRequired") || "Property type is required");
      }
      if (!postForm.pricePerMonth) {
        throw new Error(t("priceRequired") || "Price is required");
      }
      if (!postForm.squareMeters) {
        throw new Error(t("squareMetersRequired") || "Square meters is required");
      }
      if (!postForm.bedrooms) {
        throw new Error(t("bedroomsRequired") || "Number of bedrooms is required");
      }
      if (!postForm.bathrooms) {
        throw new Error(t("bathroomsRequired") || "Number of bathrooms is required");
      }
      if (!postForm.leaseDuration.trim()) {
        throw new Error(t("leaseDurationRequired") || "Lease duration is required");
      }
      if (!(postForm.universityId || user?.universityId)) {
        throw new Error(t("universityRequired") || "Please select a university");
      }
      if (!postForm.latitude || !postForm.longitude) {
        throw new Error(t("locationRequired") || "Please select a location on the map");
      }

      setUploadingImages(true);
      const uploadRes = await uploadsAPI.uploadListingImages(selectedFiles);
      const uploadedImages = uploadRes?.data || [];

      if (uploadedImages.length === 0) {
        throw new Error(t("imageUploadFailed") || "Failed to upload images");
      }

      // Build images array with 360 metadata and publicId
      const imagesWithMetadata = uploadedImages.map((img, index) => {
        const fileName = selectedFiles[index]?.name;
        return {
          url: img.url,
          publicId: img.publicId,
          is360: image360Flags[fileName] || false,
        };
      });

      // Upload video if selected
      let videoData = null;
      if (selectedVideo) {
        setUploadingVideo(true);
        try {
          const videoRes = await uploadsAPI.uploadListingVideo(selectedVideo);
          if (videoRes?.data) {
            videoData = {
              url: videoRes.data.url,
              publicId: videoRes.data.publicId,
            };
          }
        } catch (videoErr) {
          console.error("Video upload failed:", videoErr);
          // Continue without video if upload fails
        } finally {
          setUploadingVideo(false);
        }
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
        listingDuration: postForm.listingDuration,
        latitude: postForm.latitude,
        longitude: postForm.longitude,
        universityId: postForm.universityId || user?.universityId,
        images: imagesWithMetadata,
        maxOccupants: Number(postForm.maxOccupants) || 1,
        video: videoData,
      };

      await propertyListingsAPI.create(payload);
      setPostSuccess(t("Ad created successfully"));
      resetForm();
      setSelectedFiles([]);
      setImage360Flags({});
      setSelectedVideo(null);
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
    setSelectedVideo(null);
    setPostError("");
    setPostModalOpen(false);
  };

  const handleVideoSelect = (files) => {
    if (!files?.length) return;
    const file = files[0];
    
    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setPostError(t("videoTooLarge") || "Video must be less than 50MB");
      return;
    }
    
    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      setPostError(t("invalidVideoFormat") || "Only MP4, WebM, MOV, and AVI videos are allowed");
      return;
    }
    
    setSelectedVideo(file);
    setPostError("");
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
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

  const toggle360Flag = (fileName) => {
    setImage360Flags((prev) => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };

  const handleRemoveSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
    setImage360Flags((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
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
        <PageLoader
          loading={searchLoading}
          overlay
          message={t("loading") || "Searching..."}
        >
          <PageLoader
            loading={filterApplyLoading}
            overlay
            message={t("loading") || "Applying filters..."}
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
                      onKeyPress={handleSearchKeyPress}
                      className="flex-1 bg-transparent border-none outline-none text-base text-gray-900 placeholder:text-gray-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setActiveSearchQuery("");
                        }}
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
                  icon={<QueueListIcon className="w-5 h-5" />}
                >
                  {t("lastListings")}
                </TabButton>
                <TabButton
                  active={activeTab === "favorites"}
                  onClick={() => handleFavoritesTabClick()}
                  icon={
                    activeTab === "favorites" ? (
                      <HeartSolid className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )
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
                    <PlusIcon className="w-5 h-5" />
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
                          className={`w-full flex justify-between items-center px-4 py-3 rounded-lg border transition-all ${pendingFilters.propertyType === type
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
                          className={`px-4 py-2 rounded-lg border text-sm transition-all ${pendingFilters.bedrooms === String(num)
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
                          className={`px-4 py-2 rounded-lg border text-sm transition-all ${pendingFilters.bathrooms === String(num)
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

                  {/* University Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3 text-[var(--color-text-soft)]">
                      {t("university") || "University"}
                    </h4>
                    <select
                      value={pendingFilters.universityId}
                      onChange={(e) => {
                        handlePendingFilterChange("universityId", e.target.value);
                        // Clear distance filter if university is cleared
                        if (!e.target.value) {
                          handlePendingFilterChange("maxDistance", "");
                        }
                      }}
                      className="w-full input-field text-sm"
                    >
                      <option value="">{t("allUniversities") || "All universities"}</option>
                      {universities.map((uni) => (
                        <option key={uni.id} value={uni.id}>
                          {uni.name}{uni.city ? ` — ${uni.city}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Distance Radius Filter - Only show when university is selected */}
                  {pendingFilters.universityId && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-3 text-[var(--color-text-soft)]">
                        {t("distanceFromUniversity") || "Distance from University"}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {DISTANCE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${pendingFilters.maxDistance === option.value
                              ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                              : "bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                              }`}
                            onClick={() =>
                              handlePendingFilterChange(
                                "maxDistance",
                                pendingFilters.maxDistance === option.value ? "" : option.value
                              )
                            }
                          >
                            {t(option.labelKey)}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        {t("distanceHint") || "Show properties within this radius"}
                      </p>
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

                {/* Listings Grid or Map View */}
                <div>
                  {/* View Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "grid"
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)]"
                          }`}
                      >
                        <Squares2X2Icon className="w-4 h-4" />
                        {t("gridView") || "Grid"}
                      </button>
                      <button
                        onClick={() => setViewMode("map")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "map"
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)]"
                          }`}
                      >
                        <MapIcon className="w-4 h-4" />
                        {t("mapView") || "Map"}
                      </button>
                    </div>
                  </div>

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

                  {viewMode === "map" ? (
                    <MapView
                      properties={filteredListings}
                      universities={universities}
                      height="600px"
                    />
                  ) : listingsLoading ? (
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
                                {t("listingDuration") || "Listing Duration"} *
                              </label>
                              <select
                                className="w-full input-field mt-1"
                                value={postForm.listingDuration}
                                onChange={(e) => updateForm("listingDuration", e.target.value)}
                                required
                              >
                                <option value="1week">{t("1week") || "1 Week"}</option>
                                <option value="2weeks">{t("2weeks") || "2 Weeks"}</option>
                                <option value="1month">{t("1month") || "1 Month"}</option>
                                <option value="2months">{t("2months") || "2 Months"}</option>
                                <option value="3months">{t("3months") || "3 Months"}</option>
                              </select>
                              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                {t("listingDurationHint") || "How long the listing will be visible"}
                              </p>
                            </div>
                          </div>

                          {/* Location Picker */}
                          <div className="mt-4">
                            <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                              {t("propertyLocation") || "Property Location"}
                            </label>
                            <LocationPicker
                              latitude={postForm.latitude}
                              longitude={postForm.longitude}
                              universities={universities}
                              universityLatitude={universities.find(u => u.id === postForm.universityId)?.latitude}
                              universityLongitude={universities.find(u => u.id === postForm.universityId)?.longitude}
                              onLocationChange={(lat, lng, city) => {
                                setPostForm(prev => ({
                                  ...prev,
                                  latitude: lat,
                                  longitude: lng,
                                }));
                              }}
                              height="300px"
                            />
                          </div>

                          {/* Max Occupants */}
                          <div className="mt-4">
                            <label className="text-sm font-medium text-[var(--color-text)]">
                              {t("maxOccupants") || "Max Occupants"} *
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              className="w-full input-field mt-1"
                              value={postForm.maxOccupants}
                              onChange={(e) => updateForm("maxOccupants", e.target.value)}
                              required
                            />
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                              {t("maxOccupantsHint") || "Maximum number of people allowed"}
                            </p>
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
                                  {image360Flags[file.name] && (
                                    <span className="absolute top-1 left-1 bg-[var(--color-accent)] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                      360°
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSelected(file.name)}
                                    className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    {t("remove")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggle360Flag(file.name)}
                                    className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={image360Flags[file.name] || false}
                                      onChange={() => { }}
                                      className="w-3 h-3"
                                    />
                                    {t("mark360") || "360°"}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Video Upload */}
                        <div className="themed-surface-alt border themed-border rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">
                                {t("uploadVideo") || "Upload Video"} <span className="text-[var(--color-text-muted)]">({t("optional") || "Optional"})</span>
                              </p>
                              <p className="text-xs text-[var(--color-text-soft)]">
                                {t("videoLimit") || "1 video max, up to 50MB (MP4, WebM, MOV, AVI)"}
                              </p>
                            </div>
                            {uploadingVideo && (
                              <span className="text-xs text-[var(--color-accent)]">
                                {t("uploadingVideo") || "Uploading video..."}
                              </span>
                            )}
                          </div>
                          
                          {!selectedVideo ? (
                            <label className="mt-2 flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed themed-border text-sm text-[var(--color-text-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                                className="hidden"
                                onChange={(e) => handleVideoSelect(e.target.files)}
                                disabled={uploadingVideo}
                              />
                              <div className="flex flex-col items-center gap-1">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>{t("clickToUploadVideo") || "Click to upload video"}</span>
                              </div>
                            </label>
                          ) : (
                            <div className="mt-2 p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[var(--color-accent)]/10 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[var(--color-text)] truncate max-w-[200px]">
                                    {selectedVideo.name}
                                  </p>
                                  <p className="text-xs text-[var(--color-text-muted)]">
                                    {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveVideo}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
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
                    : authModalMessage === "favorites"
                      ? t("pleaseSignInToViewFavorites") || "Please sign in to view your favorites."
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
      </PageLoader>
    </PageLoader>
  );
};



export default Apartments;
