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
    
    // Additional Home Screen
    welcomeBackShort: "Welcome back",
    searchProperties: "Search properties...",
    browseProperties: "Browse Properties",
    communityPosts: "Community Posts",
    featuredProperties: "Featured Properties",
    noCommunityPosts: "No community posts yet",
    noPropertiesAvailable: "No properties available",
    noImage: "No Image",
    month: "month",
    by: "by",
    
    // Additional Messages Screen
    noConversationsYet: "No conversations yet",
    startConversationHint: "Start a conversation by contacting a landlord on a property listing",
    
    // Additional Notifications Screen
    noNotificationsYet: "No notifications",
    notificationsHint: "You'll see notifications about your activity here",
    
    // Additional Settings Screen
    deleteAccountConfirm: "Delete Account",
    deleteAccountMessage: "Are you sure you want to delete your account? This action cannot be undone.",
    languageChanged: "Language Changed",
    languageChangeHint: "Please restart the app for the language change to take full effect.",
    
    // Additional Profile Screen
    darkMode: "Dark Mode",
    about: "About",
    helpSupport: "Help & Support",
    signOutConfirm: "Are you sure you want to sign out?",
    
    // Additional Roommate Screens
    deleteProfile: "Delete Profile",
    deleteRoommateProfileConfirm: "Are you sure you want to delete your roommate profile?",
    deleteMatch: "Delete Match",
    deleteMatchConfirm: "Are you sure you want to delete this match?",
    
    // Additional Property Screens
    deleteListingConfirm: "Are you sure you want to delete this listing?",
    deletePostConfirm: "Are you sure you want to delete this post?",
    
    // Property Listing Form
    titlePlaceholder: "e.g., Cozy 2BR near campus",
    descriptionPlaceholder: "Describe the place, amenities, nearby spots...",
    monthlyPrice: "Monthly Price",
    pricePlaceholder: "1500",
    sizePlaceholder: "80",
    leaseDurationPlaceholder: "e.g., 12 months",
    selectPropertyType: "Select property type",
    selectCurrency: "Select currency",
    selectListingDuration: "Select listing duration",
    addPhotos: "Add Photos",
    selectLocation: "Select Location",
    locationOnMap: "Location on Map",
    tapToSelectLocation: "Tap on the map to select a location",
    useCurrentLocation: "Use Current Location",
    confirmLocation: "Confirm Location",
    
    // Validation & Errors
    permissionRequired: "Permission Required",
    photoLibraryPermission: "Please allow access to your photo library.",
    permissionDenied: "Permission Denied",
    locationPermission: "Please allow location access to use this feature.",
    failedToGetLocation: "Failed to get current location. Please try again.",
    noLocationSelected: "No Location Selected",
    tapMapToSelect: "Please tap on the map to select a location.",
    pleaseEnterTitle: "Please enter a title",
    pleaseEnterDescription: "Please enter a description",
    pleaseEnterPrice: "Please enter a price",
    pleaseEnterSize: "Please enter the size",
    pleaseEnterLeaseDuration: "Please enter lease duration",
    pleaseSelectUniversity: "Please select a university",
    pleaseAddImage: "Please add at least one image",
    listingCreatedSuccess: "Listing created successfully!",
    failedToCreateListing: "Failed to create listing",
    listingUpdatedSuccess: "Listing updated successfully!",
    failedToUpdateListing: "Failed to update listing",
    
    // Filters & Search
    priceRange: "Price Range",
    applyFilters: "Apply Filters",
    clearFilters: "Clear Filters",
    showAllUniversities: "Show All Universities",
    showMyUniversity: "Show My University",
    
    // Community
    unableToLoadPosts: "Unable to load posts. Please try again.",
    
    // Common Actions
    contactSeller: "Contact Seller",
    contactLandlord: "Contact Landlord",
    
    // Property Details Screen
    reviews: "Reviews",
    propertyVideo: "Property Video",
    noImageAvailable: "No Image Available",
    panorama360: "360° Panorama",
    toUniversity: "to university",
    noReviewsYet: "No reviews yet",
    beFirstToReview: "Be the first to review this property",
    propertyNotFound: "Property not found",
    bed: "Bed",
    beds: "Beds",
    bath: "Bath",
    baths: "Baths",
    
    // Roommate Matches Screen
    matchRequests: "Match Requests",
    manageMatchRequests: "Manage your roommate match requests",
    compatible: "Compatible",
    accepted: "Accepted",
    rejected: "Rejected",
    pending: "Pending",
    yourMessage: "Your message:",
    theirMessage: "Their message:",
    accept: "Accept",
    reject: "Reject",
    noMatchRequests: "No Match Requests",
    noMatchRequestsHint: "You don't have any match requests yet. Start connecting with potential roommates!",
    matchRequestAccepted: "Match request accepted!",
    matchRequestRejected: "Match request rejected",
    matchDeleted: "Match deleted",
    failedToRespondMatch: "Failed to respond to match request",
    failedToDeleteMatch: "Failed to delete match",
    
    // Roommate Profile Screen
    roommateProfileTitle: "Roommate Profile",
    profileActive: "Profile Active",
    aboutYou: "About You",
    bio: "Bio",
    bioPlaceholder: "Tell potential roommates about yourself...",
    budgetRange: "Budget Range (NIS/month)",
    min: "Min",
    max: "Max",
    academic: "Academic",
    major: "Major",
    studyHabits: "Study Habits",
    interests: "Interests",
    livingPreferences: "Living Preferences",
    cleanlinessLevel: "Cleanliness Level",
    noiseTolerance: "Noise Tolerance",
    sleepSchedule: "Sleep Schedule",
    guestsPolicy: "Guests Policy",
    smokingAllowed: "Smoking Allowed",
    petsAllowed: "Pets Allowed",
    matchingPriorities: "Matching Priorities",
    matchingPrioritiesHint: "Set how important each factor is when matching (1 = Not Important, 5 = Very Important)",
    budgetPriority: "Budget Priority",
    cleanlinessPriority: "Cleanliness Priority",
    noisePriority: "Noise Priority",
    sleepSchedulePriority: "Sleep Schedule Priority",
    studyHabitsPriority: "Study Habits Priority",
    interestsPriority: "Interests Priority",
    majorPriority: "Major Priority",
    smokingPriority: "Smoking Priority",
    petsPriority: "Pets Priority",
    guestsPriority: "Guests Priority",
    updateProfile: "Update Profile",
    createProfile: "Create Profile",
    deleteProfileButton: "Delete Profile",
    profileSavedSuccess: "Roommate profile saved successfully",
    profileDeletedSuccess: "Roommate profile deleted",
    enterBudgetRange: "Please enter your budget range",
    failedToSaveProfile: "Failed to save profile",
    failedToDeleteProfile: "Failed to delete profile",
    level: "Level",
    
    // Sleep/Study/Guests Options
    early: "Early",
    normal: "Normal",
    late: "Late",
    studyAtHome: "Home",
    mixed: "Mixed",
    library: "Library",
    never: "Never",
    rarely: "Rarely",
    sometimes: "Sometimes",
    often: "Often",
    
    // Major Options
    majorEngineering: "Engineering",
    majorComputerScience: "Computer Science",
    majorMedicine: "Medicine",
    majorBusiness: "Business",
    majorLaw: "Law",
    majorArts: "Arts",
    majorScience: "Science",
    majorEducation: "Education",
    
    // Interest Options
    interestSports: "Sports",
    interestGaming: "Gaming",
    interestReading: "Reading",
    interestMusic: "Music",
    interestCooking: "Cooking",
    interestFitness: "Fitness",
    interestMovies: "Movies",
    interestTravel: "Travel",
    
    // Marketplace Item Details Screen
    itemDetails: "Item Details",
    itemNotFound: "Item not found",
    unableToLoadItem: "Unable to load item details. Please try again.",
    sellerInformation: "Seller Information",
    listed: "Listed",
    sellerNotAvailable: "Seller information is not available.",
    ownListing: "This is your own listing.",
    unableToOpenMessages: "Unable to open messages. Please try again.",
    
    // About Screen
    aboutTitle: "About",
    version: "Version",
    aboutDescription: "UniNest is your trusted platform for finding student housing. We connect students with verified landlords to make finding your perfect home easier and safer.",
    contactUs: "Contact Us",
    visitWebsite: "Visit Website",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    allRightsReserved: "All rights reserved.",
    
    // Help Screen
    helpTitle: "Help & Support",
    faq: "Frequently Asked Questions",
    contactSupport: "Contact Support",
    liveChat: "Live Chat",
    availableHours: "Available 9am - 5pm",
    
    // FAQ Questions
    faqSearchProperties: "How do I search for properties?",
    faqSearchPropertiesAnswer: "Use the Properties tab to browse available listings. You can filter by location, price, number of bedrooms, and more using the filter options at the top of the screen.",
    faqContactLandlord: "How do I contact a landlord?",
    faqContactLandlordAnswer: "On any property listing, tap the \"Contact\" or \"Message\" button to start a conversation with the landlord directly through our messaging system.",
    faqSaveProperties: "How do I save properties I like?",
    faqSavePropertiesAnswer: "Tap the heart icon on any property listing to add it to your favorites. You can view all your saved properties in the Favorites section of your profile.",
    faqListProperty: "How do I list my property?",
    faqListPropertyAnswer: "Go to your Profile, then tap \"My Listings\" and use the + button to create a new listing. Fill in the property details, add photos, and publish.",
    faqSecure: "Is my information secure?",
    faqSecureAnswer: "Yes, we use industry-standard encryption to protect your personal information. We never share your data with third parties without your consent.",
    faqReport: "How do I report a problem?",
    faqReportAnswer: "You can report issues by contacting our support team via email at support@uninest.com or by using the contact options below.",
    
    // Edit Profile Screen
    editProfileTitle: "Edit Profile",
    enterFirstName: "Enter first name",
    enterLastName: "Enter last name",
    enterPhoneNumber: "Enter phone number",
    failedToUploadPicture: "Failed to upload profile picture.",
    failedToUpdateProfile: "Failed to update profile.",
    
    // Favorites Screen
    favoritesTitle: "Favorites",
    noFavoritesYet: "No favorites yet",
    startExploringFavorites: "Start exploring properties and save your favorites here",
    noImageText: "No Image",
    perMonth: "/mo",
    
    // My Listings Screen
    myListingsTitle: "My Listings",
    propertiesTab: "Properties",
    postsTab: "Posts",
    marketplaceTab: "Marketplace",
    hidden: "Hidden",
    hide: "Hide",
    show: "Show",
    noListingsYet: "No listings yet",
    noPostsYet: "No posts yet",
    createFirstPost: "Create your first post to start sharing",
    createFirstMarketplace: "Create your first marketplace listing",
    createFirstProperty: "Create your first property listing to start renting",
    failedToUpdateVisibility: "Failed to update visibility.",
    failedToDelete: "Failed to delete.",
    
    // Properties Screen
    noPropertiesFound: "No properties found",
    adjustFiltersHint: "Try adjusting your filters or check back later for new listings",
    showMyUniversityOnly: "Show My University Only",
    
    // Roommates Screen
    findRoommatesTitle: "Find Roommates",
    topCompatibleMatches: "Top 10 compatible matches for you",
    createProfileFirst: "Create Your Profile First",
    createProfileHint: "Set up your roommate profile to start matching with potential roommates",
    noRoommatesFound: "No Roommates Found",
    noRoommatesHint: "Try adjusting your preferences or check back later",
    notSpecified: "Not specified",
    earlyBird: "Early Bird",
    nightOwl: "Night Owl",
    sameMajor: "Same Major",
    
    // Roommate Detail Screen
    aboutMe: "About Me",
    noBioProvided: "No bio provided",
    cleanliness: "Cleanliness",
    sleep: "Sleep",
    study: "Study",
    guests: "Guests",
    relaxed: "Relaxed",
    flexible: "Flexible",
    moderate: "Moderate",
    clean: "Clean",
    veryClean: "Very Clean",
    atHome: "At Home",
    connectAsRoommate: "Connect as Roommate",
    requestSent: "Request Sent!",
    sendMatchRequest: "Send Match Request",
    sendMessageTo: "Send a message to",
    toIntroduceYourself: "to introduce yourself",
    writeMessage: "Write a message... (optional)",
    sendRequest: "Send Request",
    matchRequestSentSuccess: "Match request sent successfully!",
    failedToSendMatchRequest: "Failed to send match request",
    
    // Marketplace Screen
    marketplaceTitle: "Marketplace",
    searchItems: "Search items...",
    noItemsFound: "No items found",
    checkBackLater: "Check back later for new marketplace listings",
    
    // Add Marketplace Item Screen
    addMarketplaceItem: "Add Marketplace Item",
    titleRequired: "Title *",
    itemTitlePlaceholder: "Item title",
    describeYourItem: "Describe your item...",
    priceNIS: "Price (NIS) *",
    location: "Location",
    locationPlaceholder: "e.g., Nablus, Near campus",
    condition: "Condition",
    category: "Category",
    imagesMax: "Images (Max 5)",
    listItem: "List Item",
    pleaseFillTitlePrice: "Please fill in title and price",
    itemListedSuccess: "Item listed successfully!",
    failedToCreateItem: "Failed to create listing",
    
    // Condition Options
    conditionGood: "Good",
    conditionFair: "Fair",
    conditionPoor: "Poor",
    
    // Category Options
    categoryFurniture: "Furniture",
    categoryElectronics: "Electronics",
    categoryBooks: "Books",
    categoryClothing: "Clothing",
    categorySports: "Sports",
    categoryOther: "Other",
    
    // Community Screen
    communityTitle: "Community",
    newPost: "New Post",
    pinned: "Pinned",
    all: "All",
    general: "General",
    housing: "Housing",
    tips: "Tips",
    questions: "Questions",
    
    // Create Post Screen
    createPostTitle: "Create Post",
    post: "Post",
    title: "Title",
    enterPostTitle: "Enter post title",
    content: "Content",
    whatsOnYourMind: "What's on your mind?",
    pleaseEnterTitlePost: "Please enter a title",
    pleaseEnterContent: "Please enter content",
    postCreatedSuccess: "Post created successfully",
    failedToCreatePost: "Failed to create post",
    
    // Post Details Screen
    postDetails: "Post Details",
    commentsCount: "Comments",
    noCommentsYet: "No comments yet. Be the first to comment!",
    writeComment: "Write a comment...",
    unableToLoadPost: "Unable to load post details. Please try again.",
    postNotFound: "Post not found",
    unableToUpdateVote: "Unable to update vote. Please try again.",
    unableToPostComment: "Unable to post comment. Please try again.",
    
    // Change Password Screen
    changePasswordTitle: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    updatePassword: "Update Password",
    passwordChangedSuccess: "Password changed successfully",
    failedToChangePassword: "Failed to change password",
    verifyYourEmail: "Verify Your Email",
    verifyEmailHint: "We'll send a verification code to your registered email address to confirm your identity.",
    sendVerificationCode: "Send Verification Code",
    verificationCodeSent: "Verification code sent to your email",
    failedToSendCode: "Failed to send verification code",
    setNewPassword: "Set New Password",
    setNewPasswordHint: "Enter the verification code sent to your email and create a new password.",
    verificationCode: "Verification Code",
    enterVerificationCode: "Enter 6-digit code",
    enterNewPassword: "Enter new password",
    confirmNewPasswordPlaceholder: "Confirm new password",
    pleaseEnterCode: "Please enter the verification code",
    resendCode: "Resend Code",
    
    // Notifications Screen
    notificationsTitle: "Notifications",
    
    // Messages Screen  
    messagesTitle: "Messages",
    
    // Property Reviews Screen
    propertyReviews: "Property Reviews",
    writeReview: "Write a Review",
    yourRating: "Your Rating",
    yourReview: "Your Review",
    shareYourExperience: "Share your experience...",
    submitReview: "Submit Review",
    pleaseSelectRating: "Please select a rating",
    reviewSubmittedSuccess: "Review submitted successfully",
    failedToSubmitReview: "Failed to submit review",
    
    // Sign In Screen
    signInTitle: "Sign In",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    signingIn: "Signing in...",
    invalidCredentials: "Invalid email or password",
    
    // Sign Up Screen
    signUpTitle: "Sign Up",
    confirmPassword: "Confirm Password",
    iAmA: "I am a",
    enterStudentId: "Enter your student ID",
    creatingAccount: "Creating account...",
    accountCreatedSuccess: "Account created successfully",
    failedToCreateAccount: "Failed to create account",
    
    // Add Listing Screen
    addListingTitle: "Add Listing",
    basicInfo: "Basic Information",
    propertyInfo: "Property Information",
    locationInfo: "Location",
    mediaInfo: "Media",
    createListing: "Create Listing",
    
    // Edit Listing Screen
    editListingTitle: "Edit Listing",
    updateListing: "Update Listing",
    
    // OK button
    ok: "OK",
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
    
    // Additional Home Screen
    welcomeBackShort: "مرحباً بعودتك",
    searchProperties: "البحث عن عقارات...",
    browseProperties: "تصفح العقارات",
    communityPosts: "منشورات المجتمع",
    featuredProperties: "العقارات المميزة",
    noCommunityPosts: "لا توجد منشورات مجتمعية بعد",
    noPropertiesAvailable: "لا توجد عقارات متاحة",
    noImage: "لا توجد صورة",
    month: "شهر",
    by: "بواسطة",
    
    // Additional Messages Screen
    noConversationsYet: "لا توجد محادثات بعد",
    startConversationHint: "ابدأ محادثة عن طريق التواصل مع مالك عقار في قائمة العقارات",
    
    // Additional Notifications Screen
    noNotificationsYet: "لا توجد إشعارات",
    notificationsHint: "سترى الإشعارات حول نشاطك هنا",
    
    // Additional Settings Screen
    deleteAccountConfirm: "حذف الحساب",
    deleteAccountMessage: "هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.",
    languageChanged: "تم تغيير اللغة",
    languageChangeHint: "يرجى إعادة تشغيل التطبيق لتطبيق تغيير اللغة بالكامل.",
    
    // Additional Profile Screen
    darkMode: "الوضع الداكن",
    about: "حول",
    helpSupport: "المساعدة والدعم",
    signOutConfirm: "هل أنت متأكد من تسجيل الخروج؟",
    
    // Additional Roommate Screens
    deleteProfile: "حذف الملف الشخصي",
    deleteRoommateProfileConfirm: "هل أنت متأكد من حذف ملف زميل السكن الخاص بك؟",
    deleteMatch: "حذف التطابق",
    deleteMatchConfirm: "هل أنت متأكد من حذف هذا التطابق؟",
    
    // Additional Property Screens
    deleteListingConfirm: "هل أنت متأكد من حذف هذه القائمة؟",
    deletePostConfirm: "هل أنت متأكد من حذف هذا المنشور؟",
    
    // Property Listing Form
    titlePlaceholder: "مثال: شقة مريحة بغرفتين بالقرب من الحرم الجامعي",
    descriptionPlaceholder: "صف المكان والمرافق والأماكن القريبة...",
    monthlyPrice: "السعر الشهري",
    pricePlaceholder: "1500",
    sizePlaceholder: "80",
    leaseDurationPlaceholder: "مثال: 12 شهر",
    selectPropertyType: "اختر نوع العقار",
    selectCurrency: "اختر العملة",
    selectListingDuration: "اختر مدة القائمة",
    addPhotos: "إضافة صور",
    selectLocation: "اختر الموقع",
    locationOnMap: "الموقع على الخريطة",
    tapToSelectLocation: "اضغط على الخريطة لاختيار موقع",
    useCurrentLocation: "استخدم الموقع الحالي",
    confirmLocation: "تأكيد الموقع",
    
    // Validation & Errors
    permissionRequired: "إذن مطلوب",
    photoLibraryPermission: "يرجى السماح بالوصول إلى مكتبة الصور الخاصة بك.",
    permissionDenied: "تم رفض الإذن",
    locationPermission: "يرجى السماح بالوصول إلى الموقع لاستخدام هذه الميزة.",
    failedToGetLocation: "فشل في الحصول على الموقع الحالي. يرجى المحاولة مرة أخرى.",
    noLocationSelected: "لم يتم اختيار موقع",
    tapMapToSelect: "يرجى الضغط على الخريطة لاختيار موقع.",
    pleaseEnterTitle: "يرجى إدخال العنوان",
    pleaseEnterDescription: "يرجى إدخال الوصف",
    pleaseEnterPrice: "يرجى إدخال السعر",
    pleaseEnterSize: "يرجى إدخال الحجم",
    pleaseEnterLeaseDuration: "يرجى إدخال مدة الإيجار",
    pleaseSelectUniversity: "يرجى اختيار جامعة",
    pleaseAddImage: "يرجى إضافة صورة واحدة على الأقل",
    listingCreatedSuccess: "تم إنشاء القائمة بنجاح!",
    failedToCreateListing: "فشل في إنشاء القائمة",
    listingUpdatedSuccess: "تم تحديث القائمة بنجاح!",
    failedToUpdateListing: "فشل في تحديث القائمة",
    
    // Filters & Search
    priceRange: "نطاق السعر",
    applyFilters: "تطبيق الفلاتر",
    clearFilters: "مسح الفلاتر",
    showAllUniversities: "عرض جميع الجامعات",
    showMyUniversity: "عرض جامعتي",
    
    // Community
    unableToLoadPosts: "تعذر تحميل المنشورات. يرجى المحاولة مرة أخرى.",
    
    // Common Actions
    contactSeller: "التواصل مع البائع",
    contactLandlord: "التواصل مع المالك",
    
    // Property Details Screen
    reviews: "التقييمات",
    propertyVideo: "فيديو العقار",
    noImageAvailable: "لا توجد صورة متاحة",
    panorama360: "بانوراما 360°",
    toUniversity: "إلى الجامعة",
    noReviewsYet: "لا توجد تقييمات بعد",
    beFirstToReview: "كن أول من يقيم هذا العقار",
    propertyNotFound: "العقار غير موجود",
    bed: "غرفة",
    beds: "غرف",
    bath: "حمام",
    baths: "حمامات",
    
    // Roommate Matches Screen
    matchRequests: "طلبات التطابق",
    manageMatchRequests: "إدارة طلبات التطابق مع زملاء السكن",
    compatible: "متوافق",
    accepted: "مقبول",
    rejected: "مرفوض",
    pending: "قيد الانتظار",
    yourMessage: "رسالتك:",
    theirMessage: "رسالتهم:",
    accept: "قبول",
    reject: "رفض",
    noMatchRequests: "لا توجد طلبات تطابق",
    noMatchRequestsHint: "ليس لديك أي طلبات تطابق بعد. ابدأ بالتواصل مع زملاء السكن المحتملين!",
    matchRequestAccepted: "تم قبول طلب التطابق!",
    matchRequestRejected: "تم رفض طلب التطابق",
    matchDeleted: "تم حذف التطابق",
    failedToRespondMatch: "فشل في الرد على طلب التطابق",
    failedToDeleteMatch: "فشل في حذف التطابق",
    
    // Roommate Profile Screen
    roommateProfileTitle: "ملف زميل السكن",
    profileActive: "الملف نشط",
    aboutYou: "عنك",
    bio: "نبذة",
    bioPlaceholder: "أخبر زملاء السكن المحتملين عن نفسك...",
    budgetRange: "نطاق الميزانية (شيكل/شهر)",
    min: "الحد الأدنى",
    max: "الحد الأقصى",
    academic: "الأكاديمي",
    major: "التخصص",
    studyHabits: "عادات الدراسة",
    interests: "الاهتمامات",
    livingPreferences: "تفضيلات السكن",
    cleanlinessLevel: "مستوى النظافة",
    noiseTolerance: "تحمل الضوضاء",
    sleepSchedule: "جدول النوم",
    guestsPolicy: "سياسة الضيوف",
    smokingAllowed: "التدخين مسموح",
    petsAllowed: "الحيوانات الأليفة مسموحة",
    matchingPriorities: "أولويات التطابق",
    matchingPrioritiesHint: "حدد مدى أهمية كل عامل عند التطابق (1 = غير مهم، 5 = مهم جداً)",
    budgetPriority: "أولوية الميزانية",
    cleanlinessPriority: "أولوية النظافة",
    noisePriority: "أولوية الضوضاء",
    sleepSchedulePriority: "أولوية جدول النوم",
    studyHabitsPriority: "أولوية عادات الدراسة",
    interestsPriority: "أولوية الاهتمامات",
    majorPriority: "أولوية التخصص",
    smokingPriority: "أولوية التدخين",
    petsPriority: "أولوية الحيوانات الأليفة",
    guestsPriority: "أولوية الضيوف",
    updateProfile: "تحديث الملف",
    createProfile: "إنشاء الملف",
    deleteProfileButton: "حذف الملف",
    profileSavedSuccess: "تم حفظ ملف زميل السكن بنجاح",
    profileDeletedSuccess: "تم حذف ملف زميل السكن",
    enterBudgetRange: "يرجى إدخال نطاق الميزانية",
    failedToSaveProfile: "فشل في حفظ الملف",
    failedToDeleteProfile: "فشل في حذف الملف",
    level: "المستوى",
    
    // Sleep/Study/Guests Options
    early: "مبكر",
    normal: "عادي",
    late: "متأخر",
    studyAtHome: "في المنزل",
    mixed: "مختلط",
    library: "المكتبة",
    never: "أبداً",
    rarely: "نادراً",
    sometimes: "أحياناً",
    often: "غالباً",
    
    // Major Options
    majorEngineering: "الهندسة",
    majorComputerScience: "علوم الحاسوب",
    majorMedicine: "الطب",
    majorBusiness: "إدارة الأعمال",
    majorLaw: "القانون",
    majorArts: "الفنون",
    majorScience: "العلوم",
    majorEducation: "التربية",
    
    // Interest Options
    interestSports: "الرياضة",
    interestGaming: "الألعاب",
    interestReading: "القراءة",
    interestMusic: "الموسيقى",
    interestCooking: "الطبخ",
    interestFitness: "اللياقة",
    interestMovies: "الأفلام",
    interestTravel: "السفر",
    
    // Marketplace Item Details Screen
    itemDetails: "تفاصيل العنصر",
    itemNotFound: "العنصر غير موجود",
    unableToLoadItem: "تعذر تحميل تفاصيل العنصر. يرجى المحاولة مرة أخرى.",
    sellerInformation: "معلومات البائع",
    listed: "تم النشر",
    sellerNotAvailable: "معلومات البائع غير متاحة.",
    ownListing: "هذا إعلانك الخاص.",
    unableToOpenMessages: "تعذر فتح الرسائل. يرجى المحاولة مرة أخرى.",
    
    // About Screen
    aboutTitle: "حول",
    version: "الإصدار",
    aboutDescription: "UniNest هي منصتك الموثوقة للعثور على سكن الطلاب. نحن نربط الطلاب بملاك العقارات الموثوقين لجعل العثور على منزلك المثالي أسهل وأكثر أماناً.",
    contactUs: "اتصل بنا",
    visitWebsite: "زيارة الموقع",
    termsOfService: "شروط الخدمة",
    privacyPolicy: "سياسة الخصوصية",
    allRightsReserved: "جميع الحقوق محفوظة.",
    
    // Help Screen
    helpTitle: "المساعدة والدعم",
    faq: "الأسئلة الشائعة",
    contactSupport: "التواصل مع الدعم",
    liveChat: "الدردشة المباشرة",
    availableHours: "متاح من 9 صباحاً - 5 مساءً",
    
    // FAQ Questions
    faqSearchProperties: "كيف أبحث عن العقارات؟",
    faqSearchPropertiesAnswer: "استخدم تبويب العقارات لتصفح القوائم المتاحة. يمكنك التصفية حسب الموقع والسعر وعدد غرف النوم والمزيد باستخدام خيارات التصفية في أعلى الشاشة.",
    faqContactLandlord: "كيف أتواصل مع المالك؟",
    faqContactLandlordAnswer: "في أي قائمة عقار، اضغط على زر \"اتصل\" أو \"رسالة\" لبدء محادثة مع المالك مباشرة من خلال نظام الرسائل لدينا.",
    faqSaveProperties: "كيف أحفظ العقارات التي أعجبتني؟",
    faqSavePropertiesAnswer: "اضغط على أيقونة القلب في أي قائمة عقار لإضافتها إلى المفضلة. يمكنك عرض جميع العقارات المحفوظة في قسم المفضلة في ملفك الشخصي.",
    faqListProperty: "كيف أعرض عقاري؟",
    faqListPropertyAnswer: "اذهب إلى ملفك الشخصي، ثم اضغط على \"قوائمي\" واستخدم زر + لإنشاء قائمة جديدة. املأ تفاصيل العقار وأضف الصور وانشر.",
    faqSecure: "هل معلوماتي آمنة؟",
    faqSecureAnswer: "نعم، نستخدم تشفيراً بمعايير الصناعة لحماية معلوماتك الشخصية. لا نشارك بياناتك مع أطراف ثالثة دون موافقتك.",
    faqReport: "كيف أبلغ عن مشكلة؟",
    faqReportAnswer: "يمكنك الإبلاغ عن المشاكل عن طريق التواصل مع فريق الدعم عبر البريد الإلكتروني support@uninest.com أو باستخدام خيارات الاتصال أدناه.",
    
    // Edit Profile Screen
    editProfileTitle: "تعديل الملف الشخصي",
    enterFirstName: "أدخل الاسم الأول",
    enterLastName: "أدخل اسم العائلة",
    enterPhoneNumber: "أدخل رقم الهاتف",
    failedToUploadPicture: "فشل في رفع صورة الملف الشخصي.",
    failedToUpdateProfile: "فشل في تحديث الملف الشخصي.",
    
    // Favorites Screen
    favoritesTitle: "المفضلة",
    noFavoritesYet: "لا توجد مفضلات بعد",
    startExploringFavorites: "ابدأ باستكشاف العقارات واحفظ مفضلاتك هنا",
    noImageText: "لا توجد صورة",
    perMonth: "/شهر",
    
    // My Listings Screen
    myListingsTitle: "قوائمي",
    propertiesTab: "العقارات",
    postsTab: "المنشورات",
    marketplaceTab: "السوق",
    hidden: "مخفي",
    hide: "إخفاء",
    show: "إظهار",
    noListingsYet: "لا توجد قوائم بعد",
    noPostsYet: "لا توجد منشورات بعد",
    createFirstPost: "أنشئ أول منشور لك للبدء بالمشاركة",
    createFirstMarketplace: "أنشئ أول قائمة سوق لك",
    createFirstProperty: "أنشئ أول قائمة عقار لك للبدء بالتأجير",
    failedToUpdateVisibility: "فشل في تحديث الرؤية.",
    failedToDelete: "فشل في الحذف.",
    
    // Properties Screen
    noPropertiesFound: "لم يتم العثور على عقارات",
    adjustFiltersHint: "حاول تعديل الفلاتر أو تحقق لاحقاً للقوائم الجديدة",
    showMyUniversityOnly: "عرض جامعتي فقط",
    
    // Roommates Screen
    findRoommatesTitle: "البحث عن زملاء سكن",
    topCompatibleMatches: "أفضل 10 تطابقات متوافقة لك",
    createProfileFirst: "أنشئ ملفك أولاً",
    createProfileHint: "قم بإعداد ملف زميل السكن الخاص بك للبدء في التطابق مع زملاء السكن المحتملين",
    noRoommatesFound: "لم يتم العثور على زملاء سكن",
    noRoommatesHint: "حاول تعديل تفضيلاتك أو تحقق لاحقاً",
    notSpecified: "غير محدد",
    earlyBird: "صباحي",
    nightOwl: "ليلي",
    sameMajor: "نفس التخصص",
    
    // Roommate Detail Screen
    aboutMe: "عني",
    noBioProvided: "لم يتم تقديم نبذة",
    cleanliness: "النظافة",
    sleep: "النوم",
    study: "الدراسة",
    guests: "الضيوف",
    relaxed: "مريح",
    flexible: "مرن",
    moderate: "معتدل",
    clean: "نظيف",
    veryClean: "نظيف جداً",
    atHome: "في المنزل",
    connectAsRoommate: "التواصل كزميل سكن",
    requestSent: "تم إرسال الطلب!",
    sendMatchRequest: "إرسال طلب تطابق",
    sendMessageTo: "أرسل رسالة إلى",
    toIntroduceYourself: "لتقديم نفسك",
    writeMessage: "اكتب رسالة... (اختياري)",
    sendRequest: "إرسال الطلب",
    matchRequestSentSuccess: "تم إرسال طلب التطابق بنجاح!",
    failedToSendMatchRequest: "فشل في إرسال طلب التطابق",
    
    // Marketplace Screen
    marketplaceTitle: "السوق",
    searchItems: "البحث عن العناصر...",
    noItemsFound: "لم يتم العثور على عناصر",
    checkBackLater: "تحقق لاحقاً للقوائم الجديدة في السوق",
    
    // Add Marketplace Item Screen
    addMarketplaceItem: "إضافة عنصر للسوق",
    titleRequired: "العنوان *",
    itemTitlePlaceholder: "عنوان العنصر",
    describeYourItem: "صف العنصر الخاص بك...",
    priceNIS: "السعر (شيكل) *",
    location: "الموقع",
    locationPlaceholder: "مثال: نابلس، بالقرب من الحرم الجامعي",
    condition: "الحالة",
    category: "الفئة",
    imagesMax: "الصور (بحد أقصى 5)",
    listItem: "إدراج العنصر",
    pleaseFillTitlePrice: "يرجى ملء العنوان والسعر",
    itemListedSuccess: "تم إدراج العنصر بنجاح!",
    failedToCreateItem: "فشل في إنشاء القائمة",
    
    // Condition Options
    conditionGood: "جيد",
    conditionFair: "مقبول",
    conditionPoor: "سيء",
    
    // Category Options
    categoryFurniture: "أثاث",
    categoryElectronics: "إلكترونيات",
    categoryBooks: "كتب",
    categoryClothing: "ملابس",
    categorySports: "رياضة",
    categoryOther: "أخرى",
    
    // Community Screen
    communityTitle: "المجتمع",
    newPost: "منشور جديد",
    pinned: "مثبت",
    all: "الكل",
    general: "عام",
    housing: "السكن",
    tips: "نصائح",
    questions: "أسئلة",
    
    // Create Post Screen
    createPostTitle: "إنشاء منشور",
    post: "نشر",
    title: "العنوان",
    enterPostTitle: "أدخل عنوان المنشور",
    content: "المحتوى",
    whatsOnYourMind: "ما الذي يدور في ذهنك؟",
    pleaseEnterTitlePost: "يرجى إدخال عنوان",
    pleaseEnterContent: "يرجى إدخال محتوى",
    postCreatedSuccess: "تم إنشاء المنشور بنجاح",
    failedToCreatePost: "فشل في إنشاء المنشور",
    
    // Post Details Screen
    postDetails: "تفاصيل المنشور",
    commentsCount: "التعليقات",
    noCommentsYet: "لا توجد تعليقات بعد. كن أول من يعلق!",
    writeComment: "اكتب تعليقاً...",
    unableToLoadPost: "تعذر تحميل تفاصيل المنشور. يرجى المحاولة مرة أخرى.",
    postNotFound: "المنشور غير موجود",
    unableToUpdateVote: "تعذر تحديث التصويت. يرجى المحاولة مرة أخرى.",
    unableToPostComment: "تعذر نشر التعليق. يرجى المحاولة مرة أخرى.",
    
    // Change Password Screen
    changePasswordTitle: "تغيير كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    updatePassword: "تحديث كلمة المرور",
    passwordChangedSuccess: "تم تغيير كلمة المرور بنجاح",
    failedToChangePassword: "فشل في تغيير كلمة المرور",
    verifyYourEmail: "تحقق من بريدك الإلكتروني",
    verifyEmailHint: "سنرسل رمز التحقق إلى عنوان بريدك الإلكتروني المسجل لتأكيد هويتك.",
    sendVerificationCode: "إرسال رمز التحقق",
    verificationCodeSent: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
    failedToSendCode: "فشل في إرسال رمز التحقق",
    setNewPassword: "تعيين كلمة مرور جديدة",
    setNewPasswordHint: "أدخل رمز التحقق المرسل إلى بريدك الإلكتروني وأنشئ كلمة مرور جديدة.",
    verificationCode: "رمز التحقق",
    enterVerificationCode: "أدخل الرمز المكون من 6 أرقام",
    enterNewPassword: "أدخل كلمة المرور الجديدة",
    confirmNewPasswordPlaceholder: "تأكيد كلمة المرور الجديدة",
    pleaseEnterCode: "يرجى إدخال رمز التحقق",
    resendCode: "إعادة إرسال الرمز",
    
    // Notifications Screen
    notificationsTitle: "الإشعارات",
    
    // Messages Screen  
    messagesTitle: "الرسائل",
    
    // Property Reviews Screen
    propertyReviews: "تقييمات العقار",
    writeReview: "اكتب تقييماً",
    yourRating: "تقييمك",
    yourReview: "مراجعتك",
    shareYourExperience: "شارك تجربتك...",
    submitReview: "إرسال التقييم",
    pleaseSelectRating: "يرجى اختيار تقييم",
    reviewSubmittedSuccess: "تم إرسال التقييم بنجاح",
    failedToSubmitReview: "فشل في إرسال التقييم",
    
    // Sign In Screen
    signInTitle: "تسجيل الدخول",
    enterEmail: "أدخل بريدك الإلكتروني",
    enterPassword: "أدخل كلمة المرور",
    signingIn: "جاري تسجيل الدخول...",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    
    // Sign Up Screen
    signUpTitle: "إنشاء حساب",
    confirmPassword: "تأكيد كلمة المرور",
    iAmA: "أنا",
    enterStudentId: "أدخل رقم الطالب",
    creatingAccount: "جاري إنشاء الحساب...",
    accountCreatedSuccess: "تم إنشاء الحساب بنجاح",
    failedToCreateAccount: "فشل في إنشاء الحساب",
    
    // Add Listing Screen
    addListingTitle: "إضافة قائمة",
    basicInfo: "المعلومات الأساسية",
    propertyInfo: "معلومات العقار",
    locationInfo: "الموقع",
    mediaInfo: "الوسائط",
    createListing: "إنشاء القائمة",
    
    // Edit Listing Screen
    editListingTitle: "تعديل القائمة",
    updateListing: "تحديث القائمة",
    
    // OK button
    ok: "موافق",
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
