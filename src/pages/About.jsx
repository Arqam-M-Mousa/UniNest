import { useLanguage } from "../context/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="py-8 px-8 text-center min-h-[50vh] themed-surface">
      <h1 className="heading-font text-4xl font-bold mb-6 text-[var(--color-text)]">
        {t("about")}
      </h1>
      <p className="text-lg max-w-3xl mx-auto leading-relaxed text-[var(--color-text-soft)]">
        {t("aboutUsText")}
      </p>
    </div>
  );
};

export default About;
