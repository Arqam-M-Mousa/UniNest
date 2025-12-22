import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { verificationAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const AdminVerification = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("pending");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewNotes, setReviewNotes] = useState("");
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [processingAction, setProcessingAction] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: "", message: "" });

    useEffect(() => {
        // Check if user is admin
        if (!user || (user.role !== "Admin" && user.role !== "SuperAdmin")) {
            navigate("/");
            return;
        }
        fetchRequests();
    }, [filter, user, navigate]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await verificationAPI.listRequests(filter);
            console.log("Admin: Fetched verification requests:", data);
            console.log("Number of requests:", data ? data.length : 0);
            setRequests(data || []);
        } catch (error) {
            console.error("Failed to fetch verification requests:", error);
            showAlert("error", t("failedToLoadVerificationRequests") || "Failed to load verification requests");
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
    };

    const handleActionClick = (request, action) => {
        setSelectedRequest(request);
        setActionType(action);
        setReviewNotes("");
        setShowActionModal(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedRequest) return;

        try {
            setProcessingAction(true);
            await verificationAPI.reviewRequest(
                selectedRequest.id,
                actionType,
                reviewNotes || ""
            );
            showAlert(
                "success",
                actionType === "approved"
                    ? t("verificationApprovedSuccess") || "Verification request approved successfully"
                    : t("verificationRejectedSuccess") || "Verification request rejected"
            );
            setShowActionModal(false);
            fetchRequests();
        } catch (error) {
            console.error("Failed to review request:", error);
            showAlert("error", error.message || t("failedToReviewRequest") || "Failed to process request");
        } finally {
            setProcessingAction(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
            approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        };
        return styles[status] || "";
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "approved":
                return <CheckCircleIcon className="w-5 h-5" />;
            case "rejected":
                return <XCircleIcon className="w-5 h-5" />;
            default:
                return <ClockIcon className="w-5 h-5" />;
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen themed-surface py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">
                        {t("adminVerificationManagement") || "Identity Verification Management"}
                    </h1>
                    <p className="mt-2 text-[var(--color-text-soft)]">
                        {t("adminVerificationSubtitle") || "Review and manage landlord identity verification requests"}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 border-b border-[var(--color-border)]">
                    {["pending", "approved", "rejected"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === status
                                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                                : "border-transparent text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
                                }`}
                        >
                            {t(`filter${status.charAt(0).toUpperCase() + status.slice(1)}`) || status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Requests List */}
                {requests.length === 0 ? (
                    <div className="text-center py-12 themed-surface-alt rounded-xl border border-[var(--color-border)]">
                        <p className="text-[var(--color-text-soft)]">
                            {t("noVerificationRequestsFound")?.replace("{status}", filter) || `No ${filter} verification requests found`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="themed-surface-alt rounded-xl border border-[var(--color-border)] p-6 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-[var(--color-text)]">
                                                {request.user?.firstName} {request.user?.lastName}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-soft)] mb-2">
                                            {t("email") || "Email"}: {request.user?.email}
                                        </p>
                                        <p className="text-sm text-[var(--color-text-soft)] mb-2">
                                            {t("documentTypeLabel") || "Document Type"}: <span className="font-medium">{request.documentType.replace("_", " ")}</span>
                                        </p>
                                        <p className="text-sm text-[var(--color-text-soft)] mb-3">
                                            {t("submittedOn") || "Submitted"}: {new Date(request.createdAt).toLocaleDateString()}
                                        </p>

                                        {request.documentUrl && (
                                            <a
                                                href={request.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] hover:border-[var(--color-accent)] transition-all text-sm font-medium"
                                            >
                                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                                {t("viewDocument") || "View Document"}
                                            </a>
                                        )}

                                        {request.reviewNotes && (
                                            <div className="mt-3 p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                                                <p className="text-xs font-semibold text-[var(--color-text-soft)] mb-1">{t("reviewNotesLabel") || "Review Notes"}:</p>
                                                <p className="text-sm text-[var(--color-text)]">{request.reviewNotes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {filter === "pending" && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleActionClick(request, "approved")}
                                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
                                            >
                                                <CheckCircleIcon className="w-5 h-5" />
                                                {t("approve") || "Approve"}
                                            </button>
                                            <button
                                                onClick={() => handleActionClick(request, "rejected")}
                                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
                                            >
                                                <XCircleIcon className="w-5 h-5" />
                                                {t("reject") || "Reject"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Modal */}
            <Alert
                isOpen={showActionModal}
                onClose={() => setShowActionModal(false)}
                title={actionType === "approved" ? t("approveVerification") || "Approve Verification Request" : t("rejectVerification") || "Reject Verification Request"}
                message={
                    <div className="space-y-4">
                        <p>
                            {actionType === "approved" ? t("confirmApproveMessage") || "Are you sure you want to approve the verification request from" : t("confirmRejectMessage") || "Are you sure you want to reject the verification request from"}{" "}
                            <strong>{selectedRequest?.user?.firstName} {selectedRequest?.user?.lastName}</strong>?
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                {t("reviewNotesOptional") || "Review Notes (Optional)"}:
                            </label>
                            <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                rows="3"
                                placeholder={t("reviewNotesPlaceholder") || "Add notes about this decision..."}
                            />
                        </div>
                    </div>
                }
                confirmText={processingAction ? t("processing") || "Processing..." : actionType === "approved" ? t("approve") || "Approve" : t("reject") || "Reject"}
                cancelText={t("cancel") || "Cancel"}
                onConfirm={handleConfirmAction}
                type={actionType === "approved" ? "success" : "warning"}
                confirmDisabled={processingAction}
            />

            {/* Alert Notification */}
            <Alert
                isOpen={alert.show}
                onClose={() => setAlert({ ...alert, show: false })}
                title={alert.type === "success" ? t("success") || "Success" : t("error") || "Error"}
                message={alert.message}
                type={alert.type}
                confirmText={t("ok") || "OK"}
            />
        </div>
    );
};

export default AdminVerification;
