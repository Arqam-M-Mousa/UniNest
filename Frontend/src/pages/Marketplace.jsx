import { useLanguage } from "../context/LanguageContext";

const Marketplace = () => {
  const { t } = useLanguage();

  return (
    <div className="py-8 px-8 text-center min-h-[50vh] themed-surface">
      <h1 className="heading-font text-4xl font-bold mb-6 text-[var(--color-text)]">
        {t("Marketplace")}
      </h1>
      <p className="text-lg text-[var(--color-text-soft)]">
        Marketplace listings coming soon...
      </p>
    </div>
  );
};

export default Marketplace;
