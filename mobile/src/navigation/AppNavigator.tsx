import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserIcon as UserIconSolid,
} from 'react-native-heroicons/solid';

// Auth Screens
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// General Screens
import HomeScreen from '../screens/general/HomeScreen';
import MessagesScreen from '../screens/general/MessagesScreen';
import AboutScreen from '../screens/general/AboutScreen';
import HelpScreen from '../screens/general/HelpScreen';
import AIChatScreen from '../screens/general/AIChatScreen';

// Property Screens
import PropertiesScreen from '../screens/property/PropertiesScreen';
import PropertyDetailsScreen from '../screens/property/PropertyDetailsScreen';
import PropertyReviewsScreen from '../screens/property/PropertyReviewsScreen';
import AddListingScreen from '../screens/property/AddListingScreen';
import EditListingScreen from '../screens/property/EditListingScreen';
import MyListingsScreen from '../screens/property/MyListingsScreen';

// Marketplace Screens
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import MarketplaceItemDetailsScreen from '../screens/marketplace/MarketplaceItemDetailsScreen';
import AddMarketplaceItemScreen from '../screens/marketplace/AddMarketplaceItemScreen';

// Community Screens
import CommunityScreen from '../screens/community/CommunityScreen';
import CreatePostScreen from '../screens/community/CreatePostScreen';
import PostDetailsScreen from '../screens/community/PostDetailsScreen';

// Roommate Screens
import RoommatesScreen from '../screens/roommate/RoommatesScreen';
import RoommateProfileScreen from '../screens/roommate/RoommateProfileScreen';
import RoommateDetailScreen from '../screens/roommate/RoommateDetailScreen';
import RoommateMatchesScreen from '../screens/roommate/RoommateMatchesScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import FavoritesScreen from '../screens/profile/FavoritesScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom, 0),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <HomeIconSolid size={24} color={color} />
            ) : (
              <HomeIcon size={24} color={color} />
            ),
        }}
      />
      <Tab.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{
          tabBarLabel: t('properties'),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <MagnifyingGlassIconSolid size={24} color={color} />
            ) : (
              <MagnifyingGlassIcon size={24} color={color} />
            ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: t('messages'),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <ChatBubbleLeftRightIconSolid size={24} color={color} />
            ) : (
              <ChatBubbleLeftRightIcon size={24} color={color} />
            ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <UserIconSolid size={24} color={color} />
            ) : (
              <UserIcon size={24} color={color} />
            ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="Roommates" component={RoommatesScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="MyListings" component={MyListingsScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="RoommateProfile" component={RoommateProfileScreen} />
            <Stack.Screen name="RoommateDetail" component={RoommateDetailScreen} />
            <Stack.Screen name="RoommateMatches" component={RoommateMatchesScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="AddListing" component={AddListingScreen} />
            <Stack.Screen name="AddMarketplaceItem" component={AddMarketplaceItemScreen} />
            <Stack.Screen name="PropertyReviews" component={PropertyReviewsScreen} />
            <Stack.Screen name="MarketplaceItemDetails" component={MarketplaceItemDetailsScreen} />
            <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
            <Stack.Screen name="EditListing" component={EditListingScreen} />
            <Stack.Screen name="AIChat" component={AIChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
