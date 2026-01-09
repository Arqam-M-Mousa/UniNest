import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { marketplaceAPI } from "../../services/api";
import Reveal from "../common/Reveal";
import Alert from "../common/Alert";
import {
    TagIcon,
    UserIcon,
    EyeIcon,
    EyeSlashIcon,
    TrashIcon,
    PencilIcon,
} from "@heroicons/react/24/outline";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80";

const MarketplaceItemCard = ({ item, delay = 0, className = "", showManageOptions = false, onUpdate, onEdit }) => {
    const { t } = useLanguage();
    const [isActive, setIsActive] = useState(item.isActive !== false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getImage = () => {
        if (item.images && item.images.length > 0) {
            if (typeof item.images[0] === "object" && item.images[0].url) {
                return item.images[0].url;
            }
            return item.images[0];
        }
        return DEFAULT_IMAGE;
    };

    const getPrice = () => {
        return `${item.price} ${item.currency || "NIS"}`;
    };

    const getConditionLabel = () => {
        const conditionMap = {
            new: t("conditionNew"),
            like_new: t("conditionLikeNew"),
            good: t("conditionGood"),
            fair: t("conditionFair"),
        };
        return conditionMap[item.condition] || item.condition;
    };

    const getConditionColor = () => {
        const colorMap = {
            new: "bg-green-500",
            like_new: "bg-blue-500",
            good: "bg-yellow-500",
            fair: "bg-orange-500",
        };
        return colorMap[item.condition] || "bg-gray-500";
    };

    const getCategoryLabel = () => {
        const categoryMap = {
            furniture: t("categoryFurniture"),
            electronics: t("categoryElectronics"),
            books: t("categoryBooks"),
            clothing: t("categoryClothing"),
            kitchenware: t("categoryKitchenware"),
            sports: t("categorySports"),
            other: t("categoryOther"),
        };
        return categoryMap[item.category] || item.category;
    };

    const handleToggleVisibility = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await marketplaceAPI.toggleVisibility(item.id);
            setIsActive(response.data.isActive);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Failed to toggle visibility:", err);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await marketplaceAPI.delete(item.id);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Failed to delete item:", err);
        } finally {
            setIsDeleting(false);
            setShowDeleteAlert(false);
        }
    };

    return (
        <Reveal delay={delay} className={`w-full ${className}`}>
            <div className="market-card themed-surface-alt rounded-xl overflow-hidden shadow-card ring-0 hover:ring-2 hover:ring-[var(--color-accent)] transition-shadow">
                <Link
                    to={`/marketplace/${item.id}`}
                    className="no-underline text-inherit block"
                >
                    {/* Item Image */}
                    <div className="market-card-img-wrapper relative pt-[75%] bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)]">
                        <img
                            src={getImage()}
                            alt={item.title}
                            className={`absolute top-0 left-0 w-full h-full object-cover ${!isActive ? 'opacity-50' : ''}`}
                            loading="lazy"
                            onError={(e) => {
                                e.target.src = DEFAULT_IMAGE;
                            }}
                        />
                        <span className="market-card-gradient" aria-hidden="true" />

                        {/* Condition Badge */}
                        <span className={`absolute top-4 left-4 ${getConditionColor()} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                            {getConditionLabel()}
                        </span>

                        {/* Category Badge */}
                        <span className="absolute top-4 right-4 bg-[var(--color-surface-alt)]/90 text-[var(--color-text)] text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <TagIcon className="w-3 h-3" />
                            {getCategoryLabel()}
                        </span>

                        {/* Hidden Badge */}
                        {showManageOptions && !isActive && (
                            <span className="absolute bottom-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                {t("hidden")}
                            </span>
                        )}
                    </div>

                    {/* Item Details */}
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1 truncate">
                            {item.title}
                        </h3>
                        <p className="text-xl font-bold text-[var(--color-accent)] mb-2">
                            {getPrice()}
                        </p>
                        <p className="text-[var(--color-text-soft)] text-sm line-clamp-2 mb-2">
                            {item.description}
                        </p>
                        {item.owner && !showManageOptions && (
                            <p className="text-[var(--color-text-soft)] text-xs flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                {item.owner.firstName} {item.owner.lastName}
                            </p>
                        )}
                    </div>
                </Link>

                {/* Manage Options */}
                {showManageOptions && (
                    <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onEdit) onEdit();
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors"
                        >
                            <PencilIcon className="w-4 h-4" />
                            {t("edit")}
                        </button>
                        <button
                            onClick={handleToggleVisibility}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20'
                                : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                                }`}
                        >
                            {isActive ? (
                                <>
                                    <EyeSlashIcon className="w-4 h-4" />
                                    {t("hide")}
                                </>
                            ) : (
                                <>
                                    <EyeIcon className="w-4 h-4" />
                                    {t("show")}
                                </>
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowDeleteAlert(true);
                            }}
                            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            {t("delete")}
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Alert */}
            <Alert
                isOpen={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                title={t("confirmDelete")}
                message={t("deleteItemConfirm") || "Are you sure you want to delete this item? This action cannot be undone."}
                type="warning"
                confirmText={isDeleting ? t("loading") : t("delete")}
                cancelText={t("cancel")}
                onConfirm={handleDelete}
            />
        </Reveal>
    );
};

export default MarketplaceItemCard;
