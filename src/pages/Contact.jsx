import { useLanguage } from "../context/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="py-8 px-8 text-center min-h-[50vh] themed-surface">
      <h1 className="heading-font text-4xl font-bold mb-6 text-[var(--color-text)]">
        {t("contact")}
      </h1>
      <p className="text-lg text-[var(--color-text-soft)]">
        Email: UniNest@hotmail.com
      </p>
    </div>
  );
};

export default Contact;
