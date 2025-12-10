import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import apiRequest from "../../services/api";

const faqs = [
  { q: "faqQ1", a: "faqA1" },
  { q: "faqQ2", a: "faqA2" },
  { q: "faqQ3", a: "faqA3" },
];

const Contact = () => {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      await apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="themed-surface">
      <section className="px-6 sm:px-8 pt-16 pb-12 text-center">
        <h1 className="heading-font text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-[var(--color-text)]">
          {t("contact")}
        </h1>
        <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed text-[var(--color-text-soft)]">
          {t("contactSubtitle")}
        </p>
      </section>

      <section className="px-6 sm:px-8 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-10 md:gap-12 items-start">
          <form
            onSubmit={handleSubmit}
            className={`themed-surface-alt p-8 sm:p-10 rounded-2xl shadow-lg border border-[var(--color-border)] flex flex-col gap-7 ${isRTL ? "text-right" : "text-left"
              }`}
            aria-labelledby="contactFormTitle"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div>
              <h2
                id="contactFormTitle"
                className="heading-font text-2xl sm:text-3xl font-bold mb-2 text-[var(--color-text)]"
              >
                {t("sendMessageHeading")}
              </h2>
              <p className="text-[var(--color-text-soft)] text-base">
                {t("contactSubtitle")}
              </p>
            </div>

            {(submitted || error) && (
              <div
                className={`p-4 rounded-xl text-base font-medium ${submitted
                  ? "bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                  }`}
                role={submitted ? "status" : "alert"}
              >
                {submitted
                  ? t("messageSentSuccess") || "Message sent successfully!"
                  : error}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col">
                <label
                  htmlFor="name"
                  className="mb-2 text-sm font-semibold tracking-wide text-[var(--color-text)]"
                >
                  {t("nameLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={sending}
                  className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t("namePlaceholder")}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="mb-2 text-sm font-semibold tracking-wide text-[var(--color-text)]"
                >
                  {t("emailLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={sending}
                  className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t("emailPlaceholder")}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="message"
                className="mb-2 text-sm font-semibold tracking-wide text-[var(--color-text)]"
              >
                {t("messageLabel")} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                disabled={sending}
                rows={6}
                className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)] resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t("messagePlaceholder")}
              />
            </div>

            <div
              className={`flex flex-col ${isRTL ? "items-end" : "items-start"}`}
            >
              <button
                type="submit"
                disabled={sending}
                className="btn-primary px-10 py-4 rounded-full font-semibold text-lg inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-xl"
                aria-live="polite"
              >
                {sending && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {sending
                  ? t("sending") || "Sending..."
                  : t("sendMessage")}
              </button>
              <p className="text-xs text-[var(--color-text-soft)] m-0 mt-3">
                {t("privacyNotice")}
              </p>
              <a
                href={`mailto:arqam.mousa@gmail.com?subject=${encodeURIComponent(
                  `UniNest Contact from ${form.name || "Visitor"}`
                )}&body=${encodeURIComponent(
                  `From: ${form.email || "(no email provided)"}\n\n${form.message
                  }`
                )}`}
                className="mt-3 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline transition-all"
              >
                {t("orEmailDirectly") || "Or email us directly"}
              </a>
            </div>
          </form>

          <div className="space-y-8">
            <div
              className={`themed-surface-alt rounded-3xl p-8 shadow-xl border border-[var(--color-border)] ${isRTL ? "text-right" : "text-left"
                }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <h2 className="heading-font text-2xl sm:text-3xl font-bold mb-6 text-[var(--color-text)]">
                {t("contactInfo") || "Contact Information"}
              </h2>
              <ul className="space-y-4 text-[var(--color-text-soft)]">
                <li className="flex flex-col gap-1">
                  <strong className="text-[var(--color-text)] text-sm font-semibold">
                    {t("emailLabel")}:
                  </strong>
                  <a
                    href="mailto:arqam.mousa@gmail.com"
                    className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium transition-all"
                  >
                    arqam.mousa@gmail.com
                  </a>
                </li>
                <li className="flex flex-col gap-1">
                  <strong className="text-[var(--color-text)] text-sm font-semibold">
                    {t("supportLabel") || "Support"}:
                  </strong>
                  <span>{t("supportHours") || "Sunday - Thursday"}</span>
                </li>
                <li className="flex flex-col gap-1">
                  <strong className="text-[var(--color-text)] text-sm font-semibold">
                    {t("responseTimeLabel") || "Response time"}:
                  </strong>
                  <span>
                    {t("usualResponse") ||
                      "We typically respond within 24 hours."}
                  </span>
                </li>
              </ul>
            </div>

            <div
              className={`themed-surface-alt rounded-3xl p-8 shadow-xl border border-[var(--color-border)] ${isRTL ? "text-right" : "text-left"
                }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <h2 className="heading-font text-2xl sm:text-3xl font-bold mb-6 text-[var(--color-text)]">
                {t("faqs")}
              </h2>
              <div className="space-y-3">
                {faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div
                      key={f.q}
                      className="border border-[var(--color-border)] rounded-xl overflow-hidden transition-all hover:border-[var(--color-accent)]/30"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full flex justify-between items-center px-5 py-4 bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-left cursor-pointer hover:bg-[var(--color-surface)] transition-all"
                        aria-expanded={open}
                      >
                        <span className="font-semibold text-base text-[var(--color-text)] pr-4">
                          {t(f.q)}
                        </span>
                        <span className="text-[var(--color-accent)] text-xl font-bold flex-shrink-0">
                          {open ? "−" : "+"}
                        </span>
                      </button>
                      {open && (
                        <div className="px-5 py-4 text-sm text-[var(--color-text-soft)] leading-relaxed bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                          {t(f.a)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section >
    </div >
  );
};

export default Contact;
