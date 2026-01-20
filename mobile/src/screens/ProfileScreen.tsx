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
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, signout } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signout },
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
      paddingTop: 60,
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
        {user?.profilePictureUrl ? (
          <Image source={{ uri: user.profilePictureUrl }} style={styles.avatar} />
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
        >
          <View style={styles.sectionItemLeft}>
            <PencilSquareIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Edit Profile</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionItem}
          onPress={() => navigation.navigate('MyListings')}
        >
          <View style={styles.sectionItemLeft}>
            <HomeModernIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>My Listings</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sectionItem, styles.sectionItemLast]}
          onPress={() => navigation.navigate('Favorites')}
        >
          <View style={styles.sectionItemLeft}>
            <HeartIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Favorites</Text>
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
        >
          <View style={styles.sectionItemLeft}>
            <BellIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Notifications</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sectionItem, styles.sectionItemLast]}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.sectionItemLeft}>
            <Cog6ToothIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Settings</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionItem}
          onPress={() => navigation.navigate('About')}
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
        >
          <View style={styles.sectionItemLeft}>
            <QuestionMarkCircleIcon size={22} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Help & Support</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ArrowRightOnRectangleIcon size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
