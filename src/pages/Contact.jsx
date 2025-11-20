import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

const faqs = [
  {
    q: "faqQ1",
    a: "faqA1",
  },
  {
    q: "faqQ2",
    a: "faqA2",
  },
  {
    q: "faqQ3",
    a: "faqA3",
  },
];

const Contact = () => {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate send
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="themed-surface">
      {/* Hero */}
      <section className="px-8 pt-12 pb-10 text-center">
        <h1 className="heading-font text-5xl font-bold mb-6 text-[var(--color-text)]">
          {t("contact")}
        </h1>
        <p className="text-lg max-w-3xl mx-auto leading-relaxed text-[var(--color-text-soft)]">
          {t("contactSubtitle")}
        </p>
      </section>

      {/* Contact Grid */}
      <section className="px-8 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
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
            <div className={`grid gap-6 sm:grid-cols-2 ${isRTL ? "" : ""}`}>
              {" "}
              {/* grid itself can remain neutral */}
              <div
                className={`flex flex-col ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
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
              <div
                className={`flex flex-col ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
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
            <div
              className={`flex flex-col ${isRTL ? "text-right" : "text-left"}`}
            >
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
                className="px-4 py-3 rounded-xl resize-y bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)]"
                placeholder={t("messagePlaceholder")}
              />
            </div>
            <button
              type="submit"
              className="btn-primary px-8 py-3 rounded-full font-semibold inline-flex items-center justify-center gap-2 anim-btn-pulse"
              aria-live="polite"
            >
              {submitted ? t("sent") : t("sendMessage")}
            </button>
            <p
              className={`text-xs text-[var(--color-text-soft)] m-0 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("privacyNotice")}
            </p>
          </form>
          {/* Info + FAQ */}
          <div className="space-y-10">
            <div
              className={`themed-surface-alt rounded-3xl p-8 shadow-card ${
                isRTL ? "text-right" : "text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <h2 className="heading-font text-2xl font-bold mb-4 text-[var(--color-text)]">
                {t("directContact")}
              </h2>
              <ul
                className={`space-y-2 text-sm text-[var(--color-text-soft)] ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <li>
                  <strong className="text-[var(--color-text)]">
                    {t("emailLabel")}:
                  </strong>{" "}
                  UniNest@hotmail.com
                </li>
                <li>
                  <strong className="text-[var(--color-text)]">
                    {t("supportLabel")}
                  </strong>{" "}
                  {t("supportHours")}
                </li>
                <li>
                  <strong className="text-[var(--color-text)]">
                    {t("responseTimeLabel")}
                  </strong>{" "}
                  {t("usualResponse")}
                </li>
              </ul>
              {/* Removed tag pills section as requested */}
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
