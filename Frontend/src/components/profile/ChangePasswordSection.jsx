import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { passwordChangeAPI } from "../../services/api";
import { KeyIcon } from "@heroicons/react/24/outline";

const ChangePasswordSection = () => {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1); // 1: send code, 2: enter code and new password
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSendCode = async () => {
        setLoading(true);
        setError("");
        try {
            await passwordChangeAPI.sendCode();
            setSuccess(t("verificationCodeSent") || "Verification code sent to your email");
            setStep(2);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Failed to send verification code");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError(t("passwordMustMatch") || "Passwords must match");
            return;
        }

        if (newPassword.length < 6) {
            setError(t("passwordTooShort") || "Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await passwordChangeAPI.changePassword(code, newPassword);
            setSuccess(t("passwordChangedSuccessfully") || "Password changed successfully");
            setTimeout(() => {
                setShowModal(false);
                resetForm();
            }, 2000);
        } catch (err) {
            setError(err.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setCode("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccess("");
    };

    const handleClose = () => {
        setShowModal(false);
        resetForm();
    };

    return (
        <>
            <div className="themed-surface-alt border themed-border rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent)]/70 text-white flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
                            <KeyIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
                                {t("changePassword")}
                            </h3>
                            <p className="text-sm text-[var(--color-text-soft)] mt-1">
                                {t("updateYourPassword")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/80 text-white shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all font-medium whitespace-nowrap"
                    >
                        {t("changePassword")}
                    </button>
                </div>
            </div>

            {/* Change Password Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                    onClick={handleClose}
                >
                    <div
                        className="w-full max-w-md rounded-2xl themed-surface p-6 shadow-2xl border themed-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                            {t("changePassword")}
                        </h3>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg border border-red-500/30 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg border border-green-500/30 text-sm">
                                {success}
                            </div>
                        )}

                        {step === 1 ? (
                            <div className="space-y-4">
                                <p className="text-sm text-[var(--color-text-soft)]">
                                    {t("clickToSendCode")}
                                </p>
                                <button
                                    onClick={handleSendCode}
                                    disabled={loading}
                                    className="w-full px-4 py-2 rounded-lg btn-primary disabled:opacity-60"
                                >
                                    {loading ? t("sending") : t("sendVerificationCode")}
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="w-full px-4 py-2 rounded-lg border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition"
                                >
                                    {t("cancel")}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                                        {t("verificationCode")} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full input-field"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="123456"
                                        required
                                        maxLength={6}
                                    />
                                    <p className="text-xs text-[var(--color-text-soft)] mt-1">
                                        {t("enterVerificationCode")}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                                        {t("newPassword")} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full input-field"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                                        {t("confirmNewPassword")} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full input-field"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 px-4 py-2 rounded-lg border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition"
                                    >
                                        {t("cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 rounded-lg btn-primary disabled:opacity-60"
                                    >
                                        {loading ? t("changing") : t("changePassword")}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ChangePasswordSection;
