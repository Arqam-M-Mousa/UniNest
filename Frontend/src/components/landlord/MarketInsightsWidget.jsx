import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { marketAnalyticsAPI } from "../../services/api";
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    MapPinIcon,
    BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

const MarketInsightsWidget = ({ property }) => {
    const { t } = useLanguage();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (property) {
            fetchInsights();
        }
    }, [property]);

    const fetchInsights = async () => {
        try {
            setLoading(true);

            // Fetch city analytics
            const cityResponse = await marketAnalyticsAPI.getCityAnalytics(property.city);
            const cityData = cityResponse.data || {};

            // Find average for this property type
            const typeAvg = cityData.byPropertyType?.find(
                (item) => item.propertyType === property.propertyType
            );

            setInsights({
                cityAverage: typeAvg?.averagePrice || 0,
                totalListings: cityData.totalListings || 0,
                propertyType: property.propertyType,
                city: property.city,
            });
        } catch (err) {
            console.error("Failed to fetch market insights:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="themed-surface-alt rounded-xl p-6 border themed-border">
                <div className="flex items-center gap-2 mb-4">
                    <ChartBarIcon className="w-5 h-5 text-[var(--color-accent)]" />
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        {t("marketInsights")}
                    </h3>
                </div>
                <div className="text-center py-8 text-[var(--color-text-soft)]">
                    {t("loading")}...
                </div>
            </div>
        );
    }

    if (!insights || !insights.cityAverage) {
        return null;
    }

    const yourPrice = parseFloat(property.pricePerMonth);
    const marketAverage = parseFloat(insights.cityAverage);
    const priceDiff = yourPrice - marketAverage;
    const priceDiffPercent = ((priceDiff / marketAverage) * 100).toFixed(1);

    const getPriceStatus = () => {
        const diff = Math.abs(parseFloat(priceDiffPercent));
        if (diff < 5) return { label: t("competitive"), color: "text-green-500", bg: "bg-green-500/10" };
        if (priceDiff > 0) return { label: t("aboveMarket"), color: "text-orange-500", bg: "bg-orange-500/10" };
        return { label: t("belowMarket"), color: "text-blue-500", bg: "bg-blue-500/10" };
    };

    const status = getPriceStatus();

    return (
        <div className="themed-surface-alt rounded-xl p-6 border themed-border">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <ChartBarIcon className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {t("marketInsights")}
                </h3>
            </div>

            {/* Location Info */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-soft)]">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{insights.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-soft)]">
                    <BuildingLibraryIcon className="w-4 h-4" />
                    <span>{t(insights.propertyType) || insights.propertyType}</span>
                </div>
            </div>

            {/* Price Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg border themed-border">
                    <p className="text-xs text-[var(--color-text-soft)] mb-1">
                        {t("yourPrice")}
                    </p>
                    <p className="text-2xl font-bold text-[var(--color-text)]">
                        {yourPrice.toLocaleString()} <span className="text-sm font-normal">NIS</span>
                    </p>
                </div>

                <div className="p-4 rounded-lg border themed-border">
                    <p className="text-xs text-[var(--color-text-soft)] mb-1">
                        {t("marketAverage")}
                    </p>
                    <p className="text-2xl font-bold text-[var(--color-text)]">
                        {marketAverage.toLocaleString()} <span className="text-sm font-normal">NIS</span>
                    </p>
                </div>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center justify-between p-4 rounded-lg ${status.bg}`}>
                <div className="flex items-center gap-2">
                    {priceDiff > 0 ? (
                        <ArrowTrendingUpIcon className={`w-5 h-5 ${status.color}`} />
                    ) : priceDiff < 0 ? (
                        <ArrowTrendingDownIcon className={`w-5 h-5 ${status.color}`} />
                    ) : (
                        <ChartBarIcon className={`w-5 h-5 ${status.color}`} />
                    )}
                    <span className={`font-semibold ${status.color}`}>{status.label}</span>
                </div>
                <span className={`text-sm font-medium ${status.color}`}>
                    {priceDiff > 0 ? "+" : ""}{priceDiffPercent}%
                </span>
            </div>

            {/* Market Context */}
            <div className="mt-4 pt-4 border-t themed-border">
                <p className="text-xs text-[var(--color-text-soft)] text-center">
                    {t("byPropertyType")}: {insights.totalListings} {t("properties").toLowerCase()} {t("nearUniversity").toLowerCase()}
                </p>
            </div>
        </div>
    );
};

export default MarketInsightsWidget;
