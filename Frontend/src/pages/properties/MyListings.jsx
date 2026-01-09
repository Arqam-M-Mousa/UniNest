import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { propertyListingsAPI, universitiesAPI } from "../../services/api";
import LocationPicker from "../../components/properties/LocationPicker";
import { calculateDistance } from "../../utils/mapUtils";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  HomeModernIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  CheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";

const MyListings = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [universities, setUniversities] = useState([]);

  // Fetch universities
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await universitiesAPI.getAll();
        setUniversities(response.data || []);
      } catch (err) {
        console.error("Failed to fetch universities:", err);
      }
    };
    fetchUniversities();
  }, []);

  // Auto-calculate distance in edit form
  useEffect(() => {
    if (editForm.latitude && editForm.longitude && (editForm.universityId || user?.universityId)) {
      const uniId = editForm.universityId || user?.universityId;
      const uni = universities.find(u => u.id === uniId);

      if (uni?.latitude && uni?.longitude) {
        const dist = calculateDistance(
          parseFloat(editForm.latitude),
          parseFloat(editForm.longitude),
          parseFloat(uni.latitude),
          parseFloat(uni.longitude)
        );
        setEditForm(prev => ({ ...prev, distanceToUniversity: dist }));
      }
    }
  }, [editForm.latitude, editForm.longitude, editForm.universityId, user?.universityId, universities]);

  const canAccess = user?.role && ["landlord", "superadmin"].includes(user.role.toLowerCase());

  // Redirect if not authorized
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    if (!canAccess) {
      navigate("/");
    }
  }, [isAuthenticated, canAccess, navigate]);

  const fetchListings = useCallback(async () => {
    if (!canAccess) return;

    setLoading(true);
    setError("");
    try {
      const response = await propertyListingsAPI.getMyListings();
      setListings(response?.data?.listings || []);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError(err.message || "Failed to load your listings");
    } finally {
      setLoading(false);
    }
  }, [canAccess]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleToggleVisibility = async (listing) => {
    setActionLoading(listing.id);
    try {
      const response = await propertyListingsAPI.toggleVisibility(listing.id);
      // Update local state
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id
            ? { ...l, isPublished: response?.data?.isPublished }
            : l
        )
      );
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
      setError(err.message || "Failed to update listing visibility");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (listingId) => {
    setActionLoading(listingId);
    try {
      await propertyListingsAPI.delete(listingId);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete listing:", err);
      setError(err.message || "Failed to delete listing");
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (listing) => {
    setEditForm({
      title: listing.title || "",
      description: listing.description || "",
      propertyType: listing.propertyType || "Apartment",
      pricePerMonth: listing.pricePerMonth || "",
      currency: listing.currency || "NIS",
      bedrooms: listing.bedrooms || 1,
      bathrooms: listing.bathrooms || 1,
      squareFeet: listing.squareFeet || "",
      distanceToUniversity: listing.distanceToUniversity || "",
      leaseDuration: listing.leaseDuration || "",
      listingDuration: listing.listingDuration || "1month",
      latitude: listing.latitude,
      longitude: listing.longitude,
      universityId: listing.universityId,
      maxOccupants: listing.maxOccupants || 1,
    });
    setEditError("");
    setEditModal(listing);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal) return;

    setEditLoading(true);
    setEditError("");

    try {
      await propertyListingsAPI.update(editModal.id, {
        title: editForm.title,
        description: editForm.description,
        propertyType: editForm.propertyType,
        pricePerMonth: Number(editForm.pricePerMonth),
        currency: editForm.currency,
        bedrooms: Number(editForm.bedrooms),
        bathrooms: Number(editForm.bathrooms),
        squareFeet: Number(editForm.squareFeet),
        distanceToUniversity: Number(editForm.distanceToUniversity),
        leaseDuration: editForm.leaseDuration,
        listingDuration: editForm.listingDuration,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        universityId: editForm.universityId,
        maxOccupants: Number(editForm.maxOccupants),
      });

      // Refresh listings
      await fetchListings();
      setEditModal(null);
    } catch (err) {
      console.error("Failed to update listing:", err);
      setEditError(err.message || "Failed to update listing");
    } finally {
      setEditLoading(false);
    }
  };

  const getImage = (listing) => {
    if (listing.images && listing.images.length > 0) {
      if (typeof listing.images[0] === "object" && listing.images[0].url) {
        return listing.images[0].url;
      }
      return listing.images[0];
    }
    return DEFAULT_IMAGE;
  };

  if (!canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen themed-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              {t("myListings") || "My Listings"}
            </h1>
            <p className="text-[var(--color-text-soft)] mt-1">
              {t("manageYourProperties") || "Manage your property listings"}
            </p>
          </div>
          <Link
            to="/apartments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg font-medium transition-colors no-underline"
          >
            <PlusIcon className="w-5 h-5" />
            {t("postNewAd") || "Post New Ad"}
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 flex items-center gap-3">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError("")}
              className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-accent)] border-t-transparent"></div>
          </div>
        ) : listings.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
              <HomeModernIcon className="w-10 h-10 text-[var(--color-accent)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              {t("noListingsYet") || "No listings yet"}
            </h2>
            <p className="text-[var(--color-text-soft)] mb-6">
              {t("startByCreating") || "Start by creating your first property listing"}
            </p>
            <Link
              to="/apartments"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg font-medium transition-colors no-underline"
            >
              <PlusIcon className="w-5 h-5" />
              {t("createListing") || "Create Listing"}
            </Link>
          </div>
        ) : (
          /* Listings Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className={`themed-surface-alt rounded-xl overflow-hidden shadow-lg transition-all ${!listing.isPublished ? "opacity-70" : ""
                  }`}
              >
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={getImage(listing)}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${listing.isPublished
                      ? "bg-green-500/90 text-white"
                      : "bg-yellow-500/90 text-white"
                      }`}
                  >
                    {listing.isPublished ? (
                      <><CheckIcon className="w-3 h-3" /> {t("visible") || "Visible"}</>
                    ) : (
                      <><EyeSlashIcon className="w-3 h-3" /> {t("hidden") || "Hidden"}</>
                    )}
                  </div>
                  {/* View Count */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 rounded-full text-xs text-white flex items-center gap-1">
                    <EyeIcon className="w-3 h-3" />
                    {listing.viewCount || 0}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--color-text)] mb-1 truncate">
                    {listing.title}
                  </h3>
                  <p className="text-lg font-bold text-[var(--color-accent)] mb-2">
                    {listing.pricePerMonth} {listing.currency || "NIS"}
                  </p>
                  <p className="text-sm text-[var(--color-text-soft)] mb-4">
                    {listing.bedrooms} {t("beds") || "beds"} •{" "}
                    {listing.bathrooms} {t("baths") || "baths"} •{" "}
                    {listing.squareFeet} m²
                  </p>

                  {/* Actions - Row 1 */}
                  <div className="flex items-center gap-1 pt-3 border-t themed-border">
                    {/* View */}
                    <Link
                      to={`/apartments/${listing.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium text-[var(--color-text-soft)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded-lg transition-colors no-underline"
                    >
                      <EyeIcon className="w-4 h-4" />
                      {t("view") || "View"}
                    </Link>

                    {/* Price History */}
                    <Link
                      to={`/apartments/${listing.id}/price-history`}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium text-[var(--color-text-soft)] hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors no-underline"
                    >
                      <ChartBarIcon className="w-4 h-4" />
                      {t("prices") || "Prices"}
                    </Link>

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(listing)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium text-[var(--color-text-soft)] hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      {t("edit") || "Edit"}
                    </button>
                  </div>

                  {/* Actions - Row 2 */}
                  <div className="flex items-center gap-1 pt-1">
                    {/* Toggle Visibility */}
                    <button
                      onClick={() => handleToggleVisibility(listing)}
                      disabled={actionLoading === listing.id}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium rounded-lg transition-colors ${listing.isPublished
                        ? "text-yellow-600 hover:bg-yellow-500/10"
                        : "text-green-600 hover:bg-green-500/10"
                        }`}
                    >
                      {actionLoading === listing.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : listing.isPublished ? (
                        <>
                          <EyeSlashIcon className="w-4 h-4" />
                          {t("hide") || "Hide"}
                        </>
                      ) : (
                        <>
                          <EyeIcon className="w-4 h-4" />
                          {t("show") || "Show"}
                        </>
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirm(listing)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      {t("delete") || "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="themed-surface rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                {t("confirmDelete") || "Confirm Delete"}
              </h3>
              <p className="text-[var(--color-text-soft)] mb-6">
                {t("deleteListingConfirm") ||
                  "Are you sure you want to delete this listing? This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium themed-surface-alt hover:bg-[var(--color-bg-alt)] transition-colors"
                >
                  {t("cancel") || "Cancel"}
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={actionLoading === deleteConfirm.id}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading === deleteConfirm.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      {t("delete") || "Delete"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setEditModal(null)}
          >
            <div
              className="w-full max-w-3xl max-h-[90vh] rounded-2xl themed-surface p-6 shadow-2xl border themed-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--color-text-soft)] mb-1">
                    {t("editListing")}
                  </p>
                  <h3 className="text-xl font-semibold text-[var(--color-text)]">
                    {editModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-[var(--color-text-soft)]" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2 text-sm flex items-center gap-2">
                  <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                  {editError}
                </div>
              )}

              <div className="overflow-y-auto max-h-[70vh] pr-2">
                <form className="space-y-6" onSubmit={handleEditSubmit}>
                  {/* Listing Basics */}
                  <div className="rounded-xl border themed-border bg-[var(--color-surface-alt)] p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">
                      {t("listingBasics")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("listingTitle")} *
                        </label>
                        <input
                          className="w-full input-field mt-1"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("Description")} *
                        </label>
                        <textarea
                          className="w-full input-field mt-1 min-h-[100px]"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("propertyType")}
                        </label>
                        <select
                          className="w-full input-field mt-1"
                          value={editForm.propertyType}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, propertyType: e.target.value }))
                          }
                        >
                          <option value="Apartment">{t("Apartment")}</option>
                          <option value="House">{t("House")}</option>
                          <option value="Room">{t("Room")}</option>
                          <option value="Studio">{t("Studio")}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Details */}
                  <div className="rounded-xl border themed-border bg-[var(--color-surface-alt)] p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">
                      {t("pricingDetails")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {t("monthlyPrice")} *
                        </label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            min="0"
                            className="w-full input-field"
                            value={editForm.pricePerMonth}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, pricePerMonth: e.target.value }))
                            }
                            required
                          />
                          <select
                            className="w-20 input-field"
                            value={editForm.currency}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, currency: e.target.value }))
                            }
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
                          value={editForm.bedrooms}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, bedrooms: e.target.value }))
                          }
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
                          value={editForm.bathrooms}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, bathrooms: e.target.value }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                        {t("propertyLocation") || "Property Location"}
                      </label>
                      <LocationPicker
                        latitude={editForm.latitude}
                        longitude={editForm.longitude}
                        universities={universities}
                        universityLatitude={universities.find(u => u.id === editForm.universityId)?.latitude}
                        universityLongitude={universities.find(u => u.id === editForm.universityId)?.longitude}
                        onLocationChange={(lat, lng, city) => {
                          setEditForm(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                          }));
                        }}
                        height="300px"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        {t("Size (m²)")} *
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full input-field mt-1"
                        value={editForm.squareFeet}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, squareFeet: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        {t("Lease duration")} *
                      </label>
                      <input
                        className="w-full input-field mt-1"
                        value={editForm.leaseDuration}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, leaseDuration: e.target.value }))
                        }
                        placeholder={t("e.g. 12 months")}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        {t("maxOccupants") || "Max Occupants"} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="w-full input-field mt-1"
                        value={editForm.maxOccupants}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, maxOccupants: e.target.value }))
                        }
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
                        value={editForm.listingDuration}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, listingDuration: e.target.value }))
                        }
                        required
                      >
                        <option value="1week">{t("1week") || "1 Week"}</option>
                        <option value="2weeks">{t("2weeks") || "2 Weeks"}</option>
                        <option value="1month">{t("1month") || "1 Month"}</option>
                        <option value="2months">{t("2months") || "2 Months"}</option>
                        <option value="3months">{t("3months") || "3 Months"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditModal(null)}
                      className="flex-1 px-4 py-3 rounded-xl font-medium border themed-border hover:bg-[var(--color-surface-alt)] transition-colors text-[var(--color-text)]"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 px-4 py-3 rounded-xl font-medium bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors flex items-center justify-center gap-2"
                    >
                      {editLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <PencilIcon className="w-4 h-4" />
                          {t("saveChanges")}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
