import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { marketplaceAPI, conversationsAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";
import {
    ArrowLeftIcon,
    TagIcon,
    EnvelopeIcon,
    PhoneIcon,
    ChatBubbleLeftIcon,
    UserIcon,
    EyeIcon,
    CalendarIcon,
} from "@heroicons/react/24/outline";

const MarketplaceItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const isRTL = language === "ar";

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [messageSending, setMessageSending] = useState(false);

    // Check if landlord
    const isLandlord = user?.role?.toLowerCase() === "landlord";

    const fetchItem = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await marketplaceAPI.getById(id);
            setItem(response?.data);
        } catch (err) {
            console.error("Failed to fetch item:", err);
            setError(err.message || t("failedToLoadItem"));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        fetchItem();
    }, [fetchItem]);

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

    const getConditionColor = (cond) => {
        const colorMap = {
            new: "bg-green-500",
            like_new: "bg-blue-500",
            good: "bg-yellow-500",
            fair: "bg-orange-500",
        };
        return colorMap[cond] || "bg-gray-500";
    };

    const handleMessageSeller = async () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (!item?.owner?.id) return;

        setMessageSending(true);
        try {
            const response = await conversationsAPI.startDirect(item.owner.id);
            if (response?.data?.id) {
                navigate(`/messages/${response.data.id}`);
            }
        } catch (err) {
            console.error("Failed to start conversation:", err);
        } finally {
            setMessageSending(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Show restricted message for landlords
    if (isAuthenticated && isLandlord) {
        return (
            <PageLoader loading={false}>
                <div className="py-16 px-8 text-center min-h-[50vh] themed-surface">
                    <div className="max-w-md mx-auto">
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

    if (loading) {
        return (
            <PageLoader loading={true} message={t("loading")}>
                <div className="min-h-screen" />
            </PageLoader>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen themed-surface py-16 px-8 text-center">
                <TagIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-soft)]" />
                <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                    {t("itemNotFound")}
                </h1>
                <p className="text-[var(--color-text-soft)] mb-6">{error}</p>
                <Link to="/marketplace" className="btn-primary px-6 py-3 rounded-lg inline-block">
                    {t("backToMarketplace")}
                </Link>
            </div>
        );
    }

    const images = item.images || [];
    const currentImage = images[selectedImage]?.url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80";

    return (
        <div className="min-h-screen themed-surface">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                <Link
                    to="/marketplace"
                    className="inline-flex items-center gap-2 text-[var(--color-text-soft)] hover:text-[var(--color-accent)] transition-colors"
                >
                    <ArrowLeftIcon className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
                    {t("backToMarketplace")}
                </Link>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Images */}
                    <div>
                        <div className="relative rounded-xl overflow-hidden bg-[var(--color-bg-alt)] aspect-square">
                            <img
                                src={currentImage}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Condition Badge */}
                            <span className={`absolute top-4 left-4 ${getConditionColor(item.condition)} text-white text-sm px-3 py-1 rounded-full font-medium`}>
                                {getConditionLabel(item.condition)}
                            </span>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === idx
                                                ? "border-[var(--color-accent)]"
                                                : "border-transparent hover:border-[var(--color-border)]"
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        {/* Category */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                <TagIcon className="w-4 h-4" />
                                {getCategoryLabel(item.category)}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-4">
                            {item.title}
                        </h1>

                        {/* Price */}
                        <p className="text-4xl font-bold text-[var(--color-accent)] mb-6">
                            {item.price} {item.currency || "NIS"}
                        </p>

                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                                {t("description")}
                            </h2>
                            <p className="text-[var(--color-text-soft)] whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 mb-6 text-sm text-[var(--color-text-soft)]">
                            <span className="flex items-center gap-1">
                                <EyeIcon className="w-4 h-4" />
                                {item.viewCount} {t("views")}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDate(item.createdAt)}
                            </span>
                        </div>

                        {/* Seller Info */}
                        {item.owner && (
                            <div className="themed-surface-alt rounded-xl p-4 mb-6">
                                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                                    {t("sellerInfo")}
                                </h2>
                                <div className="flex items-center gap-3 mb-4">
                                    {item.owner.avatarUrl ? (
                                        <img
                                            src={item.owner.avatarUrl}
                                            alt={item.owner.firstName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                                            <UserIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-[var(--color-text)]">
                                            {item.owner.firstName} {item.owner.lastName}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4">
                                    {item.contactPhone && (
                                        <a
                                            href={`tel:${item.contactPhone}`}
                                            className="flex items-center gap-2 text-[var(--color-text-soft)] hover:text-[var(--color-accent)]"
                                        >
                                            <PhoneIcon className="w-4 h-4" />
                                            {item.contactPhone}
                                        </a>
                                    )}
                                    {item.contactEmail && (
                                        <a
                                            href={`mailto:${item.contactEmail}`}
                                            className="flex items-center gap-2 text-[var(--color-text-soft)] hover:text-[var(--color-accent)]"
                                        >
                                            <EnvelopeIcon className="w-4 h-4" />
                                            {item.contactEmail}
                                        </a>
                                    )}
                                </div>

                                {/* Message Button */}
                                {item.owner.id !== user?.id && (
                                    <button
                                        onClick={handleMessageSeller}
                                        disabled={messageSending}
                                        className="w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <ChatBubbleLeftIcon className="w-5 h-5" />
                                        {messageSending ? t("loading") : t("messageNow")}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
                <Alert
                    title={t("signInRequired")}
                    message={t("pleaseSignInToMessage")}
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
        </div>
    );
};

export default MarketplaceItemDetails;
