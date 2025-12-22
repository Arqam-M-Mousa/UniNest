function CompatibilityBadge({ score, size = "md" }) {
    if (score === null || score === undefined) {
        return null;
    }

    const getColor = () => {
        if (score >= 80) return "var(--color-success, #22c55e)";
        if (score >= 60) return "var(--color-warning, #eab308)";
        if (score >= 40) return "var(--color-orange, #f97316)";
        return "var(--color-error, #ef4444)";
    };

    const sizeClasses = {
        sm: "w-10 h-10 text-xs",
        md: "w-14 h-14 text-sm",
        lg: "w-20 h-20 text-lg",
    };

    const color = getColor();

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold border-3 transition-transform hover:scale-105`}
            style={{
                borderColor: color,
                color: color,
                backgroundColor: `${color}15`,
                borderWidth: "3px",
            }}
            title={`${score}% compatible`}
        >
            {score}%
        </div>
    );
}

export default CompatibilityBadge;

