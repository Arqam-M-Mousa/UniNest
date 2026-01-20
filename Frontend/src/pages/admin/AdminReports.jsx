import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { reportsAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";
import {
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const AdminReports = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reportDetails, setReportDetails] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    if (!user || (user.role !== "Admin" && user.role !== "SuperAdmin")) {
      navigate("/");
      return;
    }
    fetchReports();
  }, [filter, user, navigate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.list(filter);
      setReports(response?.data?.reports || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      showAlert("error", t("failedToLoadReports") || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
  };

  const handleViewDetails = async (report) => {
    try {
      const response = await reportsAPI.getById(report.id);
      setReportDetails(response?.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to fetch report details:", error);
      showAlert("error", t("failedToLoadReportDetails") || "Failed to load report details");
    }
  };

  const handleActionClick = (report, action) => {
    setSelectedReport(report);
    setActionType(action);
    setAdminNotes("");
    setWarningMessage("");
    setShowActionModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedReport) return;

    try {
      setProcessingAction(true);

      let status = "reviewed";
      let action = "none";

      switch (actionType) {
        case "dismiss":
          status = "dismissed";
          action = "none";
          break;
        case "warning":
          status = "resolved";
          action = "warning";
          break;
        case "suspend":
          status = "resolved";
          action = "suspended";
          break;
        case "ban":
          status = "resolved";
          action = "banned";
          break;
        default:
          status = "reviewed";
          action = "none";
      }

      await reportsAPI.update(selectedReport.id, {
        status,
        action,
        adminNotes: adminNotes || null,
        warningMessage: actionType === "warning" ? warningMessage : null,
      });

      showAlert(
        "success",
        t("reportActionSuccess") || "Report action completed successfully"
      );
      setShowActionModal(false);
      fetchReports();
    } catch (error) {
      console.error("Failed to process report:", error);
      showAlert("error", error.message || t("failedToProcessReport") || "Failed to process report");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleUnsuspendUser = async (userId) => {
    try {
      await reportsAPI.unsuspendUser(userId);
      showAlert("success", t("userUnsuspended") || "User messaging unsuspended successfully");
      fetchReports();
    } catch (error) {
      console.error("Failed to unsuspend user:", error);
      showAlert("error", error.message || t("failedToUnsuspendUser") || "Failed to unsuspend user");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      dismissed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };
    return styles[status] || "";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "dismissed":
        return <XCircleIcon className="w-4 h-4" />;
      case "reviewed":
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getReasonLabel = (reason) => {
    const reasonMap = {
      spam: t("reportReasonSpam") || "Spam",
      harassment: t("reportReasonHarassment") || "Harassment",
      inappropriate_content: t("reportReasonInappropriate") || "Inappropriate Content",
      scam: t("reportReasonScam") || "Scam or Fraud",
      hate_speech: t("reportReasonHateSpeech") || "Hate Speech",
      threats: t("reportReasonThreats") || "Threats",
      other: t("reportReasonOther") || "Other",
    };
    return reasonMap[reason] || reason;
  };

  const getActionBadge = (action) => {
    const styles = {
      none: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      suspended: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      banned: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    };
    return styles[action] || "";
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen themed-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3">
            <FlagIcon className="w-8 h-8 text-[var(--color-accent)]" />
            {t("reportsManagement") || "Reports Management"}
          </h1>
          <p className="mt-2 text-[var(--color-text-soft)]">
            {t("reportsManagementSubtitle") || "Review and manage user reports"}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[var(--color-border)]">
          {["pending", "reviewed", "resolved", "dismissed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                filter === status
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
              }`}
            >
              {t(`reportStatus${status.charAt(0).toUpperCase() + status.slice(1)}`) ||
                status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="text-center py-12 themed-surface-alt rounded-xl border border-[var(--color-border)]">
            <FlagIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-soft)] opacity-30" />
            <p className="text-[var(--color-text-soft)]">
              {t("noReportsFound") || `No ${filter} reports found`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="themed-surface-alt rounded-xl border border-[var(--color-border)] p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {getStatusIcon(report.status)}
                        {t(`reportStatus${report.status.charAt(0).toUpperCase() + report.status.slice(1)}`) ||
                          report.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {getReasonLabel(report.reason)}
                      </span>
                      {report.action && report.action !== "none" && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getActionBadge(
                            report.action
                          )}`}
                        >
                          {t(`reportAction${report.action.charAt(0).toUpperCase() + report.action.slice(1)}`) ||
                            report.action}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Reporter */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                          {report.reporter?.profilePictureUrl ? (
                            <img
                              src={report.reporter.profilePictureUrl}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-5 h-5 text-[var(--color-text-soft)]" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-soft)]">
                            {t("reportedBy") || "Reported by"}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-text)]">
                            {report.reporter?.firstName} {report.reporter?.lastName}
                          </p>
                        </div>
                      </div>

                      {/* Reported User */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          {report.reportedUser?.profilePictureUrl ? (
                            <img
                              src={report.reportedUser.profilePictureUrl}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-soft)]">
                            {t("reportedUser") || "Reported user"}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-text)]">
                            {report.reportedUser?.firstName} {report.reportedUser?.lastName}
                            <span className="ml-2 text-xs text-[var(--color-text-soft)]">
                              ({report.reportedUser?.role})
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {report.description && (
                      <div className="mb-3 p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <p className="text-xs font-semibold text-[var(--color-text-soft)] mb-1">
                          {t("reportDescription") || "Description"}:
                        </p>
                        <p className="text-sm text-[var(--color-text)]">{report.description}</p>
                      </div>
                    )}

                    {report.message?.content && (
                      <div className="mb-3 p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <p className="text-xs font-semibold text-[var(--color-text-soft)] mb-1 flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          {t("reportedMessage") || "Reported Message"}:
                        </p>
                        <p className="text-sm text-[var(--color-text)] italic">"{report.message.content}"</p>
                      </div>
                    )}

                    {report.adminNotes && (
                      <div className="mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          {t("adminNotes") || "Admin Notes"}:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{report.adminNotes}</p>
                      </div>
                    )}

                    <p className="text-xs text-[var(--color-text-muted)]">
                      {t("submittedOn") || "Submitted"}: {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(report)}
                      className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-all text-sm font-medium"
                    >
                      {t("viewDetails") || "View Details"}
                    </button>

                    {filter === "pending" && (
                      <>
                        <button
                          onClick={() => handleActionClick(report, "dismiss")}
                          className="px-3 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-all text-sm font-medium flex items-center gap-1"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          {t("dismiss") || "Dismiss"}
                        </button>
                        <button
                          onClick={() => handleActionClick(report, "warning")}
                          className="px-3 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-all text-sm font-medium flex items-center gap-1"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          {t("sendWarning") || "Warning"}
                        </button>
                        <button
                          onClick={() => handleActionClick(report, "suspend")}
                          className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all text-sm font-medium flex items-center gap-1"
                        >
                          <ClockIcon className="w-4 h-4" />
                          {t("suspendUser") || "Suspend"}
                        </button>
                        <button
                          onClick={() => handleActionClick(report, "ban")}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all text-sm font-medium flex items-center gap-1"
                        >
                          <NoSymbolIcon className="w-4 h-4" />
                          {t("banUser") || "Ban"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && reportDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl themed-surface p-6 shadow-2xl border themed-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">
                {t("reportDetails") || "Report Details"}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Report Info */}
            <div className="mb-6 p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
              <h4 className="font-medium text-[var(--color-text)] mb-3">
                {t("reportInfo") || "Report Information"}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--color-text-soft)]">{t("reason") || "Reason"}:</span>
                  <span className="ml-2 font-medium text-[var(--color-text)]">
                    {getReasonLabel(reportDetails.report?.reason)}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-text-soft)]">{t("status") || "Status"}:</span>
                  <span className="ml-2 font-medium text-[var(--color-text)]">
                    {reportDetails.report?.status}
                  </span>
                </div>
              </div>
              {reportDetails.report?.description && (
                <div className="mt-3">
                  <span className="text-[var(--color-text-soft)] text-sm">
                    {t("description") || "Description"}:
                  </span>
                  <p className="mt-1 text-[var(--color-text)]">{reportDetails.report.description}</p>
                </div>
              )}
            </div>

            {/* Conversation Messages */}
            {reportDetails.recentMessages && reportDetails.recentMessages.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  {t("conversationHistory") || "Conversation History"}
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2 p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                  {reportDetails.recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.senderId === reportDetails.report?.reportedUserId
                          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          : "bg-[var(--color-surface-alt)]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[var(--color-text)]">
                          {msg.sender?.firstName} {msg.sender?.lastName}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                        {msg.senderId === reportDetails.report?.reportedUserId && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            {t("reportedUser") || "Reported"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text)]">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 rounded-lg btn-primary"
              >
                {t("close") || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Alert
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={
          actionType === "dismiss"
            ? t("dismissReport") || "Dismiss Report"
            : actionType === "warning"
            ? t("sendWarningTitle") || "Send Warning"
            : actionType === "suspend"
            ? t("suspendUserTitle") || "Suspend User"
            : t("banUserTitle") || "Ban User"
        }
        message={
          <div className="space-y-4">
            <p>
              {actionType === "dismiss"
                ? t("confirmDismissReport") || "Are you sure you want to dismiss this report?"
                : actionType === "warning"
                ? t("confirmSendWarning") || "Send a warning to"
                : actionType === "suspend"
                ? t("confirmSuspendUser") || "Suspend messaging for"
                : t("confirmBanUser") || "Ban user"}{" "}
              {actionType !== "dismiss" && (
                <strong>
                  {selectedReport?.reportedUser?.firstName} {selectedReport?.reportedUser?.lastName}
                </strong>
              )}
              ?
            </p>

            {actionType === "warning" && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {t("warningMessage") || "Warning Message"}:
                </label>
                <textarea
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  rows="3"
                  placeholder={t("warningMessagePlaceholder") || "Enter warning message to send to user..."}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t("adminNotes") || "Admin Notes"} ({t("optional") || "Optional"}):
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                rows="2"
                placeholder={t("adminNotesPlaceholder") || "Add internal notes about this decision..."}
              />
            </div>
          </div>
        }
        confirmText={
          processingAction
            ? t("processing") || "Processing..."
            : actionType === "dismiss"
            ? t("dismiss") || "Dismiss"
            : actionType === "warning"
            ? t("sendWarning") || "Send Warning"
            : actionType === "suspend"
            ? t("suspendUser") || "Suspend"
            : t("banUser") || "Ban"
        }
        cancelText={t("cancel") || "Cancel"}
        onConfirm={handleConfirmAction}
        type={actionType === "dismiss" ? "info" : actionType === "warning" ? "warning" : "danger"}
        confirmDisabled={processingAction || (actionType === "warning" && !warningMessage)}
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

export default AdminReports;
