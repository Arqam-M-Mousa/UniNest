import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

const faqs = [
  {
    q: "How are listings verified?",
    a: "We manually review ownership docs & run consistency checks before publishing.",
  },
  {
    q: "Can I schedule a tour?",
    a: "Yes. Use the message feature on a listing to request viewing times directly.",
  },
  {
    q: "Do you support roommate matching?",
    a: "We're introducing a matching beta soon—stay tuned!",
  },
];

const Contact = () => {
  const { t } = useLanguage();
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
          We'd love to hear from you—questions, suggestions or partnership
          ideas.
        </p>
      </section>

      {/* Contact Grid */}
      <section className="px-8 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="themed-surface-alt rounded-3xl p-8 shadow-card flex flex-col gap-6"
            aria-labelledby="contactFormTitle"
          >
            <h2
              id="contactFormTitle"
              className="heading-font text-2xl font-bold m-0 text-[var(--color-text)]"
            >
              Send a Message
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col text-left">
                <label
                  htmlFor="name"
                  className="mb-1 text-xs font-semibold tracking-wide uppercase text-[var(--color-text-soft)]"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 rounded-xl bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)]"
                  placeholder="Your name"
                />
              </div>
              <div className="flex flex-col text-left">
                <label
                  htmlFor="email"
                  className="mb-1 text-xs font-semibold tracking-wide uppercase text-[var(--color-text-soft)]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 rounded-xl bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)]"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <label
                htmlFor="message"
                className="mb-1 text-xs font-semibold tracking-wide uppercase text-[var(--color-text-soft)]"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
                className="px-4 py-3 rounded-xl resize-y bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text)]"
                placeholder="Tell us how we can help..."
              />
            </div>
            <button
              type="submit"
              className="btn-primary px-8 py-3 rounded-full font-semibold inline-flex items-center justify-center gap-2"
              aria-live="polite"
            >
              {submitted ? "Sent! ✅" : "Send Message"}
            </button>
            <p className="text-xs text-[var(--color-text-soft)] m-0 text-left">
              We reply within 24h (weekdays). Your data is only used to respond
              to this inquiry.
            </p>
          </form>
          {/* Info + FAQ */}
          <div className="space-y-10">
            <div className="themed-surface-alt rounded-3xl p-8 shadow-card text-left">
              <h2 className="heading-font text-2xl font-bold mb-4 text-[var(--color-text)]">
                Direct Contact
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-text-soft)]">
                <li>
                  <strong className="text-[var(--color-text)]">Email:</strong>{" "}
                  UniNest@hotmail.com
                </li>
                <li>
                  <strong className="text-[var(--color-text)]">Support:</strong>{" "}
                  Mon–Fri, 9am–6pm (GMT+2)
                </li>
                <li>
                  <strong className="text-[var(--color-text)]">
                    Response Time:
                  </strong>{" "}
                  Usually under 4 hours
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Listings", "Security", "Partners", "Press"].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] text-[var(--color-text-soft)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="themed-surface-alt rounded-3xl p-8 shadow-card text-left">
              <h2 className="heading-font text-2xl font-bold mb-6 text-[var(--color-text)]">
                FAQs
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
                          {f.q}
                        </span>
                        <span className="text-[var(--color-text-soft)] text-xs">
                          {open ? "−" : "+"}
                        </span>
                      </button>
                      {open && (
                        <div className="px-5 pb-4 text-xs text-[var(--color-text-soft)] leading-relaxed">
                          {f.a}
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
