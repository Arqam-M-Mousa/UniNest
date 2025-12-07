import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  propertyListingsAPI,
  uploadsAPI,
  universitiesAPI,
} from "../services/api";
import { properties } from "../data/properties";
import TabButton from "../components/TabButton";
import HeartButton from "../components/HeartButton";
import Reveal from "../components/Reveal";
import Alert from "../components/Alert";
import nnuImg from "../assets/nnu.jpg__1320x740_q95_crop_subsampling-2_upscale.jpg";
import PageLoader from "../components/PageLoader";

const Apartments = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isRTL = language === "ar";
  const [activeTab, setActiveTab] = useState("lastListings");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");
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
    city: "",
    bedrooms: "1",
    bathrooms: "1",
    squareFeet: "",
    distanceToUniversity: "",
    leaseDuration: "",
    availableFrom: "",
    availableUntil: "",
    universityId: user?.universityId || "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [universitiesFetched, setUniversitiesFetched] = useState(false);

  const canPostAd = Boolean(
    user?.role && ["landlord", "admin"].includes(user.role.toLowerCase())
  );

  const priceRanges = [
    { label: "Arqam", count: 15 },
    { label: "Arqam", count: 20 },
    { label: "Arqam", count: 30 },
    { label: "Arqam", count: 12 },
  ];

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

  const handleMessageClick = (e) => {
    if (!isAuthenticated) {
      setAuthModalMessage("message");
      setShowAuthModal(true);
    } else {
      console.log("Opening message conversation");
    }
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
      city: "",
      bedrooms: "1",
      bathrooms: "1",
      squareFeet: "",
      distanceToUniversity: "",
      leaseDuration: "",
      availableFrom: "",
      availableUntil: "",
      universityId: user?.universityId || "",
    });
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!canPostAd) return;

    setPostSubmitting(true);
    setPostError("");
    setPostSuccess("");

    try {
      if (selectedFiles.length > 10) {
        throw new Error("Maximum 10 images per listing");
      }

      let uploadedUrls = [];
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const uploadRes = await uploadsAPI.uploadListingImages(selectedFiles);
        uploadedUrls = uploadRes?.data?.map((i) => i.url) || [];
      }

      const combinedImages = [...uploadedUrls];

      if (combinedImages.length > 10) {
        throw new Error("Maximum 10 images per listing");
      }

      const payload = {
        title: postForm.title.trim(),
        description: postForm.description.trim(),
        propertyType: postForm.propertyType,
        pricePerMonth: Number(postForm.pricePerMonth),
        currency: postForm.currency || "NIS",
        bedrooms: Number(postForm.bedrooms),
        bathrooms: Number(postForm.bathrooms),
        squareFeet: Number(postForm.squareFeet),
        distanceToUniversity: Number(postForm.distanceToUniversity),
        leaseDuration: postForm.leaseDuration.trim(),
        availableFrom: postForm.availableFrom || null,
        availableUntil: postForm.availableUntil || null,
        universityId: postForm.universityId || user?.universityId,
        images: combinedImages,
      };

      if (
        !payload.title ||
        !payload.description ||
        !payload.pricePerMonth ||
        !payload.squareFeet ||
        !payload.distanceToUniversity ||
        !payload.universityId
      ) {
        throw new Error("Please fill in all required fields");
      }

      await propertyListingsAPI.create(payload);
      setPostSuccess(t("Ad created successfully") || "Ad created successfully");
      resetForm();
      setSelectedFiles([]);
      setPostModalOpen(false);
    } catch (err) {
      setPostError(err.message || "Failed to create ad");
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
        setPostError("Failed to load universities");
      } finally {
        setUniversitiesLoading(false);
        setUniversitiesFetched(true);
      }
    };

    if (postModalOpen && !universitiesFetched && !universitiesLoading) {
      loadUniversities();
    }
  }, [postModalOpen, universitiesFetched, universitiesLoading]);

  const handleImageSelect = (files) => {
    if (!files?.length) return;
    const fileArr = Array.from(files);
    if (fileArr.length > remainingImageSlots) {
      setPostError(`You can add ${remainingImageSlots} more image(s).`);
      return;
    }
    setSelectedFiles((prev) => [...prev, ...fileArr].slice(0, 10));
  };

  const handleRemoveSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  return (
    <PageLoader
      loading={postSubmitting}
      overlay
      message={t("Posting ad...") || "Posting ad..."}
    >
      <div className="min-h-screen themed-surface">
        <section className="relative py-12 px-8 text-center overflow-hidden">
          {/* Background Image */}
          <img
            src={nnuImg}
            alt="Campus Background"
            className="absolute inset-0 w-full h-full object-cover blur-[2px]"
          />
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 dark:from-black/60 dark:to-black/40"
            aria-hidden="true"
          />

          {/* Content */}
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
                className="flex-1 bg-transparent border-none outline-none text-base text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex gap-3 flex-wrap">
          <TabButton
            active={activeTab === "lastListings"}
            onClick={() => setActiveTab("lastListings")}
            icon={
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
            }
          >
            {t("lastListings")}
          </TabButton>
          <TabButton
            active={activeTab === "offers"}
            onClick={() => setActiveTab("offers")}
            icon={
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
          <TabButton
            active={activeTab === "masonry"}
            onClick={() => setActiveTab("masonry")}
            icon={
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
            }
          >
            {t("masonry")}
          </TabButton>
          {canPostAd && (
            <button
              onClick={handlePostAdClick}
              className={`${
                isRTL ? "mr-auto flex-row-reverse" : "ml-auto"
              } flex items-center gap-2 px-6 py-3 rounded-full btn-primary text-sm hover:scale-105 transition-transform`}
              dir={isRTL ? "rtl" : "ltr"}
            >
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
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 grid lg:grid-cols-[250px_1fr] gap-8">
          <aside
            className="themed-surface-alt p-6 rounded-xl mb-8 lg:mb-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto shadow-sm border border-[var(--color-border)]"
            aria-label={t("filters")}
          >
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

          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
            {properties.map((property, idx) => (
              <Reveal key={property.id} delay={idx * 70} className="w-full">
                <Link
                  to={`/marketplace/${property.id}`}
                  className="market-card themed-surface-alt rounded-xl overflow-hidden no-underline text-inherit shadow-card ring-0 hover:ring-2 hover:ring-[var(--color-accent)] transition-shadow"
                >
                  <div className="market-card-img-wrapper relative pt-[75%] bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)]">
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="market-card-gradient" aria-hidden="true" />
                    <div className="absolute top-4 right-4">
                      <HeartButton size={40} />
                    </div>
                  </div>
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
            ))}
          </div>
        </div>

        {postSuccess && (
          <div className="max-w-3xl mx-auto px-4 md:px-8 pb-4">
            <div className="rounded-md border border-green-500/60 bg-green-500/10 text-green-700 dark:text-green-200 px-4 py-3 text-sm">
              {postSuccess}
            </div>
          </div>
        )}

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
                    {t("Create listing") || "Create listing"}
                  </p>
                  <h3 className="text-xl font-semibold text-[var(--color-text)]">
                    {t("Post a Property Ad") || "Post a Property Ad"}
                  </h3>
                </div>
              </div>

              {postError && (
                <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
                  {postError}
                </div>
              )}

              <div className="overflow-y-auto max-h-[70vh] pr-2">
                <form className="space-y-6" onSubmit={handleSubmitPost}>
                  <div className="rounded-xl border themed-border bg-[var(--color-surface-alt)] p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">
                      {t("Listing basics") || "Listing basics"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label
                          className="text-sm font-medium text-[var(--color-text)]"
                          htmlFor="title"
                        >
                          {t("Listing title") || "Listing title"}
                        </label>
                        <input
                          id="title"
                          className="w-full input-field mt-1"
                          value={postForm.title}
                          onChange={(e) => updateForm("title", e.target.value)}
                          placeholder={
                            t("Cozy 2BR near campus") || "Cozy 2BR near campus"
                          }
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label
                          className="text-sm font-medium text-[var(--color-text)]"
                          htmlFor="description"
                        >
                          {t("Description") || "Description"}
                        </label>
                        <textarea
                          id="description"
                          className="w-full input-field mt-1 min-h-[110px]"
                          value={postForm.description}
                          onChange={(e) =>
                            updateForm("description", e.target.value)
                          }
                          placeholder={
                            t("Describe the place, amenities, nearby spots") ||
                            "Describe the place, amenities, nearby spots"
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("Property type") || "Property type"}
                        </label>
                        <select
                          className="w-full input-field mt-1"
                          value={postForm.propertyType}
                          onChange={(e) =>
                            updateForm("propertyType", e.target.value)
                          }
                        >
                          <option>Apartment</option>
                          <option>House</option>
                          <option>Room</option>
                          <option>Studio</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("University") || "University"}
                        </label>
                        <select
                          className="w-full input-field mt-1"
                          value={postForm.universityId}
                          onChange={(e) =>
                            updateForm("universityId", e.target.value)
                          }
                          disabled={universitiesLoading}
                          required
                        >
                          <option value="" disabled>
                            {universitiesLoading
                              ? t("Loading universities...") ||
                                "Loading universities..."
                              : t("Select a university") ||
                                "Select a university"}
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

                  <div className="rounded-xl border themed-border bg-[var(--color-surface-alt)] p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">
                      {t("Pricing & details") || "Pricing & details"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("Monthly price") || "Monthly price"}
                        </label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            min="0"
                            className="w-full input-field"
                            value={postForm.pricePerMonth}
                            onChange={(e) =>
                              updateForm("pricePerMonth", e.target.value)
                            }
                            placeholder="1500"
                            required
                          />
                          <select
                            className="w-28 input-field"
                            value={postForm.currency}
                            onChange={(e) =>
                              updateForm("currency", e.target.value)
                            }
                          >
                            <option value="NIS">NIS</option>
                            <option value="JOD">JOD</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("Bedrooms") || "Bedrooms"}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full input-field mt-1"
                          value={postForm.bedrooms}
                          onChange={(e) =>
                            updateForm("bedrooms", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("Bathrooms") || "Bathrooms"}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full input-field mt-1"
                          value={postForm.bathrooms}
                          onChange={(e) =>
                            updateForm("bathrooms", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("Size (sqft)") || "Size (sqft)"}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full input-field mt-1"
                          value={postForm.squareFeet}
                          onChange={(e) =>
                            updateForm("squareFeet", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("Distance to university (km)") ||
                            "Distance to university (km)"}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full input-field mt-1"
                          value={postForm.distanceToUniversity}
                          onChange={(e) =>
                            updateForm("distanceToUniversity", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("Lease duration") || "Lease duration"}
                        </label>
                        <input
                          className="w-full input-field mt-1"
                          value={postForm.leaseDuration}
                          onChange={(e) =>
                            updateForm("leaseDuration", e.target.value)
                          }
                          placeholder={t("e.g. 12 months") || "e.g. 12 months"}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="themed-surface-alt border themed-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {t("Upload images") || "Upload images"}
                        </p>
                        <p className="text-xs text-[var(--color-text-soft)]">
                          {t("Up to 10 images. Remaining") ||
                            "Up to 10 images. Remaining"}
                          : {10 - selectedFiles.length}
                        </p>
                      </div>
                      {uploadingImages && (
                        <span className="text-xs text-[var(--color-accent)]">
                          {t("Uploading...") || "Uploading..."}
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
                      {t("Click or drop to upload") ||
                        "Click or drop to upload"}
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
                              {t("remove") || "remove"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 pb-1">
                    <div className="text-xs text-[var(--color-text-soft)]">
                      {t("Tip") || "Tip"}:{" "}
                      {t("Great photos increase engagement") ||
                        "Great photos increase engagement"}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCancelModal}
                        className="px-4 py-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)]"
                      >
                        {t("cancel") || "Cancel"}
                      </button>
                      <button
                        type="submit"
                        disabled={postSubmitting}
                        className="px-5 py-2 rounded-md btn-primary disabled:opacity-60"
                      >
                        {postSubmitting
                          ? t("Posting...") || "Posting..."
                          : t("postAd") || "Post Ad"}
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
          title={t("Sign In Required") || "Sign In Required"}
          message={
            authModalMessage === "message"
              ? t("Please Sign in To Message") ||
                "Please sign in to message the property owner."
              : t("Please Sign in To Post Ad") ||
                "Please sign in to your account to post an ad and connect with students."
          }
          type="warning"
          confirmText={t("signIn") || "Sign In"}
          cancelText={t("cancel") || "Cancel"}
          onConfirm={() => navigate("/signin")}
        />
      </div>
    </PageLoader>
  );
};

export default Apartments;
