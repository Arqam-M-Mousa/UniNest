import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const translations = {
  en: {
    apartments: "Apartments",
    marketplace: "Marketplace",
    about: "About",
    contact: "Contact",
    signIn: "Sign In",
    signUp: "Sign Up",
    heroTitle:
      "Find Your Perfect Nest Near Campus — Safe, Verified, and Student-Friendly.",
    heroSubtitle:
      "Simplify your housing search with verified listings and trusted landlords",
    startSearching: "Start Searching",
    verifiedRentals: "Verified Rentals",
    campusHousing: "Campus Housing",
    affordableHousing: "Affordable Student Housing",
    aboutUs: "About Us",
    aboutUsText:
      "Welcome to UniNest — your trusted student-housing hub. We connect university students with safe, verified housing near campus. Explore personalized matching and filters that fit your budget and lifestyle. Start your next chapter with confidence.",
    ourOffers: "Our Offers",
    readyTitle: "Ready to find your next home?",
    builtForStudents: "Built for students by students",
    weUnderstand: "We understand what campus life needs",
    home: "Home",
    aboutUsLink: "About Us",
    connect: "Connect",
    rightsReserved: "©2025 All rights reserved",
    email: "Email",
    password: "Password",
    forgotPassword: "Did you forget your password?",
    noAccount: "You don't have an account?",
    createOne: "Create one",
    passwordAgain: "Password Again",
    haveAccount: "Have an account?",
    logIn: "Log In",
    marketplaceTitle: "MARKETPLACE",
    marketplaceSubtitle: "Student Living Made Simple: Find, Verify, Move In.",
    searchPlaceholder: "Search here",
    lastListings: "Last Listings",
    offers: "Offers",
    favorites: "Favorites",
    masonry: "Masonry",
    postAd: "Post AD",
    filters: "Filters",
    price: "Price",
    squareMeter: "Square Meter",
    availableIn: "Available in",
    garage: "Garage",
    yes: "Yes",
    no: "No",
    rooms: "Rooms",
    partner: "Partner",
    ownerOfBuilding: "Owner of the building",
    messageNow: "Message Now",
    beds: "beds",
    baths: "bath",
    kitchen: "Kitchen",
    livingRoom: "ILR",
  },
  ar: {
    apartments: "الشقق",
    marketplace: "السوق",
    about: "حول",
    contact: "اتصل",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    heroTitle:
      "ابحث عن عشك المثالي بالقرب من الحرم الجامعي — آمن ومُوثق وصديق للطلاب.",
    heroSubtitle: "بسّط بحثك عن السكن مع قوائم موثقة وملّاك موثوقين",
    startSearching: "ابدأ البحث",
    verifiedRentals: "إيجارات موثقة",
    campusHousing: "سكن جامعي",
    affordableHousing: "سكن طلابي بأسعار معقولة",
    aboutUs: "من نحن",
    aboutUsText:
      "مرحباً بك في UniNest — مركز السكن الطلابي الموثوق. نربط طلاب الجامعة بسكن آمن ومُوثق بالقرب من الحرم الجامعي. استكشف المطابقة الشخصية والفلاتر التي تناسب ميزانيتك وأسلوب حياتك. ابدأ فصلك التالي بثقة.",
    ourOffers: "عروضنا",
    readyTitle: "هل أنت مستعد لإيجاد منزلك القادم؟",
    builtForStudents: "مبني للطلاب من قبل الطلاب",
    weUnderstand: "نحن نفهم ما تحتاجه حياة الحرم الجامعي",
    home: "الرئيسية",
    aboutUsLink: "من نحن",
    connect: "تواصل",
    rightsReserved: "©2025 جميع الحقوق محفوظة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgotPassword: "هل نسيت كلمة المرور؟",
    noAccount: "ليس لديك حساب؟",
    createOne: "إنشاء واحد",
    passwordAgain: "كلمة المرور مرة أخرى",
    haveAccount: "هل لديك حساب؟",
    logIn: "تسجيل الدخول",
    marketplaceTitle: "السوق",
    marketplaceSubtitle: "حياة الطلاب أصبحت بسيطة: ابحث، تحقق، انتقل.",
    searchPlaceholder: "ابحث هنا",
    lastListings: "آخر الإعلانات",
    offers: "العروض",
    favorites: "المفضلة",
    masonry: "البناء",
    postAd: "انشر إعلان",
    filters: "الفلاتر",
    price: "السعر",
    squareMeter: "متر مربع",
    availableIn: "متاح في",
    garage: "جراج",
    yes: "نعم",
    no: "لا",
    rooms: "الغرف",
    partner: "شريك",
    ownerOfBuilding: "مالك العقار",
    messageNow: "راسل الآن",
    beds: "سرير",
    baths: "حمام",
    kitchen: "مطبخ",
    livingRoom: "صالة",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
