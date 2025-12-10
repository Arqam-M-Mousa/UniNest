import { useLanguage } from "../../context/LanguageContext";
import PageLoader from "../../components/common/PageLoader";

const Marketplace = () => {
  const { t } = useLanguage();

  return (
    <PageLoader
      loading={false}
      message={t("loadingMarketplace") || "Loading marketplace..."}
    >
      <div className="py-8 px-8 text-center min-h-[50vh] themed-surface">
        <h1 className="heading-font text-4xl font-bold mb-6 text-[var(--color-text)]">
          {t("Marketplace")}
        </h1>
        <p className="text-lg text-[var(--color-text-soft)]">
          Marketplace listings coming soon...
        </p>
      </div>
    </PageLoader>
  );
};

export default Marketplace;
