import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PencilSquareIcon,
  HomeModernIcon,
  HeartIcon,
  MoonIcon,
  BellIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  SparklesIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileScreen({ navigation }: any) {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, signout } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert(
      t('logout'),
      'Are you sure you want to sign out?',
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('logout'), 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signout();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          }
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      paddingTop: insets.top + 10,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
      overflow: 'hidden',
    },
    avatarImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    avatarText: {
      fontSize: 40,
      fontWeight: 'bold',
      color: colors.primary,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 5,
    },
    email: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    section: {
      marginTop: 20,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    sectionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionItemLast: {
      borderBottomWidth: 0,
    },
    sectionItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      marginRight: 12,
    },
    sectionText: {
      fontSize: 16,
      color: colors.text,
    },
    signOutButton: {
      margin: 20,
      marginBottom: Math.max(insets.bottom + 20, 40),
      padding: 16,
      backgroundColor: colors.error,
      borderRadius: 12,
      alignItems: 'center',
    },
    signOutText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {user?.profilePictureUrl || (user as any)?.avatarUrl ? (
          <Image source={{ uri: user?.profilePictureUrl || (user as any)?.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
        )}
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionItem}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionItemLeft}>
            <PencilSquareIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>{t('editProfile')}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionItem}
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionItemLeft}>
            <SparklesIcon size={22} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionText, { color: colors.primary, fontWeight: '600' }]}>
              {user?.role === 'Student' ? t('aiChatUniNestAssistant') : t('aiChatPropertyExpert')}
            </Text>
          </View>
          <ChevronRightIcon size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* My Listings - Only for Landlord and SuperAdmin */}
        {(user?.role === 'Landlord' || user?.role === 'SuperAdmin') && (
          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => navigation.navigate('MyListings')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionItemLeft}>
              <HomeModernIcon size={22} color={colors.text} style={styles.sectionIcon} />
              <Text style={styles.sectionText}>{t('myListings')}</Text>
            </View>
            <ChevronRightIcon size={20} color={colors.secondary} />
          </TouchableOpacity>
        )}

        {/* Roommate Profile - Only for Students */}
        {user?.role === 'Student' && (
          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => navigation.navigate('RoommateProfile')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionItemLeft}>
              <UserGroupIcon size={22} color={colors.text} style={styles.sectionIcon} />
              <Text style={styles.sectionText}>{t('roommateProfile')}</Text>
            </View>
            <ChevronRightIcon size={20} color={colors.secondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.sectionItem, styles.sectionItemLast]}
          onPress={() => navigation.navigate('Favorites')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionItemLeft}>
            <HeartIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>{t('favorites')}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionItem}>
          <View style={styles.sectionItemLeft}>
            <MoonIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Dark Mode</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <TouchableOpacity
          style={styles.sectionItem}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionItemLeft}>
            <BellIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>{t('notifications')}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sectionItem, styles.sectionItemLast]}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionItemLeft}>
            <Cog6ToothIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>{t('settings')}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionItem}
          onPress={() => navigation.navigate('About')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionItemLeft}>
            <InformationCircleIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>About</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sectionItem, styles.sectionItemLast]}
          onPress={() => navigation.navigate('Help')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionItemLeft}>
            <QuestionMarkCircleIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Help & Support</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ArrowRightOnRectangleIcon size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>{t('logout')}</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

