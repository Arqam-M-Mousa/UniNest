import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const VerificationPrompt = ({ user, onDismiss }) => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (
            user &&
            user.role === "Landlord" &&
            !user.isIdentityVerified &&
            user.verificationStatus !== "pending"
        ) {
            const dismissed = localStorage.getItem("verificationPromptDismissed");
            if (!dismissed) {
                setShow(true);
            }
        }
    }, [user]);

    const handleVerifyNow = () => {
        setShow(false);
        navigate("/verification");
        if (onDismiss) onDismiss();
    };

    const handleRemindLater = () => {
        setShow(false);
        if (onDismiss) onDismiss();
    };

    const handleDontShowAgain = () => {
        localStorage.setItem("verificationPromptDismissed", "true");
        setShow(false);
        if (onDismiss) onDismiss();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <ShieldCheckIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)]">
                                Get Verified
                            </h3>
                            <p className="text-sm text-[var(--color-text-soft)]">
                                Build trust with students
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemindLater}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <XMarkIcon className="w-5 h-5 text-[var(--color-text-soft)]" />
                    </button>
                </div>

                {/* Content */}
                <p className="text-[var(--color-text-soft)] mb-6">
                    Verify your identity to get the blue verified badge on your property listings.
                    Verified landlords get 3x more student inquiries!
                </p>

                {/* Benefits */}
                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Increase trust and credibility</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Stand out in search results</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Get more inquiries</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleVerifyNow}
                        className="w-full px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition font-semibold flex items-center justify-center gap-2"
                    >
                        <ShieldCheckIcon className="w-5 h-5" />
                        Verify Now
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRemindLater}
                            className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] transition"
                        >
                            Remind Me Later
                        </button>
                        <button
                            onClick={handleDontShowAgain}
                            className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-soft)] hover:bg-[var(--color-bg-alt)] transition text-sm"
                        >
                            Don't Show Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPrompt;
