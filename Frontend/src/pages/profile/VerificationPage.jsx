import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verificationAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";
import VerifiedBadge from "../../components/common/VerifiedBadge";
import { CheckCircleIcon, XCircleIcon, ClockIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";

const VerificationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState(null);
    const [formData, setFormData] = useState({
        documentType: "id_card",
        documentUrl: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const data = await verificationAPI.getStatus();
            setStatusData(data);
        } catch (err) {
            console.error("Failed to fetch verification status:", err);
            // Keep loading false to show content (or error state)
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.documentUrl) {
            setError("Please provide a link to your identity document.");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await verificationAPI.submit(formData);
            setSuccess(true);
            fetchStatus(); // Refresh status
        } catch (err) {
            setError(err.message || "Failed to submit verification request");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    const currentStatus = statusData?.verificationStatus || "none";
    const isIdentityVerified = statusData?.isIdentityVerified;

    return (
        <div className="min-h-screen themed-surface py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center justify-center gap-3">
                        Identity Verification
                        {isIdentityVerified && <VerifiedBadge size="lg" />}
                    </h1>
                    <p className="mt-2 text-[var(--color-text-soft)]">
                        Verify your identity to get the Verified Badge and build trust with students.
                    </p>
                </div>

                {/* Status Status Display */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    {isIdentityVerified ? (
                        <div className="text-center space-y-4">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Verified!</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Your identity has been verified. The verified badge now appears on your profile and listings.
                            </p>
                            <Link to="/profile" className="btn-primary inline-block mt-4">
                                Back to Profile
                            </Link>
                        </div>
                    ) : currentStatus === "pending" ? (
                        <div className="text-center space-y-4">
                            <ClockIcon className="w-16 h-16 text-yellow-500 mx-auto" />
                            <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Verification Pending</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                we have received your documents and are reviewing them. This usually takes 1-2 business days.
                            </p>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-left mt-4 text-sm">
                                <strong>Submitted:</strong> {new Date(statusData?.latestRequest?.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {currentStatus === "rejected" && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-start gap-3">
                                    <XCircleIcon className="w-6 h-6 flex-shrink-0" />
                                    <div>
                                        <strong className="block font-semibold">Verification Rejected</strong>
                                        <p className="text-sm">
                                            Your previous request was rejected. Please review the requirements and try again.
                                        </p>
                                        {statusData?.latestRequest?.reviewNotes && (
                                            <p className="text-sm mt-1 italic"> Reason: "{statusData.latestRequest.reviewNotes}"</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">Submit Documents</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-soft)] mb-1">
                                            Document Type
                                        </label>
                                        <select
                                            name="documentType"
                                            value={formData.documentType}
                                            onChange={handleInputChange}
                                            className="form-input w-full rounded-lg bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
                                        >
                                            <option value="id_card">National ID Card</option>
                                            <option value="passport">Passport</option>
                                            <option value="drivers_license">Driver's License</option>
                                            <option value="business_license">Business License</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-soft)] mb-1">
                                            Document URL (for Image or PDF)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                name="documentUrl"
                                                value={formData.documentUrl}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com/my-id.jpg"
                                                className="form-input flex-1 rounded-lg bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
                                            />
                                            {/* Placeholder for future file upload integration */}
                                            {/* <button type="button" className="p-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-alt)]">
                             <DocumentArrowUpIcon className="w-6 h-6 text-[var(--color-text-soft)]"/>
                         </button> */}
                                        </div>
                                        <p className="text-xs text-[var(--color-text-soft)] mt-1">
                                            *Please provide a direct link to your document.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        {submitting ? "Submitting..." : "Submit for Verification"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Alert
                isOpen={success}
                onClose={() => setSuccess(false)}
                title="Submission Successful"
                message="Your verification request has been submitted successfully."
                confirmText="OK"
                onConfirm={() => setSuccess(false)}
                type="success"
            />

            <Alert
                isOpen={!!error}
                onClose={() => setError(null)}
                title="Submission Error"
                message={error}
                type="error"
                confirmText="Close"
            />

        </div>
    );
};

export default VerificationPage;
