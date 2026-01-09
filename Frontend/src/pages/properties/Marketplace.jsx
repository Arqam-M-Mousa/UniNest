import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { marketplaceAPI, uploadsAPI } from "../../services/api";
import {
  QueueListIcon,
  PlusIcon,
  TagIcon,
  XMarkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import TabButton from "../../components/common/TabButton";
import Alert from "../../components/common/Alert";
import PageLoader from "../../components/common/PageLoader";
import MarketplaceItemCard from "../../components/marketplace/MarketplaceItemCard";

const Marketplace = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isRTL = language === "ar";

  // Constants
  const SEARCH_DELAY_MS = 500;
  const FILTER_APPLY_DELAY_MS = 500;

  const EMPTY_FILTERS = {
    category: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
  };

  // Items state
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [myItemsLoading, setMyItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [activeTab, setActiveTab] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    conditions: [],
    priceRange: { min: 0, max: 10000 },
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterApplyLoading, setFilterApplyLoading] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");

  // Post item modal state
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "NIS",
    condition: "good",
    category: "other",
    contactPhone: "",
    contactEmail: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Check if user can post (students only, not landlords)
  const canPostItem = Boolean(
    user?.role && ["student", "admin", "superadmin"].includes(user.role.toLowerCase()) && user.role.toLowerCase() !== "landlord"
  );

  // Check if landlord (to show restricted message)
  const isLandlord = user?.role?.toLowerCase() === "landlord";

  // Fetch items from backend
  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    setItemsError("");

    try {
      const queryFilters = { ...filters };
      if (activeSearchQuery) queryFilters.search = activeSearchQuery;

      const response = await marketplaceAPI.list(queryFilters);
      setItems(response?.data?.items || []);
      setTotalItems(response?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItemsError(err.message || t("failedToLoadItems"));
    } finally {
      setItemsLoading(false);
    }
  }, [filters, activeSearchQuery, t]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await marketplaceAPI.getFilterOptions();
      if (response?.data) {
        setFilterOptions({
          categories: response.data.categories || [],
          conditions: response.data.conditions || [],
          priceRange: response.data.priceRange || { min: 0, max: 10000 },
        });
      }
    } catch (err) {
      console.error("Failed to fetch filter options:", err);
    }
  }, []);

  // Fetch user's own items
  const fetchMyItems = useCallback(async () => {
    if (!user) return;
    setMyItemsLoading(true);
    try {
      const response = await marketplaceAPI.getMyItems();
      setMyItems(response?.data?.items || []);
    } catch (err) {
      console.error("Failed to fetch my items:", err);
    } finally {
      setMyItemsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchItems();
    fetchFilterOptions();
    if (user) fetchMyItems();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchItems();
  }, [filters, activeSearchQuery]);

  const handlePendingFilterChange = (key, value) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = async () => {
    setFilterApplyLoading(true);
    setFilters(pendingFilters);
    await new Promise((resolve) => setTimeout(resolve, FILTER_APPLY_DELAY_MS));
    setFilterApplyLoading(false);
  };

  const clearFilters = async () => {
    setFilterApplyLoading(true);
    setPendingFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setSearchQuery("");
    setActiveSearchQuery("");
    await new Promise((resolve) => setTimeout(resolve, 250));
    setFilterApplyLoading(false);
  };

  const handleSearchKeyPress = async (e) => {
    if (e.key === "Enter") {
      setSearchLoading(true);
      setActiveSearchQuery(searchQuery);
      await new Promise((resolve) => setTimeout(resolve, SEARCH_DELAY_MS));
      setSearchLoading(false);
    }
  };

  const handlePostItemClick = (itemToEdit = null) => {
    if (!isAuthenticated) {
      setAuthModalMessage("postItem");
      setShowAuthModal(true);
      return;
    }
    if (!canPostItem) {
      return;
    }

    setPostError("");
    setPostSuccess("");

    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setPostForm({
        title: itemToEdit.title || "",
        description: itemToEdit.description || "",
        price: itemToEdit.price || "",
        currency: itemToEdit.currency || "NIS",
        condition: itemToEdit.condition || "good",
        category: itemToEdit.category || "other",
        contactPhone: itemToEdit.contactPhone || "",
        contactEmail: itemToEdit.contactEmail || "",
      });
    } else {
      setEditingItem(null);
      resetForm();
    }

    setPostModalOpen(true);
  };

  const updateForm = (field, value) => {
    setPostForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingItem(null);
    setPostForm({
      title: "",
      description: "",
      price: "",
      currency: "NIS",
      condition: "good",
      category: "other",
      contactPhone: "",
      contactEmail: "",
    });
    setSelectedFiles([]);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!canPostItem) return;

    setPostSubmitting(true);
    setPostError("");
    setPostSuccess("");

    try {
      // Validate required fields
      if (!postForm.title.trim() || !postForm.description.trim() || !postForm.price) {
        throw new Error(t("fillRequiredFields") || "Please fill in all required fields");
      }

      let uploadedImages = [];
      // Upload images if selected
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const uploadRes = await uploadsAPI.uploadListingImages(selectedFiles);
        uploadedImages = uploadRes?.data || [];
        setUploadingImages(false);
      }

      const payload = {
        title: postForm.title.trim(),
        description: postForm.description.trim(),
        price: parseFloat(postForm.price),
        currency: postForm.currency || "NIS",
        condition: postForm.condition || "good",
        category: postForm.category || "other",
        contactPhone: postForm.contactPhone || null,
        contactEmail: postForm.contactEmail || null,
        images: uploadedImages.length > 0
          ? uploadedImages.map((img) => ({ url: img.url, publicId: img.publicId }))
          : editingItem?.images || [],
      };

      if (editingItem) {
        await marketplaceAPI.update(editingItem.id, payload);
        setPostSuccess(t("itemUpdatedSuccessfully") || "Item updated successfully!");
      } else {
        await marketplaceAPI.create(payload);
        setPostSuccess(t("itemCreatedSuccessfully") || "Item posted successfully!");
      }

      resetForm();
      setPostModalOpen(false);
      fetchItems();
      fetchMyItems();
    } catch (err) {
      setPostError(err.message || t("failedToCreateItem") || "Failed to post item");
    } finally {
      setPostSubmitting(false);
      setUploadingImages(false);
    }
  };

  const handleCancelModal = () => {
    resetForm();
    setPostError("");
    setPostModalOpen(false);
  };

  const handleImageSelect = (files) => {
    if (!files?.length) return;
    const fileArr = Array.from(files);
    const remaining = 5 - selectedFiles.length;
    if (fileArr.length > remaining) {
      setPostError(`${t("canAddMoreImages") || "You can add"} ${remaining} ${t("moreImages") || "more image(s)"}.`);
      return;
    }
    setSelectedFiles((prev) => [...prev, ...fileArr].slice(0, 5));
  };

  const handleRemoveSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const getCategoryLabel = (cat) => {
    const categoryMap = {
      furniture: t("categoryFurniture"),
      electronics: t("categoryElectronics"),
      books: t("categoryBooks"),
      clothing: t("categoryClothing"),
      kitchenware: t("categoryKitchenware"),
      sports: t("categorySports"),
      other: t("categoryOther"),
    };
    return categoryMap[cat] || cat;
  };

  const getConditionLabel = (cond) => {
    const conditionMap = {
      new: t("conditionNew"),
      like_new: t("conditionLikeNew"),
      good: t("conditionGood"),
      fair: t("conditionFair"),
    };
    return conditionMap[cond] || cond;
  };

  // Show restricted message for landlords
  if (isAuthenticated && isLandlord) {
    return (
      <PageLoader sessionKey="marketplace_visited" message={t("loadingMarketplace")}>
        <div className="py-16 px-8 text-center min-h-[50vh] themed-surface">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XMarkIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="heading-font text-2xl font-bold mb-4 text-[var(--color-text)]">
              {t("accessRestricted")}
            </h1>
            <p className="text-[var(--color-text-soft)] mb-6">
              {t("marketplaceLandlordRestricted")}
            </p>
            <button
              onClick={() => navigate("/apartments")}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              {t("goToApartments")}
            </button>
          </div>
        </div>
      </PageLoader>
    );
  }

  return (
    <PageLoader sessionKey="marketplace_visited" message={t("loadingMarketplace")}>
      <PageLoader loading={postSubmitting} overlay message={t("posting") || "Posting..."}>
        <PageLoader loading={searchLoading} overlay message={t("loading")}>
          <PageLoader loading={filterApplyLoading} overlay message={t("loading")}>
            <div className="min-h-screen themed-surface">
              {/* Hero Section */}
              <section className="relative py-16 px-8 text-center overflow-hidden">
                {/* Background with decorative shapes */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 via-[var(--color-surface)] to-[var(--color-accent)]/10" />
                <div className="absolute inset-0 overflow-hidden">
                  {/* Large gradient circle - top right */}
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-[var(--color-accent)]/30 to-transparent rounded-full blur-3xl" />
                  {/* Medium circle - bottom left */}
                  <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-2xl" />
                  {/* Small accent circle - center */}
                  <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-r from-blue-500/15 to-[var(--color-accent)]/15 rounded-full blur-2xl" />
                  {/* Floating shapes */}
                  <div className="absolute top-12 left-[15%] w-20 h-20 bg-[var(--color-accent)]/10 rounded-2xl rotate-12 blur-sm" />
                  <div className="absolute bottom-12 right-[20%] w-16 h-16 bg-purple-500/10 rounded-full blur-sm" />
                  <div className="absolute top-1/3 right-[10%] w-12 h-12 bg-blue-500/10 rounded-lg rotate-45 blur-sm" />
                </div>

                <div className="relative z-10">
                  <h1 className="heading-font text-4xl font-bold mb-4 text-[var(--color-text)]">
                    {t("studentMarketplace")}
                  </h1>
                  <p className="text-center text-lg mb-8 text-[var(--color-text-soft)]">
                    {t("marketplaceDescription")}
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
                      placeholder={t("searchMarketplace")}
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
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Tabs and Post Button */}
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex gap-3 flex-wrap">
                <TabButton
                  active={activeTab === "latest"}
                  onClick={() => setActiveTab("latest")}
                  icon={<QueueListIcon className="w-5 h-5" />}
                >
                  {t("latestItems")}
                </TabButton>

                {user && canPostItem && (
                  <TabButton
                    active={activeTab === "myItems"}
                    onClick={() => {
                      setActiveTab("myItems");
                      fetchMyItems();
                    }}
                    icon={<TagIcon className="w-5 h-5" />}
                  >
                    {t("myItems")}
                  </TabButton>
                )}

                {canPostItem && (
                  <button
                    onClick={handlePostItemClick}
                    className={`${isRTL ? "mr-auto flex-row-reverse" : "ml-auto"} flex items-center gap-2 px-6 py-3 rounded-full btn-primary text-sm hover:scale-105 transition-transform`}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    <PlusIcon className="w-5 h-5" />
                    {t("postItem")}
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
                      <TagIcon className="w-5 h-5" />
                      {t("filters")}
                    </h3>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[var(--color-accent)] hover:underline"
                    >
                      {t("clearAll")}
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3 text-[var(--color-text-soft)]">
                      {t("category")}
                    </h4>
                    <div className="space-y-2">
                      {filterOptions.categories.map((cat) => (
                        <button
                          key={cat}
                          className={`w-full flex justify-between items-center px-4 py-3 rounded-lg border transition-all ${pendingFilters.category === cat
                            ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                            : "bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                            }`}
                          onClick={() =>
                            handlePendingFilterChange("category", pendingFilters.category === cat ? "" : cat)
                          }
                        >
                          <span className="font-medium text-sm">{getCategoryLabel(cat)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Condition Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3 text-[var(--color-text-soft)]">
                      {t("condition")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.conditions.map((cond) => (
                        <button
                          key={cond}
                          className={`px-4 py-2 rounded-lg border text-sm transition-all ${pendingFilters.condition === cond
                            ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                            : "bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                            }`}
                          onClick={() =>
                            handlePendingFilterChange("condition", pendingFilters.condition === cond ? "" : cond)
                          }
                        >
                          {getConditionLabel(cond)}
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
                        placeholder={t("min")}
                        value={pendingFilters.minPrice}
                        onChange={(e) => handlePendingFilterChange("minPrice", e.target.value)}
                        className="w-full input-field text-sm"
                        min="0"
                      />
                      <input
                        type="number"
                        placeholder={t("max")}
                        value={pendingFilters.maxPrice}
                        onChange={(e) => handlePendingFilterChange("maxPrice", e.target.value)}
                        className="w-full input-field text-sm"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <button
                    onClick={applyFilters}
                    className="w-full py-3 rounded-lg btn-primary text-sm font-semibold mb-4"
                  >
                    {t("applyFilters")}
                  </button>

                  {/* Results Count */}
                  <div className="pt-4 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-soft)]">
                      {t("showingResults")}{" "}
                      <span className="font-semibold text-[var(--color-text)]">{items.length}</span>{" "}
                      {t("items")}
                    </p>
                  </div>
                </aside>

                {/* Items Grid */}
                <div>
                  {itemsError && activeTab === "latest" && (
                    <div className="mb-6 rounded-lg border border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
                      {itemsError}
                      <button onClick={fetchItems} className="ml-2 underline hover:no-underline">
                        {t("tryAgain")}
                      </button>
                    </div>
                  )}

                  {/* My Items Tab */}
                  {activeTab === "myItems" ? (
                    myItemsLoading ? (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                        {[...Array(4)].map((_, idx) => (
                          <div key={idx} className="animate-pulse rounded-xl overflow-hidden themed-surface-alt">
                            <div className="pt-[75%] bg-[var(--color-border)]" />
                            <div className="p-4 space-y-3">
                              <div className="h-5 bg-[var(--color-border)] rounded w-3/4" />
                              <div className="h-6 bg-[var(--color-border)] rounded w-1/2" />
                              <div className="h-4 bg-[var(--color-border)] rounded w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : myItems.length === 0 ? (
                      <div className="text-center py-16">
                        <TagIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-soft)]" />
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                          {t("noMyItemsYet")}
                        </h3>
                        <p className="text-[var(--color-text-soft)] mb-6">{t("postYourFirstItem")}</p>
                        <button onClick={handlePostItemClick} className="btn-primary px-6 py-2 rounded-lg">
                          {t("postItem")}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                        {myItems.map((item, idx) => (
                          <MarketplaceItemCard
                            key={item.id}
                            item={item}
                            delay={idx * 50}
                            showManageOptions={true}
                            onUpdate={() => {
                              fetchMyItems();
                              fetchItems();
                            }}
                            onEdit={() => handlePostItemClick(item)}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    /* Latest Items Tab */
                    itemsLoading ? (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                        {[...Array(6)].map((_, idx) => (
                          <div key={idx} className="animate-pulse rounded-xl overflow-hidden themed-surface-alt">
                            <div className="pt-[75%] bg-[var(--color-border)]" />
                            <div className="p-4 space-y-3">
                              <div className="h-5 bg-[var(--color-border)] rounded w-3/4" />
                              <div className="h-6 bg-[var(--color-border)] rounded w-1/2" />
                              <div className="h-4 bg-[var(--color-border)] rounded w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : items.length === 0 ? (
                      <div className="text-center py-16">
                        <TagIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-soft)]" />
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                          {t("noItemsFound")}
                        </h3>
                        <p className="text-[var(--color-text-soft)] mb-6">{t("tryAdjustingFilters")}</p>
                        <button onClick={clearFilters} className="btn-secondary px-6 py-2 rounded-lg">
                          {t("clearFilters")}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                        {items.map((item, idx) => (
                          <MarketplaceItemCard key={item.id} item={item} delay={idx * 50} />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </PageLoader>
        </PageLoader>
      </PageLoader>

      {/* Auth Modal */}
      {showAuthModal && (
        <Alert
          title={t("signInRequired")}
          message={
            authModalMessage === "postItem"
              ? t("pleaseSignInToPostItem")
              : t("pleaseSignInToViewMarketplace")
          }
          type="info"
          confirmText={t("signIn")}
          cancelText={t("cancel")}
          onConfirm={() => {
            setShowAuthModal(false);
            navigate("/signin");
          }}
          onCancel={() => setShowAuthModal(false)}
        />
      )}

      {/* Post Item Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  {editingItem ? t("editItem") : t("postItem")}
                </h2>
                <button
                  onClick={handleCancelModal}
                  className="p-2 hover:bg-[var(--color-bg-alt)] rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-[var(--color-text-soft)]" />
                </button>
              </div>

              {postError && (
                <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                  {postError}
                </div>
              )}

              <form onSubmit={handleSubmitPost} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    {t("title")} *
                  </label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    placeholder={t("itemTitlePlaceholder")}
                    className="w-full input-field"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    {t("description")} *
                  </label>
                  <textarea
                    value={postForm.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder={t("itemDescriptionPlaceholder")}
                    rows={3}
                    className="w-full input-field resize-none"
                    required
                  />
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                      {t("price")} *
                    </label>
                    <input
                      type="number"
                      value={postForm.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                      placeholder="0"
                      className="w-full input-field"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                      {t("currency")}
                    </label>
                    <select
                      value={postForm.currency}
                      onChange={(e) => updateForm("currency", e.target.value)}
                      className="w-full input-field"
                    >
                      <option value="NIS">NIS (₪)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                {/* Category and Condition */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                      {t("category")}
                    </label>
                    <select
                      value={postForm.category}
                      onChange={(e) => updateForm("category", e.target.value)}
                      className="w-full input-field"
                    >
                      <option value="furniture">{t("categoryFurniture")}</option>
                      <option value="electronics">{t("categoryElectronics")}</option>
                      <option value="books">{t("categoryBooks")}</option>
                      <option value="clothing">{t("categoryClothing")}</option>
                      <option value="kitchenware">{t("categoryKitchenware")}</option>
                      <option value="sports">{t("categorySports")}</option>
                      <option value="other">{t("categoryOther")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                      {t("condition")}
                    </label>
                    <select
                      value={postForm.condition}
                      onChange={(e) => updateForm("condition", e.target.value)}
                      className="w-full input-field"
                    >
                      <option value="new">{t("conditionNew")}</option>
                      <option value="like_new">{t("conditionLikeNew")}</option>
                      <option value="good">{t("conditionGood")}</option>
                      <option value="fair">{t("conditionFair")}</option>
                    </select>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                      {t("contactPhone")} <span className="text-[var(--color-text-soft)]">({t("optional")})</span>
                    </label>
                    <input
                      type="tel"
                      value={postForm.contactPhone}
                      onChange={(e) => updateForm("contactPhone", e.target.value)}
                      placeholder="+972..."
                      className="w-full input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                      {t("contactEmail")} <span className="text-[var(--color-text-soft)]">({t("optional")})</span>
                    </label>
                    <input
                      type="email"
                      value={postForm.contactEmail}
                      onChange={(e) => updateForm("contactEmail", e.target.value)}
                      placeholder="email@example.com"
                      className="w-full input-field"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    {t("images")} <span className="text-[var(--color-text-soft)]">({t("optional")})</span>
                  </label>
                  <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageSelect(e.target.files)}
                      className="hidden"
                      id="item-images"
                    />
                    <label
                      htmlFor="item-images"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <PhotoIcon className="w-10 h-10 text-[var(--color-text-soft)]" />
                      <span className="text-sm text-[var(--color-text-soft)]">
                        {t("clickToUpload")} ({5 - selectedFiles.length} {t("remaining")})
                      </span>
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedFiles.map((file) => (
                        <div key={file.name} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSelected(file.name)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelModal}
                    className="flex-1 py-3 rounded-lg btn-secondary border themed-border"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={postSubmitting || uploadingImages}
                    className="flex-1 py-3 rounded-lg btn-primary disabled:opacity-50"
                  >
                    {postSubmitting || uploadingImages ? t("posting") : t("postItem")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageLoader>
  );
};

export default Marketplace;
