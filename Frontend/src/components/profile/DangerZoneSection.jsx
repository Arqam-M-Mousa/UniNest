import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { TrashIcon, ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DangerZoneSection = ({ onDelete }) => {
    const { t } = useLanguage();
    const [isDangerOpen, setIsDangerOpen] = useState(false);

    return (
        <div className="themed-surface-alt border-2 border-red-500/30 rounded-2xl overflow-hidden shadow-lg">
            <button
                type="button"
                onClick={() => setIsDangerOpen((prev) => !prev)}
                className="w-full px-6 py-5 flex items-center justify-between gap-3 bg-gradient-to-r from-red-500/10 to-red-600/10 text-left transition-all hover:from-red-500/15 hover:to-red-600/15"
                aria-expanded={isDangerOpen}
                aria-controls="danger-zone-panel"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                        <ExclamationTriangleIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-red-600 dark:text-red-400 font-bold mb-1">
                            {t("dangerZone") || "DANGER ZONE"}
                        </p>
                        <p className="text-base font-semibold text-[var(--color-text)]">
                            {t("deleteAccount") || "Delete account"}
                        </p>
                    </div>
                </div>
                <ChevronDownIcon
                    className={`w-5 h-5 text-[var(--color-text)]/60 transition-transform duration-300 ${isDangerOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isDangerOpen && (
                <div
                    id="danger-zone-panel"
                    className="px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-red-500/5 border-t-2 border-red-500/20 animate-fadeIn"
                >
                    <div className="space-y-3 flex-1">
                        <p className="text-sm font-medium text-[var(--color-text)]">
                            {t("deleteAccountWarning") ||
                                "Permanently deletes your account and all associated data. This action cannot be undone."}
                        </p>
                        <ul className="text-xs text-[var(--color-text)]/70 space-y-1.5 pl-1">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{t("deleteAccountBullet1")}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{t("deleteAccountBullet2")}</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={onDelete}
                        className="px-6 py-3 text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-semibold transition-all flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
                    >
                        <TrashIcon className="w-5 h-5" />
                        {t("delete") || "Delete"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DangerZoneSection;
