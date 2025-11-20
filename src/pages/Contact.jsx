import { useLanguage } from "../context/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="py-16 px-8 text-center min-h-[50vh] bg-white dark:bg-slate-900">
      <h1 className="text-4xl font-bold mb-6 text-slate-800 dark:text-slate-100">
        {t("contact")}
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400">
        Email: UniNest@hotmail.com
      </p>
    </div>
  );
};

export default Contact;
