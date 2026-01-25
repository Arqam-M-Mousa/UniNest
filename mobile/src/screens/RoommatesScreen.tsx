import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  MoonIcon,
  SparklesIcon,
  AcademicCapIcon,
  CheckIcon,
  UserGroupIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { roommatesAPI } from '../services/api';

export default function RoommatesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isProfileActive, setIsProfileActive] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await roommatesAPI.search();
      const data = response?.data || response;
      
      setHasProfile(data?.hasProfile !== false);
      setIsProfileActive(data?.isProfileActive !== false);
      
      const profilesList = data?.profiles || [];
      // Filter out current user's profile from results
      const filteredProfiles = Array.isArray(profilesList) 
        ? profilesList.filter((p: any) => p.userId !== user?.id)
        : [];
      setProfiles(filteredProfiles);
    } catch (error) {
      console.error('Failed to load roommate profiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
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
    },
    avatarImage: {
      width: 70,
      height: 70,
      borderRadius: 35,
      marginRight: 15,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    backButton: {
      marginRight: 12,
    },
    matchesButton: {
      marginLeft: 'auto',
      padding: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    subtitle: {
      fontSize: 14,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: 'bold',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 5,
    },
    profileDetail: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 3,
    },
    profileTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
      marginTop: 8,
    },
    tag: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    tagText: {
      fontSize: 12,
      color: colors.primary,
    },
    loader: {
      padding: 40,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.secondary,
      fontSize: 16,
      marginTop: 40,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.secondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    createProfileButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    createProfileButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    compatibilityBadge: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    compatibilityText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: 'bold',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    infoText: {
      fontSize: 13,
      color: colors.secondary,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    badgeText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '500',
    },
  });

  const renderEmptyState = () => {
    if (!hasProfile) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <UserPlusIcon size={40} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Create Your Profile First</Text>
          <Text style={styles.emptySubtitle}>
            Set up your roommate profile to start matching with potential roommates
          </Text>
          <TouchableOpacity
            style={styles.createProfileButton}
            onPress={() => navigation.navigate('RoommateProfile')}
            activeOpacity={0.7}
          >
            <UserPlusIcon size={20} color="#FFFFFF" />
            <Text style={styles.createProfileButtonText}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MagnifyingGlassIcon size={40} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No Roommates Found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your preferences or check back later
        </Text>
      </View>
    );
  };

  const formatBudget = (item: any) => {
    if (item.minBudget && item.maxBudget) {
      return `${item.minBudget} - ${item.maxBudget} NIS`;
    }
    return 'Not specified';
  };

  const getSleepLabel = (schedule: string) => {
    const labels: any = {
      early: 'Early Bird',
      normal: 'Normal',
      late: 'Night Owl',
    };
    return labels[schedule] || schedule;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Find Roommates</Text>
          <TouchableOpacity
            style={styles.matchesButton}
            onPress={() => navigation.navigate('RoommateMatches')}
          >
            <UserGroupIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Top 10 compatible matches for you</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : !hasProfile || profiles.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.userId?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.profileCard}
              onPress={() => navigation.navigate('RoommateDetail', { profile: item, currentUserId: user?.id })}
              activeOpacity={0.7}
            >
              {item.user?.profilePictureUrl || item.user?.avatarUrl ? (
                <Image
                  source={{ uri: item.user?.profilePictureUrl || item.user?.avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.user?.firstName?.[0]}{item.user?.lastName?.[0]}
                  </Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                {item.compatibilityScore != null && (
                  <View style={styles.compatibilityBadge}>
                    <Text style={styles.compatibilityText}>{item.compatibilityScore}%</Text>
                  </View>
                )}
                <Text style={styles.profileName}>
                  {item.user?.firstName} {item.user?.lastName}
                </Text>
                {item.university?.name && (
                  <View style={styles.infoRow}>
                    <AcademicCapIcon size={14} color={colors.secondary} />
                    <Text style={styles.infoText}>{item.university.name}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <CurrencyDollarIcon size={14} color={colors.secondary} />
                  <Text style={styles.infoText}>{formatBudget(item)}</Text>
                </View>
                <View style={styles.profileTags}>
                  {item.sleepSchedule && (
                    <View style={styles.badge}>
                      <MoonIcon size={12} color={colors.primary} />
                      <Text style={styles.badgeText}>{getSleepLabel(item.sleepSchedule)}</Text>
                    </View>
                  )}
                  {item.cleanlinessLevel && (
                    <View style={styles.badge}>
                      <SparklesIcon size={12} color={colors.primary} />
                      <Text style={styles.badgeText}>Level {item.cleanlinessLevel}</Text>
                    </View>
                  )}
                  {item.sameMajor === 1 && (
                    <View style={[styles.badge, { backgroundColor: '#22c55e20' }]}>
                      <CheckIcon size={12} color="#22c55e" />
                      <Text style={[styles.badgeText, { color: '#22c55e' }]}>Same Major</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
