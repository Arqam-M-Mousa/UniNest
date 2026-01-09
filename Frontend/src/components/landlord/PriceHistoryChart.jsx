import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "../../context/LanguageContext";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";

const PriceHistoryChart = ({ priceHistory = [] }) => {
    const { t, language } = useLanguage();

    if (!priceHistory || priceHistory.length === 0) {
        return (
            <div className="text-center py-8 text-[var(--color-text-soft)]">
                {t("noPriceHistory")}
            </div>
        );
    }

    // Sort by date and format data for chart
    const chartData = [...priceHistory]
        .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
        .map((item) => ({
            date: new Date(item.recordedAt).toLocaleDateString(
                language === "ar" ? "ar-EG" : "en-US",
                { month: "short", day: "numeric" }
            ),
            price: parseFloat(item.price),
            changeType: item.changeType,
            changePercentage: item.changePercentage,
        }));

    const currentPrice = chartData[chartData.length - 1]?.price || 0;
    const initialPrice = chartData[0]?.price || 0;
    const totalChange = currentPrice - initialPrice;
    const totalChangePercent = initialPrice > 0 ? ((totalChange / initialPrice) * 100).toFixed(1) : 0;

    return (
        <div className="themed-surface-alt rounded-xl p-6 border themed-border">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                        {t("priceHistory")}
                    </h3>
                    <p className="text-sm text-[var(--color-text-soft)]">
                        {t("currentPrice")}: <span className="font-bold text-[var(--color-accent)]">{currentPrice.toLocaleString()} NIS</span>
                    </p>
                </div>
                {totalChange !== 0 && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${totalChange > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        }`}>
                        {totalChange > 0 ? (
                            <ArrowTrendingUpIcon className="w-5 h-5" />
                        ) : (
                            <ArrowTrendingDownIcon className="w-5 h-5" />
                        )}
                        <span className="font-bold">{Math.abs(totalChangePercent)}%</span>
                    </div>
                )}
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                        dataKey="date"
                        stroke="var(--color-text-soft)"
                        style={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="var(--color-text-soft)"
                        style={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--color-surface-alt)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            padding: "12px",
                        }}
                        labelStyle={{ color: "var(--color-text)", fontWeight: "bold" }}
                        formatter={(value, name) => [
                            `${value.toLocaleString()} NIS`,
                            t("price"),
                        ]}
                    />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Price Changes List */}
            <div className="mt-6 space-y-3 max-h-48 overflow-y-auto">
                {chartData.slice().reverse().map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border themed-border hover:bg-[var(--color-surface)] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.changeType === "increase"
                                    ? "bg-green-500"
                                    : item.changeType === "decrease"
                                        ? "bg-red-500"
                                        : "bg-blue-500"
                                }`} />
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text)]">
                                    {item.price.toLocaleString()} NIS
                                </p>
                                <p className="text-xs text-[var(--color-text-soft)]">{item.date}</p>
                            </div>
                        </div>
                        {item.changePercentage && (
                            <span className={`text-sm font-medium ${item.changeType === "increase" ? "text-green-500" : "text-red-500"
                                }`}>
                                {item.changeType === "increase" ? "+" : ""}
                                {item.changePercentage.toFixed(1)}%
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PriceHistoryChart;
