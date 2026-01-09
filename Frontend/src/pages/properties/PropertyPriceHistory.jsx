import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { propertyListingsAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import PriceHistoryChart from "../../components/landlord/PriceHistoryChart";
import { ArrowLeftIcon, ChartBarIcon } from "@heroicons/react/24/outline";

const PropertyPriceHistory = () => {
    const { id } = useParams();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [property, setProperty] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch property details
                const propertyRes = await propertyListingsAPI.getById(id);
                setProperty(propertyRes.data);

                // Fetch price history
                const historyRes = await propertyListingsAPI.getPriceHistory(id);
                setPriceHistory(historyRes.data || []);
            } catch (err) {
                console.error("Failed to load price history:", err);
                setError(err.message || "Failed to load price history");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <PageLoader />;

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[var(--text-secondary)] mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[var(--accent-primary)] hover:underline"
                    >
                        {t("goBack")}
                    </button>
                </div>
            </div>
        );
    }

    // Check if user is owner
    const isOwner = user && property?.owner?.id === user.id;

    if (!isOwner && user?.role !== "SuperAdmin") {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[var(--text-secondary)] mb-4">{t("unauthorized")}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[var(--accent-primary)] hover:underline"
                    >
                        {t("goBack")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        {t("goBack")}
                    </button>

                    <div className="flex items-center gap-3">
                        <ChartBarIcon className="h-8 w-8 text-[var(--accent-primary)]" />
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                {t("priceHistory")}
                            </h1>
                            <p className="text-[var(--text-secondary)]">
                                {property?.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current Price */}
                <div className="bg-[var(--bg-secondary)] rounded-xl p-6 mb-8 border border-[var(--border-color)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-1">{t("currentPrice")}</p>
                    <p className="text-3xl font-bold text-[var(--accent-primary)]">
                        {property?.pricePerMonth?.toLocaleString()} {property?.currency || "NIS"}
                        <span className="text-sm font-normal text-[var(--text-secondary)]"> / {t("month")}</span>
                    </p>
                </div>

                {/* Price History Chart */}
                <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-color)]">
                    {priceHistory.length > 0 ? (
                        <PriceHistoryChart priceHistory={priceHistory} />
                    ) : (
                        <div className="text-center py-12">
                            <ChartBarIcon className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
                            <p className="text-[var(--text-secondary)]">{t("noPriceHistory")}</p>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                {priceHistory.length > 1 && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
                            <p className="text-sm text-[var(--text-secondary)]">{t("initialPrice")}</p>
                            <p className="text-xl font-semibold text-[var(--text-primary)]">
                                {priceHistory[0]?.price?.toLocaleString()} {property?.currency || "NIS"}
                            </p>
                        </div>
                        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
                            <p className="text-sm text-[var(--text-secondary)]">{t("priceChanges")}</p>
                            <p className="text-xl font-semibold text-[var(--text-primary)]">
                                {priceHistory.length - 1}
                            </p>
                        </div>
                        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
                            <p className="text-sm text-[var(--text-secondary)]">{t("totalChange")}</p>
                            {(() => {
                                const initial = priceHistory[0]?.price || 0;
                                const current = priceHistory[priceHistory.length - 1]?.price || 0;
                                const change = initial > 0 ? ((current - initial) / initial * 100).toFixed(1) : 0;
                                const isPositive = change > 0;
                                return (
                                    <p className={`text-xl font-semibold ${isPositive ? 'text-red-500' : 'text-green-500'}`}>
                                        {isPositive ? '+' : ''}{change}%
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyPriceHistory;
