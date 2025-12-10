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
    welcomeBack: "Welcome back! Sign in to continue",
    createYourAccount: "Create your account to get started",
    heroTitle:
      "Find Your Perfect Place Near Campus — Safe, Verified, and Student-Friendly.",
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
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone Number",
    student: "Student",
    landlord: "Landlord",
    admin: "Admin",
    studentId: "Student ID",
    university: "University",
    selectUniversity: "Select your university",
    forgotPassword: "Forgot Password?",
    sendResetCode: "Send Reset Code",
    resetLinkSent: "If this email exists, a reset code was sent.",
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
    overview: "Overview",
    startingFrom: "Starting from",
    myProfile: "My Profile",
    logout: "Logout",
    signInRequired: "Sign In Required",
    logInRequired: "Log In Required",
    pleaseSignInToMessage: "Please sign in to message the property owner.",
    pleaseSignInToPostAd:
      "Please sign in to your account to post an ad and connect with students.",
    signingIn: "Signing In...",
    creatingAccount: "Creating Account...",
    createAdComingSoon: "Create ad functionality coming soon!",
    propertyNotFound: "Property not found",
    backToMarketplace: "Back to Marketplace",
    profile: "Profile",
    loadingProfile: "Loading profile...",
    failedToLoadProfile: "Failed to load profile",
    goHome: "Go Home",
    profileUpdated: "Profile updated successfully!",
    contactInformation: "Contact Information",
    personalInformation: "Personal Information",
    studentInformation: "Student Information",
    profilePicture: "Profile Picture",
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    invalidPhone: "Invalid phone number format",
    gender: "Gender",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    selectGender: "Select Gender",
    genderMale: "Male",
    genderFemale: "Female",
    preferredLanguageLabel: "Preferred Language",
    languageEnglish: "English",
    languageFrench: "French",
    languageArabic: "Arabic",
    avatarUrlLabel: "Avatar URL",
    avatarUrlPlaceholder: "https://example.com/avatar.jpg",
    preview: "Preview:",
    phonePlaceholder: "e.g., +1 (555) 123-4567",
    enterFirstName: "Enter first name",
    enterLastName: "Enter last name",
    studentIdLabel: "Student ID",
    studentIdPlaceholder: "Enter your student ID",
    notProvided: "Not provided",
    notSpecified: "Not specified",
    notAssigned: "Not assigned",
    ratings: "Ratings",
    averageRating: "Average Rating",
    totalReviews: "Total Reviews",
    accountCreated: "Account created",
    lastUpdated: "Last updated",
    deleteAccount: "Delete account",
    deleteAccountWarning:
      "Permanently deletes your account and all associated data. This action cannot be undone.",
    delete: "Delete",
    deleteAccountBullet1: "Removes conversations, favorites, and listings.",
    deleteAccountBullet2: "You will be signed out immediately.",
    Delete: "Delete",
    // Alert Modals
    deleteProfilePictureTitle: "Delete profile picture",
    deleteProfilePictureMessage: "This will remove your current picture. The change only applies after you click Save Changes.",
    confirm: "Confirm",
    delete: "Delete",
    cancel: "Cancel",
    // Admin Page
    addUniversity: "Add University",
    editUniversity: "Edit University",
    universityName: "University name",
    city: "City",
    domain: "Domain",
    latitude: "Latitude",
    longitude: "Longitude",
    deleteUniversity: "Delete university",
    deleteUniversityMessage: "This action cannot be undone. Are you sure you want to delete this university?",
    saving: "Saving...",
    adding: "Adding...",
    save: "Save",
    add: "Add",
    verified: "Verified",
    // Auth Alerts
    accountCreatedTitle: "Account Created!",
    accountCreatedMessage: "Your account has been created successfully. Please sign in to continue.",
    signInNow: "Sign In Now",
    signInRequired: "Sign In Required",
    signInRequiredMessage: "Please sign in to access this feature.",
    pleaseSignInToMessage: "Please sign in to message the property owner.",
    pleaseSignInToPostAd: "Please sign in to your account to post an ad and connect with students.",
    ctaBrowseSubtitle:
      "Browse hundreds of verified student-friendly apartments and find your perfect home today",
    // About Page
    ourMission: "Our Mission",
    missionParagraph:
      "We exist to remove friction from student housing. No more endless social feed posts or unreliable landlord chains. UniNest centralizes trusted listings, transparent pricing and simple communication—so you can focus on your studies and campus life.",
    missionPoint1: "Verified listings & fair pricing transparency.",
    missionPoint2: "Tools that match lifestyle (quiet, social, partner-ready).",
    missionPoint3: "Support for international & first-year students.",
    missionPoint4: "Inclusive approach to budget & accessibility needs.",
    coreValues: "Core Values",
    howItWorks: "How It Works",
    startExploring: "Start Exploring",
    hiwDiscoverTitle: "Discover",
    hiwDiscoverDesc: "Browse verified, student-friendly listings near campus.",
    hiwCompareTitle: "Compare",
    hiwCompareDesc:
      "Filter by budget, distance, amenities and roommate options.",
    hiwConnectTitle: "Connect",
    hiwConnectDesc: "Message owners securely and schedule viewings fast.",
    hiwMoveInTitle: "Move In",
    hiwMoveInDesc: "Start your semester settled, confident and prepared.",
    // Contact Page
    contactSubtitle:
      "We'd love to hear from you—questions, suggestions or partnership ideas.",
    sendMessageHeading: "Send a Message",
    nameLabel: "Name",
    emailLabel: "Email",
    messageLabel: "Message",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@example.com",
    messagePlaceholder: "Tell us how we can help...",
    sendMessage: "Send Message",
    sending: "Sending",
    sent: "Sent!",
    privacyNotice:
      "We reply within 24h (weekdays). Your data is only used to respond to this inquiry.",
    orEmailDirectly: "Or email us directly",
    contactInfo: "Contact Information",
    supportLabel: "Support",
    responseTimeLabel: "Response time",
    supportHours: "Sunday - Thursday",
    usualResponse: "We typically respond within 24 hours.",
    faqs: "FAQs",
    faqQ1: "How are listings verified?",
    faqA1:
      "We manually review ownership docs & run consistency checks before publishing.",
    faqQ2: "Can I schedule a tour?",
    faqA2:
      "Yes. Use the message feature on a listing to request viewing times directly.",
    faqQ3: "Do you support roommate matching?",
    faqA3: "We're introducing a matching beta soon—stay tuned!",
    messageSentSuccess: "Message sent successfully!",
    // About Feature Descriptions
    aboutDesc1: "Trust & safety first in every listing we verify.",
    aboutDesc2: "Designed for student life: proximity, community, balance.",
    aboutDesc3: "Affordability matters—options for different budgets.",
    // Forgot Password
    forgotPasswordInstructions: "Enter your email address and we'll send you a code to reset your password.",
    rememberPassword: "Remember your password?",
    backToSignIn: "Back to Sign In",
    // Header
    theme: "Theme",
    language: "Language",
    dark: "Dark",
    light: "Light",
    english: "English",
    arabic: "Arabic",
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications yet.",
    messages: "Messages",
    noConversations: "No conversations yet.",
    conversation: "Conversation",
    noMessagesYet: "No messages yet",
    loading: "Loading...",
    // Profile Page
    uploadPicture: "Upload Picture",
    dangerZone: "Danger Zone",
    administration: "Administration",
    universities: "Universities",
    accountMenu: "Account menu",
    guestMenu: "Guest menu",
    myProfile: "My Profile",
  },
  ar: {
    apartments: "الشقق",
    marketplace: "السوق",
    about: "حول",
    contact: "اتصل",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    welcomeBack: "مرحباً بعودتك! سجّل الدخول للمتابعة",
    createYourAccount: "أنشئ حسابك للبدء",
    heroTitle:
      "ابحث عن مكانك المثالي بالقرب من الحرم الجامعي — آمن ومُوثق وصديق للطلاب.",
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
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phoneNumber: "رقم الهاتف",
    student: "طالب",
    landlord: "صاحب عقار",
    admin: "مشرف",
    studentId: "الرقم الجامعي",
    university: "الجامعة",
    selectUniversity: "اختر جامعتك",
    forgotPassword: "هل نسيت كلمة المرور؟",
    sendResetCode: "إرسال رمز إعادة التعيين",
    resetLinkSent:
      "إذا كان هذا البريد موجودًا، فقد تم إرسال رمز إعادة التعيين.",
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
    overview: "نظرة عامة",
    startingFrom: "يبدأ من",
    myProfile: "ملفي الشخصي",
    logout: "تسجيل الخروج",
    signInRequired: "يتطلب تسجيل الدخول",
    logInRequired: "يتطلب تسجيل الدخول",
    pleaseSignInToMessage: "يرجى تسجيل الدخول لمراسلة مالك العقار.",
    pleaseSignInToPostAd: "يرجى تسجيل الدخول لنشر إعلان والتواصل مع الطلاب.",
    signingIn: "جارٍ تسجيل الدخول...",
    creatingAccount: "جارٍ إنشاء الحساب...",
    createAdComingSoon: "ميزة إنشاء الإعلان ستتوفر قريبًا!",
    propertyNotFound: "العقار غير موجود",
    backToMarketplace: "العودة إلى السوق",
    profile: "الملف الشخصي",
    loadingProfile: "جارٍ تحميل الملف الشخصي...",
    failedToLoadProfile: "فشل في تحميل الملف الشخصي",
    goHome: "العودة للرئيسية",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح!",
    contactInformation: "معلومات التواصل",
    personalInformation: "المعلومات الشخصية",
    studentInformation: "معلومات الطالب",
    profilePicture: "صورة الملف الشخصي",
    firstNameRequired: "الاسم الأول مطلوب",
    lastNameRequired: "اسم العائلة مطلوب",
    invalidPhone: "صيغة رقم الهاتف غير صحيحة",
    gender: "الجنس",
    editProfile: "تعديل الملف",
    saveChanges: "حفظ التغييرات",
    cancel: "إلغاء",
    selectGender: "اختر الجنس",
    genderMale: "ذكر",
    genderFemale: "أنثى",
    preferredLanguageLabel: "اللغة المفضلة",
    languageEnglish: "الإنجليزية",
    languageFrench: "الفرنسية",
    languageArabic: "العربية",
    avatarUrlLabel: "رابط الصورة الشخصية",
    avatarUrlPlaceholder: "https://example.com/avatar.jpg",
    preview: "معاينة:",
    phonePlaceholder: "مثال: +1 (555) 123-4567",
    enterFirstName: "أدخل الاسم الأول",
    enterLastName: "أدخل اسم العائلة",
    studentIdLabel: "الرقم الجامعي",
    studentIdPlaceholder: "أدخل رقمك الجامعي",
    notProvided: "غير متوفر",
    notSpecified: "غير محدد",
    notAssigned: "غير معين",
    ratings: "التقييمات",
    averageRating: "متوسط التقييم",
    totalReviews: "إجمالي المراجعات",
    accountCreated: "تم إنشاء الحساب",
    lastUpdated: "آخر تحديث",
    deleteAccount: "حذف الحساب",
    deleteAccountWarning:
      "سيتم حذف حسابك وجميع البيانات المرتبطة به نهائيًا. لا يمكن التراجع عن هذا الإجراء.",
    delete: "حذف",
    deleteAccountBullet1: "يزيل المحادثات والمفضلة والقوائم.",
    deleteAccountBullet2: "سيتم تسجيل خروجك على الفور.",
    Delete: "حذف",
    // Alert Modals
    deleteProfilePictureTitle: "حذف الصورة الشخصية",
    deleteProfilePictureMessage: "سيتم إزالة صورتك الحالية. لن يتم تطبيق التغيير إلا بعد النقر على حفظ التغييرات.",
    confirm: "تأكيد",
    delete: "حذف",
    cancel: "إلغاء",
    // Admin Page
    addUniversity: "إضافة جامعة",
    editUniversity: "تعديل جامعة",
    universityName: "اسم الجامعة",
    city: "المدينة",
    domain: "النطاق",
    latitude: "خط العرض",
    longitude: "خط الطول",
    deleteUniversity: "حذف الجامعة",
    deleteUniversityMessage: "لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد أنك تريد حذف هذه الجامعة؟",
    saving: "جارٍ الحفظ...",
    adding: "جارٍ الإضافة...",
    save: "حفظ",
    add: "إضافة",
    verified: "موثّق",
    // Auth Alerts
    accountCreatedTitle: "تم إنشاء الحساب!",
    accountCreatedMessage: "تم إنشاء حسابك بنجاح. يرجى تسجيل الدخول للمتابعة.",
    signInNow: "سجل الدخول الآن",
    signInRequired: "يتطلب تسجيل الدخول",
    signInRequiredMessage: "يرجى تسجيل الدخول للوصول إلى هذه الميزة.",
    pleaseSignInToMessage: "يرجى تسجيل الدخول لمراسلة مالك العقار.",
    pleaseSignInToPostAd: "يرجى تسجيل الدخول لنشر إعلان والتواصل مع الطلاب.",
    ctaBrowseSubtitle:
      "تصفح مئات الشقق الموثوقة والصديقة للطلاب وابحث عن منزلك المثالي اليوم",
    // About Page
    ourMission: "مهمتنا",
    missionParagraph:
      "نوجد لإزالة التعقيد من سكن الطلاب. لا مزيد من منشورات وسائل التواصل التي لا تنتهي أو سلاسل الملاك غير الموثوقة. تقوم UniNest بدمج القوائم الموثوقة، والأسعار الشفافة والتواصل البسيط — حتى تركز على دراستك وحياتك الجامعية.",
    missionPoint1: "قوائم موثقة وشفافية في التسعير.",
    missionPoint2: "أدوات تطابق نمط الحياة (هادئ، اجتماعي، مناسب للشريك).",
    missionPoint3: "دعم للطلاب الدوليين وطلاب السنة الأولى.",
    missionPoint4: "نهج شامل للاحتياجات المالية وإمكانية الوصول.",
    coreValues: "القيم الأساسية",
    howItWorks: "كيف تعمل المنصة",
    startExploring: "ابدأ الاستكشاف",
    hiwDiscoverTitle: "اكتشف",
    hiwDiscoverDesc: "تصفح قوائم موثقة وملائمة للطلاب بالقرب من الجامعة.",
    hiwCompareTitle: "قارن",
    hiwCompareDesc:
      "صفِّ حسب الميزانية، والمسافة، والمرافق، وخيارات السكن المشترك.",
    hiwConnectTitle: "تواصل",
    hiwConnectDesc: "راسل الملاك بأمان وحدد مواعيد الزيارات بسرعة.",
    hiwMoveInTitle: "انتقل",
    hiwMoveInDesc: "ابدأ فصلك الدراسي مستقرًا وواثقًا ومستعدًا.",
    // Contact Page
    contactSubtitle: "يسعدنا سماعك — أسئلة أو اقتراحات أو أفكار شراكة.",
    sendMessageHeading: "أرسل رسالة",
    nameLabel: "الاسم",
    emailLabel: "البريد الإلكتروني",
    messageLabel: "الرسالة",
    namePlaceholder: "اسمك",
    emailPlaceholder: "you@example.com",
    messagePlaceholder: "أخبرنا كيف يمكننا مساعدتك...",
    sendMessage: "إرسال الرسالة",
    sending: "جارٍ الإرسال",
    sent: "تم الإرسال!",
    privacyNotice:
      "نرد خلال 24 ساعة (أيام الأسبوع). تُستخدم بياناتك فقط للرد على هذا الطلب.",
    orEmailDirectly: "أو راسلنا مباشرة",
    contactInfo: "معلومات التواصل",
    supportLabel: "الدعم",
    responseTimeLabel: "زمن الاستجابة",
    supportHours: "الأحد - الخميس",
    usualResponse: "عادة نرد خلال 24 ساعة.",
    faqs: "الأسئلة الشائعة",
    faqQ1: "كيف يتم توثيق القوائم؟",
    faqA1: "نراجع يدويًا مستندات الملكية ونجري فحوصات الاتساق قبل النشر.",
    faqQ2: "هل يمكنني تحديد موعد زيارة؟",
    faqA2: "نعم. استخدم ميزة الرسائل في القائمة لطلب أوقات الزيارة مباشرة.",
    faqQ3: "هل تدعمون مطابقة زملاء السكن؟",
    faqA3: "نُطلق قريبًا نسخة تجريبية للمطابقة — ترقب!",
    messageSentSuccess: "تم إرسال الرسالة بنجاح!",
    // About Feature Descriptions
    aboutDesc1: "الثقة والأمان أولاً في كل قائمة نتحقق منها.",
    aboutDesc2: "مصمم لحياة الطالب: قرب، مجتمع، توازن.",
    aboutDesc3: "نهتم بالقدرة المالية — خيارات لميزانيات مختلفة.",
    // Forgot Password
    forgotPasswordInstructions: "أدخل عنوان بريدك الإلكتروني وسنرسل لك رمزًا لإعادة تعيين كلمة المرور.",
    rememberPassword: "هل تتذكر كلمة المرور؟",
    backToSignIn: "العودة لتسجيل الدخول",
    // Header
    theme: "المظهر",
    language: "اللغة",
    dark: "داكن",
    light: "فاتح",
    english: "الإنجليزية",
    arabic: "العربية",
    notifications: "الإشعارات",
    markAllRead: "تحديد الكل كمقروء",
    noNotifications: "لا توجد إشعارات بعد.",
    messages: "الرسائل",
    noConversations: "لا توجد محادثات بعد.",
    conversation: "محادثة",
    noMessagesYet: "لا توجد رسائل بعد",
    loading: "جارٍ التحميل...",
    // Profile Page
    uploadPicture: "رفع صورة",
    dangerZone: "منطقة الخطر",
    administration: "الإدارة",
    universities: "الجامعات",
    accountMenu: "قائمة الحساب",
    guestMenu: "قائمة الضيف",
    myProfile: "ملفي الشخصي",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Initialize from localStorage or default to 'en'
    return localStorage.getItem("preferredLanguage") || "en";
  });
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    // Persist language to localStorage
    localStorage.setItem("preferredLanguage", language);
  }, [language]);

  const toggleLanguage = () => {
    setIsChangingLanguage(true);
    // Small delay for smooth transition
    setTimeout(() => {
      setLanguage((prev) => (prev === "en" ? "ar" : "en"));
      setTimeout(() => {
        setIsChangingLanguage(false);
      }, 100);
    }, 150);
  };

  const changeLanguage = (lang) => {
    if (lang === "en" || lang === "ar") {
      setIsChangingLanguage(true);
      setTimeout(() => {
        console.log("Changing language to:", lang);
        setLanguage(lang);
        setTimeout(() => {
          setIsChangingLanguage(false);
        }, 100);
      }, 150);
    }
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, changeLanguage, t, isChangingLanguage }}
    >
      {isChangingLanguage && (
        <div className="fixed inset-0 z-[9999] bg-[var(--color-surface)]/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin"></div>
            <p className="text-[var(--color-text)] font-medium">
              {language === "en" ? "Switching language..." : "جارٍ تبديل اللغة..."}
            </p>
          </div>
        </div>
      )}
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
