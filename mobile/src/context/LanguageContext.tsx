import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

interface LanguageContextType {
  language: string;
  toggleLanguage: () => void;
  changeLanguage: (lang: string) => void;
  t: (key: string) => string;
  isChangingLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Common
    cancel: "Cancel",
    delete: "Delete",
    error: "Error",
    save: "Save",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    yes: "Yes",
    no: "No",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    submit: "Submit",
    close: "Close",
    
    // Navigation
    home: "Home",
    properties: "Properties",
    marketplace: "Marketplace",
    community: "Community",
    roommates: "Roommates",
    profile: "Profile",
    settings: "Settings",
    messages: "Messages",
    notifications: "Notifications",
    favorites: "Favorites",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    logout: "Logout",
    email: "Email",
    password: "Password",
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone Number",
    forgotPassword: "Forgot Password?",
    welcomeBack: "Welcome back! Sign in to continue",
    createYourAccount: "Create your account to get started",
    haveAccount: "Have an account?",
    noAccount: "Don't have an account?",
    createOne: "Create one",
    logIn: "Log In",
    student: "Student",
    landlord: "Landlord",
    studentId: "Student ID",
    university: "University",
    selectUniversity: "Select your university",
    
    // Profile
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    profilePicture: "Profile Picture",
    personalInformation: "Personal Information",
    contactInformation: "Contact Information",
    studentInformation: "Student Information",
    gender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    deleteAccount: "Delete Account",
    changePassword: "Change Password",
    
    // Properties
    myListings: "My Listings",
    addListing: "Add Listing",
    editListing: "Edit Listing",
    propertyDetails: "Property Details",
    propertyType: "Property Type",
    price: "Price",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    area: "Area",
    address: "Address",
    city: "City",
    description: "Description",
    amenities: "Amenities",
    photos: "Photos",
    available: "Available",
    unavailable: "Unavailable",
    viewDetails: "View Details",
    contactOwner: "Contact Owner",
    
    // Marketplace
    marketplaceItems: "Marketplace Items",
    addItem: "Add Item",
    itemName: "Item Name",
    itemPrice: "Price",
    itemCondition: "Condition",
    conditionNew: "New",
    conditionUsed: "Used",
    conditionLikeNew: "Like New",
    
    // Community
    posts: "Posts",
    createPost: "Create Post",
    postTitle: "Post Title",
    postContent: "Post Content",
    comments: "Comments",
    addComment: "Add Comment",
    
    // Roommates
    findRoommate: "Find Roommate",
    roommateProfile: "Roommate Profile",
    preferences: "Preferences",
    lifestyle: "Lifestyle",
    budget: "Budget",
    matchScore: "Match Score",
    
    // Settings
    language: "Language",
    english: "English",
    arabic: "Arabic",
    changeLanguage: "Change Language",
    selectLanguage: "Select Language",
    pushNotifications: "Push Notifications",
    emailNotifications: "Email Notifications",
    privacy: "Privacy",
    security: "Security",
    
    // AI Chat
    aiChatNewChat: "New chat",
    aiChatNoConversationsYet: "No conversations yet",
    aiChatStartChatting: "Start chatting to create one!",
    aiChatRecentChats: "Recent Chats",
    aiChatDeleteConversation: "Delete conversation",
    aiChatDeleteConversationTitle: "Delete Conversation?",
    aiChatDeleteConversationMessage: "Are you sure you want to delete this conversation? This action cannot be undone.",
    aiChatUniNestAssistant: "UniNest Assistant",
    aiChatPropertyExpert: "Property Expert",
    aiChatYourCaringAssistant: "Your caring assistant",
    aiChatPropertyMarketingExpert: "Property marketing expert",
    aiChatWhatCanIHelp: "What can I help with?",
    aiChatHowCanIHelpProperty: "How can I help your property?",
    aiChatStudentDescription: "Ask me about cooking, cleaning, budgeting, or any student life tips!",
    aiChatLandlordDescription: "Get expert advice on marketing, pricing, and tenant management.",
    aiChatAskMeAnything: "Ask me anything...",
    aiChatHowCanIHelpPropertyInput: "How can I help with your property?",
    aiChatCanMakeMistakes: "can make mistakes. Consider checking important info.",
    aiChatNewConversation: "New conversation",
    aiChatJustNow: "Just now",
    aiChatMinutesAgo: "m ago",
    aiChatHoursAgo: "h ago",
    aiChatDaysAgo: "d ago",
    aiChatMessages: "msg",
    aiChatConversations: "Conversations",
    aiChatWelcomeStudent: "Welcome! I'm here to help!",
    aiChatWelcomeProperty: "Property Expert at Your Service",
    
    // Messages
    noMessages: "No messages yet",
    typeMessage: "Type a message...",
    sendMessage: "Send",
    
    // Notifications
    noNotifications: "No notifications yet",
    markAllRead: "Mark all as read",
    
    // Errors & Validation
    requiredField: "This field is required",
    invalidEmail: "Invalid email address",
    invalidPhone: "Invalid phone number",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDoNotMatch: "Passwords do not match",
    somethingWentWrong: "Something went wrong",
    tryAgain: "Try again",
    
    // Success Messages
    success: "Success",
    savedSuccessfully: "Saved successfully",
    deletedSuccessfully: "Deleted successfully",
    updatedSuccessfully: "Updated successfully",
    createdSuccessfully: "Created successfully",
  },
  ar: {
    // Common
    cancel: "إلغاء",
    delete: "حذف",
    error: "خطأ",
    save: "حفظ",
    edit: "تعديل",
    add: "إضافة",
    search: "بحث",
    filter: "تصفية",
    loading: "جاري التحميل...",
    yes: "نعم",
    no: "لا",
    confirm: "تأكيد",
    back: "رجوع",
    next: "التالي",
    submit: "إرسال",
    close: "إغلاق",
    
    // Navigation
    home: "الرئيسية",
    properties: "العقارات",
    marketplace: "السوق",
    community: "المجتمع",
    roommates: "زملاء السكن",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    messages: "الرسائل",
    notifications: "الإشعارات",
    favorites: "المفضلة",
    
    // Auth
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phoneNumber: "رقم الهاتف",
    forgotPassword: "نسيت كلمة المرور؟",
    welcomeBack: "مرحباً بعودتك! سجّل الدخول للمتابعة",
    createYourAccount: "أنشئ حسابك للبدء",
    haveAccount: "لديك حساب؟",
    noAccount: "ليس لديك حساب؟",
    createOne: "أنشئ واحداً",
    logIn: "تسجيل الدخول",
    student: "طالب",
    landlord: "مالك عقار",
    studentId: "الرقم الجامعي",
    university: "الجامعة",
    selectUniversity: "اختر جامعتك",
    
    // Profile
    myProfile: "ملفي الشخصي",
    editProfile: "تعديل الملف الشخصي",
    saveChanges: "حفظ التغييرات",
    profilePicture: "صورة الملف الشخصي",
    personalInformation: "المعلومات الشخصية",
    contactInformation: "معلومات الاتصال",
    studentInformation: "معلومات الطالب",
    gender: "الجنس",
    genderMale: "ذكر",
    genderFemale: "أنثى",
    deleteAccount: "حذف الحساب",
    changePassword: "تغيير كلمة المرور",
    
    // Properties
    myListings: "قوائمي",
    addListing: "إضافة قائمة",
    editListing: "تعديل القائمة",
    propertyDetails: "تفاصيل العقار",
    propertyType: "نوع العقار",
    price: "السعر",
    bedrooms: "غرف النوم",
    bathrooms: "الحمامات",
    area: "المساحة",
    address: "العنوان",
    city: "المدينة",
    description: "الوصف",
    amenities: "المرافق",
    photos: "الصور",
    available: "متاح",
    unavailable: "غير متاح",
    viewDetails: "عرض التفاصيل",
    contactOwner: "التواصل مع المالك",
    
    // Marketplace
    marketplaceItems: "عناصر السوق",
    addItem: "إضافة عنصر",
    itemName: "اسم العنصر",
    itemPrice: "السعر",
    itemCondition: "الحالة",
    conditionNew: "جديد",
    conditionUsed: "مستعمل",
    conditionLikeNew: "كالجديد",
    
    // Community
    posts: "المنشورات",
    createPost: "إنشاء منشور",
    postTitle: "عنوان المنشور",
    postContent: "محتوى المنشور",
    comments: "التعليقات",
    addComment: "إضافة تعليق",
    
    // Roommates
    findRoommate: "ابحث عن زميل سكن",
    roommateProfile: "ملف زميل السكن",
    preferences: "التفضيلات",
    lifestyle: "نمط الحياة",
    budget: "الميزانية",
    matchScore: "نسبة التطابق",
    
    // Settings
    language: "اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
    changeLanguage: "تغيير اللغة",
    selectLanguage: "اختر اللغة",
    pushNotifications: "إشعارات الدفع",
    emailNotifications: "إشعارات البريد الإلكتروني",
    privacy: "الخصوصية",
    security: "الأمان",
    
    // AI Chat
    aiChatNewChat: "محادثة جديدة",
    aiChatNoConversationsYet: "لا توجد محادثات بعد",
    aiChatStartChatting: "ابدأ المحادثة لإنشاء واحدة!",
    aiChatRecentChats: "المحادثات الأخيرة",
    aiChatDeleteConversation: "حذف المحادثة",
    aiChatDeleteConversationTitle: "حذف المحادثة؟",
    aiChatDeleteConversationMessage: "هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.",
    aiChatUniNestAssistant: "مساعد UniNest",
    aiChatPropertyExpert: "خبير العقارات",
    aiChatYourCaringAssistant: "مساعدك المهتم",
    aiChatPropertyMarketingExpert: "خبير تسويق العقارات",
    aiChatWhatCanIHelp: "كيف يمكنني المساعدة؟",
    aiChatHowCanIHelpProperty: "كيف يمكنني مساعدة عقارك؟",
    aiChatStudentDescription: "اسألني عن الطبخ، التنظيف، الميزانية، أو أي نصائح للحياة الطلابية!",
    aiChatLandlordDescription: "احصل على نصائح الخبراء حول التسويق والتسعير وإدارة المستأجرين.",
    aiChatAskMeAnything: "اسألني أي شيء...",
    aiChatHowCanIHelpPropertyInput: "كيف يمكنني المساعدة في عقارك؟",
    aiChatCanMakeMistakes: "قد يرتكب أخطاء. يرجى التحقق من المعلومات المهمة.",
    aiChatNewConversation: "محادثة جديدة",
    aiChatJustNow: "الآن",
    aiChatMinutesAgo: "د",
    aiChatHoursAgo: "س",
    aiChatDaysAgo: "ي",
    aiChatMessages: "رسالة",
    aiChatConversations: "المحادثات",
    aiChatWelcomeStudent: "مرحباً! أنا هنا للمساعدة!",
    aiChatWelcomeProperty: "خبير العقارات في خدمتك",
    
    // Messages
    noMessages: "لا توجد رسائل بعد",
    typeMessage: "اكتب رسالة...",
    sendMessage: "إرسال",
    
    // Notifications
    noNotifications: "لا توجد إشعارات بعد",
    markAllRead: "تحديد الكل كمقروء",
    
    // Errors & Validation
    requiredField: "هذا الحقل مطلوب",
    invalidEmail: "عنوان بريد إلكتروني غير صالح",
    invalidPhone: "رقم هاتف غير صالح",
    passwordTooShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة",
    somethingWentWrong: "حدث خطأ ما",
    tryAgain: "حاول مرة أخرى",
    
    // Success Messages
    success: "نجح",
    savedSuccessfully: "تم الحفظ بنجاح",
    deletedSuccessfully: "تم الحذف بنجاح",
    updatedSuccessfully: "تم التحديث بنجاح",
    createdSuccessfully: "تم الإنشاء بنجاح",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('preferredLanguage');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
        setLanguage(savedLanguage);
        if (savedLanguage === 'ar') {
          I18nManager.forceRTL(true);
        }
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  const toggleLanguage = async () => {
    setIsChangingLanguage(true);
    const newLang = language === 'en' ? 'ar' : 'en';
    try {
      await AsyncStorage.setItem('preferredLanguage', newLang);
      setLanguage(newLang);
      
      // Note: RTL changes require app restart in React Native
      if (newLang === 'ar' && !I18nManager.isRTL) {
        I18nManager.forceRTL(true);
      } else if (newLang === 'en' && I18nManager.isRTL) {
        I18nManager.forceRTL(false);
      }
    } catch (error) {
      console.error('Failed to save language:', error);
    } finally {
      setTimeout(() => setIsChangingLanguage(false), 300);
    }
  };

  const changeLanguage = async (lang: string) => {
    if (lang === 'en' || lang === 'ar') {
      setIsChangingLanguage(true);
      try {
        await AsyncStorage.setItem('preferredLanguage', lang);
        setLanguage(lang);
        
        // Note: RTL changes require app restart in React Native
        if (lang === 'ar' && !I18nManager.isRTL) {
          I18nManager.forceRTL(true);
        } else if (lang === 'en' && I18nManager.isRTL) {
          I18nManager.forceRTL(false);
        }
      } catch (error) {
        console.error('Failed to save language:', error);
      } finally {
        setTimeout(() => setIsChangingLanguage(false), 300);
      }
    }
  };

  const t = (key: string): string => {
    return (translations as any)[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, changeLanguage, t, isChangingLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
