import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verificationAPI, uploadsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";
import VerifiedBadge from "../../components/common/VerifiedBadge";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DocumentArrowUpIcon,
    PhotoIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

const VerificationPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState(null);
    const [formData, setFormData] = useState({
        documentType: "id_card",
        documentUrl: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
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
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            setError("File size must be less than 15MB");
            return;
        }

        setSelectedFile(file);
        setError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData((prev) => ({ ...prev, documentUrl: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile && !formData.documentUrl) {
            setError("Please select your identity document first");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            let documentUrl = formData.documentUrl;

            if (selectedFile) {
                setUploading(true);

                try {
                    const uploadResult = await uploadsAPI.uploadVerificationDocument(selectedFile);
                    documentUrl = uploadResult.data.url;

                    setFormData((prev) => ({ ...prev, documentUrl }));
                } catch (uploadErr) {
                    console.error("Failed to upload verification document:", uploadErr);
                    setError(uploadErr.message || "Failed to upload document to cloud");
                    return;
                } finally {
                    setUploading(false);
                }
            }

            const submissionData = {
                documentType: formData.documentType,
                documentUrl: documentUrl,
            };

            await verificationAPI.submit(submissionData);

            setSuccess(true);
            fetchStatus();
        } catch (err) {
            console.error("Failed to submit verification request:", err);
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
        <div className="min-h-screen themed-surface py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center justify-center gap-3">
                        {t("identityVerification") || "Identity Verification"}
                        {isIdentityVerified && <VerifiedBadge size="lg" />}
                    </h1>
                    <p className="mt-2 text-[var(--color-text-soft)]">
                        {t("verifyIdentityDescription") || "Verify your identity to get the Verified Badge and build trust with students"}
                    </p>
                </div>

                {/* Status Card */}
                <div className="themed-surface-alt rounded-xl shadow-lg border border-[var(--color-border)] p-6">
                    {isIdentityVerified ? (
                        <div className="text-center space-y-4">
                            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
                            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {t("verified") || "Verified!"}
                            </h2>
                            <p className="text-[var(--color-text-soft)]">
                                {t("verifiedDescription") || "Your identity has been verified. The verified badge now appears on your profile and listings."}
                            </p>
                            <Link
                                to="/profile"
                                className="inline-block px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition"
                            >
                                {t("backToProfile") || "Back to Profile"}
                            </Link>
                        </div>
                    ) : currentStatus === "pending" ? (
                        <div className="text-center space-y-4">
                            <ClockIcon className="w-20 h-20 text-yellow-500 mx-auto" />
                            <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {t("verificationPending") || "Verification Pending"}
                            </h2>
                            <p className="text-[var(--color-text-soft)]">
                                {t("verificationPendingDescription") || "We have received your documents and are reviewing them. This usually takes 1-2 business days."}
                            </p>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-left">
                                <p className="text-sm text-[var(--color-text-soft)]">
                                    <strong>{t("submitted") || "Submitted"}:</strong>{" "}
                                    {new Date(statusData?.latestRequest?.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {currentStatus === "rejected" && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-start gap-3">
                                    <XCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block font-semibold">
                                            {t("verificationRejected") || "Verification Rejected"}
                                        </strong>
                                        <p className="text-sm mt-1">
                                            {t("verificationRejectedDescription") || "Your previous request was rejected. Please review the requirements and try again."}
                                        </p>
                                        {statusData?.latestRequest?.reviewNotes && (
                                            <p className="text-sm mt-2 italic">
                                                {t("reason") || "Reason"}: "{statusData.latestRequest.reviewNotes}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <div>
                                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                                    {t("submitDocuments") || "Submit Documents"}
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Document Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                            {t("documentType") || "Document Type"}
                                        </label>
                                        <select
                                            name="documentType"
                                            value={formData.documentType}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    documentType: e.target.value,
                                                }))
                                            }
                                            className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                        >
                                            <option value="id_card">{t("nationalIdCard") || "National ID Card"}</option>
                                            <option value="passport">{t("passport") || "Passport"}</option>
                                            <option value="drivers_license">{t("driversLicense") || "Driver's License"}</option>
                                            <option value="business_license">{t("businessLicense") || "Business License"}</option>
                                        </select>
                                    </div>

                                    {/* File Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                            {t("uploadDocument") || "Upload Document"}
                                        </label>

                                        {!previewUrl ? (
                                            <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center hover:border-[var(--color-accent)] transition-colors">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                    id="document-upload"
                                                />
                                                <label
                                                    htmlFor="document-upload"
                                                    className="cursor-pointer flex flex-col items-center gap-3"
                                                >
                                                    <PhotoIcon className="w-16 h-16 text-[var(--color-text-soft)]" />
                                                    <div>
                                                        <p className="text-[var(--color-text)] font-medium">
                                                            {t("clickToUpload") || "Click to upload"} or drag and drop
                                                        </p>
                                                        <p className="text-sm text-[var(--color-text-soft)] mt-1">
                                                            PNG, JPG, JPEG up to 15MB
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition inline-flex items-center gap-2"
                                                    >
                                                        <DocumentArrowUpIcon className="w-5 h-5" />
                                                        {t("selectFile") || "Select File"}
                                                    </button>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="relative rounded-lg overflow-hidden border-2 border-[var(--color-border)]">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Document preview"
                                                        className="w-full h-64 object-contain bg-[var(--color-bg)]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Upload Progress */}
                                                {uploading && (
                                                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
                                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-sm font-medium">
                                                            {t("uploading") || "Uploading to cloud..."}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Upload Success */}
                                                {formData.documentUrl && !uploading && (
                                                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                        <span className="text-sm font-medium">
                                                            {t("documentUploaded") || "Document uploaded successfully"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-start gap-3">
                                            <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">{error}</p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={submitting || (!formData.documentUrl && !selectedFile)}
                                        className="w-full px-6 py-4 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-semibold text-lg"
                                    >
                                        {submitting
                                            ? t("submitting") || "Submitting..."
                                            : currentStatus === "rejected"
                                                ? t("resubmitVerification") || "Resubmit for Verification"
                                                : t("submitForVerification") || "Submit for Verification"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Alert */}
            <Alert
                isOpen={success && !submitting}
                onClose={() => setSuccess(false)}
                title={t("success") || "Success"}
                message={t("verificationSubmitted") || "Your verification request has been submitted successfully"}
                confirmText="OK"
                onConfirm={() => setSuccess(false)}
                type="success"
            />
        </div>
    );
};

export default VerificationPage;
