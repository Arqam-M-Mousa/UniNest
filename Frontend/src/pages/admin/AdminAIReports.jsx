import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { adminAPI, reportsAPI } from "../../services/api";
import Alert from "../../components/common/Alert";
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const AdminAIReports = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [processingRecommendation, setProcessingRecommendation] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: "", title: "", message: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", data: null });

  const analyzeReports = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    if (forceRefresh) setAnalysis(null);

    try {
      // First check if there are any reports for the selected status
      const reportsResponse = await reportsAPI.list(selectedStatus === "all" ? null : selectedStatus, 1, 0);
      const reportCount = reportsResponse.data?.length || 0;

      if (reportCount === 0) {
        setAlertModal({
          isOpen: true,
          type: "info",
          title: t("noReportsFound") || "No Reports Found",
          message: t("noReportsForStatus") || `No ${selectedStatus} reports found to analyze.`,
        });
        setLoading(false);
        return;
      }

      const response = await adminAPI.analyzeReportsWithAI(selectedStatus, 50, forceRefresh);
      setAnalysis(response.data);
      setIsCached(response.data?.cached || false);
    } catch (err) {
      console.error("Error analyzing reports:", err);
      setError(err.message || "Failed to analyze reports");
    } finally {
      setLoading(false);
    }
  };

  const showApplyConfirmation = (reportId, action, reasoning) => {
    setConfirmModal({
      isOpen: true,
      type: "apply",
      data: { reportId, action, reasoning },
    });
  };

  const showBulkConfirmation = (reportIds, action, reasoning) => {
    setConfirmModal({
      isOpen: true,
      type: "bulk",
      data: { reportIds, action, reasoning },
    });
  };

  const handleConfirmAction = async () => {
    const { type, data } = confirmModal;
    setConfirmModal({ isOpen: false, type: "", data: null });

    if (type === "apply") {
      await executeApplyRecommendation(data.reportId, data.action, data.reasoning);
    } else if (type === "bulk") {
      await executeBulkAction(data.reportIds, data.action, data.reasoning);
    }
  };

  const executeApplyRecommendation = async (reportId, action, reasoning) => {
    setProcessingRecommendation(reportId);

    try {
      await adminAPI.applyRecommendation(reportId, action, reasoning);

      setAnalysis((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          analysis: {
            ...prev.analysis,
            recommendations: prev.analysis.recommendations.map((rec) =>
              rec.reportId === reportId ? { ...rec, applied: true } : rec
            ),
          },
        };
      });

      setAlertModal({ isOpen: true, type: "success", title: t("success") || "Success", message: t("recommendationApplied") || "Recommendation applied successfully!" });
    } catch (err) {
      console.error("Error applying recommendation:", err);
      setAlertModal({ isOpen: true, type: "error", title: t("error") || "Error", message: err.message || "Failed to apply recommendation" });
    } finally {
      setProcessingRecommendation(null);
    }
  };

  const denyRecommendation = (reportId) => {
    setAnalysis((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        analysis: {
          ...prev.analysis,
          recommendations: prev.analysis.recommendations.map((rec) =>
            rec.reportId === reportId ? { ...rec, denied: true } : rec
          ),
        },
      };
    });
  };

  const executeBulkAction = async (reportIds, action, reasoning) => {
    setLoading(true);

    try {
      await adminAPI.applyBulkAction(reportIds, action, reasoning);
      setAlertModal({ isOpen: true, type: "success", title: t("success") || "Success", message: t("bulkActionApplied") || "Bulk action applied successfully!" });
      analyzeReports();
    } catch (err) {
      console.error("Error applying bulk action:", err);
      setAlertModal({ isOpen: true, type: "error", title: t("error") || "Error", message: err.message || "Failed to apply bulk action" });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "banned":
        return "!bg-rose-500/20 !text-rose-600 dark:!text-rose-400 border border-rose-500/30 hover:!bg-rose-500/30";
      case "suspended":
        return "!bg-orange-500/20 !text-orange-600 dark:!text-orange-400 border border-orange-500/30 hover:!bg-orange-500/30";
      case "warning":
        return "!bg-amber-500/20 !text-amber-600 dark:!text-amber-400 border border-amber-500/30 hover:!bg-amber-500/30";
      case "none":
        return "!bg-slate-500/20 !text-slate-600 dark:!text-slate-400 border border-slate-500/30 hover:!bg-slate-500/30";
      default:
        return "!bg-sky-500/20 !text-sky-600 dark:!text-sky-400 border border-sky-500/30 hover:!bg-sky-500/30";
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority >= 8) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Urgent</span>;
    } else if (priority >= 5) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Low</span>;
    }
  };

  return (
    <div className="min-h-screen themed-surface py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SparklesIcon className="w-10 h-10 text-[var(--color-accent)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              {t("aiReportAnalysisTitle") || "AI Report Analysis"}
            </h1>
          </div>
          <p className="text-[var(--color-text-soft)]">
            {t("aiReportAnalysisSubtitle") || "Let AI analyze reports and provide recommendations. You approve or deny each suggestion."}
          </p>
        </div>

        {/* Controls */}
        <div className="themed-surface-alt border themed-border rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t("reportStatus") || "Report Status"}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 input-field rounded-xl"
              >
                <option value="pending">{t("reportStatusPending") || "Pending Reports"}</option>
                <option value="all">{t("allReports") || "All Reports"}</option>
                <option value="reviewed">{t("reportStatusReviewed") || "Reviewed Reports"}</option>
                <option value="resolved">{t("reportStatusResolved") || "Resolved Reports"}</option>
              </select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => analyzeReports(false)}
                disabled={loading}
                className="flex-1 md:flex-none px-6 py-2.5 btn-primary rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>{t("analyzing") || "Analyzing..."}</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>{t("analyzeWithAI") || "Analyze"}</span>
                  </>
                )}
              </button>
              {analysis && isCached && (
                <button
                  onClick={() => analyzeReports(true)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border themed-border text-[var(--color-text)] hover:bg-[var(--color-surface)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Force refresh analysis"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-600 dark:text-red-400">{error}</span>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Cached indicator */}
            {isCached && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm text-amber-600 dark:text-amber-400">
                    {t("cachedResults") || "Showing cached results"} • {new Date(analysis.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => analyzeReports(true)}
                  disabled={loading}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
                >
                  {t("refreshNow") || "Refresh now"}
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="themed-surface-alt border themed-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                    {t("analysisSummary") || "Analysis Summary"}
                  </h2>
                  <p className="text-[var(--color-text-soft)] whitespace-pre-line">
                    {analysis.analysis?.summary || "Analysis complete. Review recommendations below."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <span className="px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium">
                      {analysis.totalReports} {t("reports") || "Reports"}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      {analysis.analysis?.recommendations?.length || 0} {t("recommendations") || "Recommendations"}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
                      {analysis.analysis?.patterns?.length || 0} {t("patterns") || "Patterns"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Patterns */}
            {analysis.analysis?.patterns && analysis.analysis.patterns.length > 0 && (
              <div className="themed-surface-alt border themed-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                  {t("detectedPatterns") || "Detected Patterns"}
                </h3>
                <div className="space-y-4">
                  {analysis.analysis.patterns.map((pattern, index) => (
                    <div key={index} className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-[var(--color-text)]">Pattern #{index + 1}</h4>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400">
                          {pattern.reportIds?.length || 0} {t("reports") || "Reports"}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-soft)] text-sm mb-3">{pattern.pattern}</p>
                      {pattern.suggestedBulkAction && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--color-text-soft)]">
                            {t("suggested") || "Suggested"}: <span className="font-medium text-violet-600 dark:text-violet-400">{pattern.suggestedBulkAction}</span>
                          </span>
                          <button
                            onClick={() => showBulkConfirmation(pattern.reportIds, pattern.suggestedBulkAction, pattern.pattern)}
                            className="px-4 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                          >
                            {t("applyToAll") || "Apply to All"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.analysis?.recommendations && analysis.analysis.recommendations.length > 0 && (
              <div className="themed-surface-alt border themed-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                  {t("aiRecommendations") || "AI Recommendations"}
                </h3>
                <div className="space-y-4">
                  {analysis.analysis.recommendations
                    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                    .map((rec) => (
                      <div
                        key={rec.reportId}
                        className={`p-5 rounded-xl border transition-all ${
                          rec.applied
                            ? "bg-green-500/10 border-green-500/30 opacity-70"
                            : rec.denied
                            ? "bg-[var(--color-surface)] border-[var(--color-border)] opacity-70"
                            : "themed-surface border-[var(--color-border)] hover:border-[var(--color-accent)]"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-xs text-[var(--color-text-soft)] font-mono">
                              {rec.reportId.slice(0, 8)}...
                            </span>
                            {rec.priority && (
                              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                                rec.priority >= 8 ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                                rec.priority >= 5 ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                                "bg-green-500/10 text-green-600 dark:text-green-400"
                              }`}>
                                {rec.priority >= 8 ? (t("urgent") || "Urgent") : rec.priority >= 5 ? (t("medium") || "Medium") : (t("low") || "Low")}
                              </span>
                            )}
                          </div>
                          {rec.applied && (
                            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                              <CheckCircleIcon className="w-4 h-4" />
                              {t("applied") || "Applied"}
                            </span>
                          )}
                          {rec.denied && (
                            <span className="flex items-center gap-1 text-sm text-[var(--color-text-soft)]">
                              <XCircleIcon className="w-4 h-4" />
                              {t("denied") || "Denied"}
                            </span>
                          )}
                        </div>

                        {rec.reportedUser && (
                          <div className="mb-3 p-3 rounded-lg bg-[var(--color-surface)]">
                            <span className="text-sm text-[var(--color-text-soft)]">{t("reportedUserLabel") || "Reported User"}: </span>
                            <span className="text-sm font-medium text-[var(--color-text)]">{rec.reportedUser.name}</span>
                            <span className="text-sm text-[var(--color-text-soft)]"> ({rec.reportedUser.email})</span>
                          </div>
                        )}

                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-[var(--color-text-soft)]">{t("recommendedAction") || "Action"}:</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${
                              rec.action === "banned" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                              rec.action === "suspended" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" :
                              rec.action === "warning" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                              "bg-[var(--color-surface)] text-[var(--color-text-soft)]"
                            }`}>
                              {rec.action}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-text-soft)] leading-relaxed">{rec.reasoning}</p>
                        </div>

                        {!rec.applied && !rec.denied && (
                          <div className="flex gap-3 pt-4 border-t themed-border">
                            <button
                              onClick={() => showApplyConfirmation(rec.reportId, rec.action, rec.reasoning)}
                              disabled={processingRecommendation === rec.reportId}
                              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${getActionColor(rec.action)}`}
                            >
                              {processingRecommendation === rec.reportId ? (
                                <>
                                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                  {t("applying") || "Applying..."}
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="w-4 h-4" />
                                  {t("approve") || "Approve"}
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => denyRecommendation(rec.reportId)}
                              disabled={processingRecommendation === rec.reportId}
                              className="px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border themed-border text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                            >
                              {t("deny") || "Deny"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !analysis && !error && (
          <div className="themed-surface-alt border themed-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-[var(--color-accent)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              {t("readyToAnalyze") || "Ready to Analyze"}
            </h3>
            <p className="text-[var(--color-text-soft)] mb-6 max-w-md mx-auto">
              {t("readyToAnalyzeDescription") || "Select a report status and click \"Analyze with AI\" to get intelligent recommendations."}
            </p>
            <div className="max-w-lg mx-auto text-left p-6 rounded-xl bg-[var(--color-surface)]">
              <h4 className="font-medium text-[var(--color-text)] mb-3">{t("aiHowItWorks") || "How it works"}:</h4>
              <div className="space-y-3 text-sm text-[var(--color-text-soft)]">
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 text-xs font-medium">1</span>
                  <span>{t("aiAnalyzesReports") || "AI analyzes reports based on severity, patterns, and user history"}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 text-xs font-medium">2</span>
                  <span>{t("recommendationsPrioritized") || "Recommendations are prioritized by urgency"}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 text-xs font-medium">3</span>
                  <span>{t("reviewAndApprove") || "You review and approve or deny each recommendation"}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 text-xs font-medium">4</span>
                  <span>{t("actionsExecuteAfterApproval") || "Actions only execute after your explicit approval"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <Alert
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, type: "", data: null })}
          title={
            confirmModal.type === "bulk"
              ? (t("confirmBulkAction") || "Confirm Bulk Action")
              : (t("confirmApplyAction") || "Confirm Action")
          }
          message={
            confirmModal.type === "bulk"
              ? `${t("confirmBulkActionMessage") || "Apply"} "${confirmModal.data?.action}" ${t("to") || "to"} ${confirmModal.data?.reportIds?.length || 0} ${t("reports") || "reports"}?`
              : `${t("confirmApplyActionMessage") || "Apply"} "${confirmModal.data?.action}" ${t("toThisReport") || "to this report"}?`
          }
          confirmText={t("confirm") || "Confirm"}
          cancelText={t("cancel") || "Cancel"}
          onConfirm={handleConfirmAction}
          type="warning"
        />
      )}

      {/* Alert Modal */}
      {alertModal.isOpen && (
        <Alert
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ isOpen: false, type: "", title: "", message: "" })}
          title={alertModal.title}
          message={alertModal.message}
          confirmText={t("ok") || "OK"}
          type={alertModal.type === "success" ? "success" : "error"}
        />
      )}
    </div>
  );
};

export default AdminAIReports;
