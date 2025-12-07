import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import apiRequest from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

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
      <section className="px-8 pt-12 pb-10 text-center">
        <h1 className="heading-font text-5xl font-bold mb-6 text-[var(--color-text)]">
          {t("contact")}
        </h1>
        <p className="text-lg max-w-3xl mx-auto leading-relaxed text-[var(--color-text-soft)]">
          {t("contactSubtitle")}
        </p>
      </section>

      <section className="px-8 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <form
            onSubmit={handleSubmit}
            className={`themed-surface-alt rounded-3xl p-8 shadow-card flex flex-col gap-6 ${
              isRTL ? "text-right" : "text-left"
            }`}
            aria-labelledby="contactFormTitle"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <h2
              id="contactFormTitle"
              className="heading-font text-2xl font-bold m-0 text-[var(--color-text)]"
            >
              {t("sendMessageHeading")}
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col">
                <label
                  htmlFor="name"
                  className="mb-1 text-xs font-semibold tracking-wide uppercase text-[var(--color-text-soft)]"
                >
                  {t("nameLabel")}
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 rounded-xl bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)]"
                  placeholder={t("namePlaceholder")}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="mb-1 text-xs font-semibold tracking-wide uppercase text-[var(--color-text-soft)]"
                >
                  {t("emailLabel")}
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 rounded-xl bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)]"
                  placeholder={t("emailPlaceholder")}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="message"
                className="mb-1 text-xs font-semibold tracking-wide uppercase text-[var(--color-text-soft)]"
              >
                {t("messageLabel")}
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
                className="px-4 py-3 rounded-xl bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)] resize-none"
                placeholder={t("messagePlaceholder")}
              />
            </div>

            <div
              className={`flex flex-col ${isRTL ? "items-end" : "items-start"}`}
            >
              <button
                type="submit"
                disabled={sending}
                className="btn-primary px-8 py-3 rounded-full font-semibold inline-flex items-center justify-center gap-2 anim-btn-pulse disabled:opacity-50 disabled:cursor-not-allowed"
                aria-live="polite"
              >
                {sending && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {sending
                  ? t("sending") || "Sending..."
                  : submitted
                  ? t("sent")
                  : t("sendMessage")}
              </button>
              {error && (
                <p className="text-red-500 text-sm m-0 mt-2" role="alert">
                  {error}
                </p>
              )}
              {submitted && !error && (
                <p className="text-green-500 text-sm m-0 mt-2" role="status">
                  {t("messageSentSuccess") || "Message sent successfully!"}
                </p>
              )}
              <p className="text-xs text-[var(--color-text-soft)] m-0 mt-2">
                {t("privacyNotice")}
              </p>
              <a
                href={`mailto:arqam.mousa@gmail.com?subject=${encodeURIComponent(
                  `UniNest Contact from ${form.name || "Visitor"}`
                )}&body=${encodeURIComponent(
                  `From: ${form.email || "(no email provided)"}\n\n${
                    form.message
                  }`
                )}`}
                className="mt-3 text-xs text-[var(--color-accent)] underline"
              >
                {t("orEmailDirectly") || "Or email us directly"}
              </a>
            </div>
          </form>

          <div className="space-y-10">
            <div
              className={`themed-surface-alt rounded-3xl p-8 shadow-card ${
                isRTL ? "text-right" : "text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <h2 className="heading-font text-2xl font-bold mb-4 text-[var(--color-text)]">
                {t("contactInfo") || "Contact Information"}
              </h2>
              <ul className="space-y-3 text-[var(--color-text-soft)]">
                <li>
                  <strong className="text-[var(--color-text)]">
                    {t("emailLabel")}:
                  </strong>{" "}
                  <a
                    href="mailto:arqam.mousa@gmail.com"
                    className="text-[var(--color-accent)] font-semibold"
                  >
                    arqam.mousa@gmail.com
                  </a>
                </li>
                <li>
                  <strong className="text-[var(--color-text)]">
                    {t("supportLabel") || "Support"}:
                  </strong>{" "}
                  {t("supportHours") || "Sunday - Thursday"}
                </li>
                <li>
                  <strong className="text-[var(--color-text)]">
                    {t("responseTimeLabel") || "Response time"}:
                  </strong>{" "}
                  {t("usualResponse") ||
                    "We typically respond within 24 hours."}
                </li>
              </ul>
            </div>

            <div
              className={`themed-surface-alt rounded-3xl p-8 shadow-card ${
                isRTL ? "text-right" : "text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <h2 className="heading-font text-2xl font-bold mb-6 text-[var(--color-text)]">
                {t("faqs")}
              </h2>
              <div className="space-y-4">
                {faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div
                      key={f.q}
                      className="border border-[var(--color-border)] rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full flex justify-between items-center px-5 py-3 bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-left cursor-pointer"
                        aria-expanded={open}
                      >
                        <span className="font-medium text-sm text-[var(--color-text)]">
                          {t(f.q)}
                        </span>
                        <span className="text-[var(--color-text-soft)] text-xs">
                          {open ? "−" : "+"}
                        </span>
                      </button>
                      {open && (
                        <div className="px-5 pb-4 text-xs text-[var(--color-text-soft)] leading-relaxed">
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
      </section>
    </div>
  );
};

export default Contact;
