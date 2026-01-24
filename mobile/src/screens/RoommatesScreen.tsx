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
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { roommatesAPI } from '../services/api';

export default function RoommatesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await roommatesAPI.search();
      const data = response?.data?.profiles || response?.profiles || response?.data || [];
      setProfiles(Array.isArray(data) ? data : []);
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
      marginHorizontal: 15,
      marginVertical: 8,
      borderRadius: 12,
      padding: 15,
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Find Roommates</Text>
        </View>
        <Text style={styles.subtitle}>Connect with potential roommates</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.profileCard}
              onPress={() => navigation.navigate('RoommateProfile', { userId: item.userId })}
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
                <Text style={styles.profileName}>
                  {item.user?.firstName} {item.user?.lastName}
                </Text>
                <Text style={styles.profileDetail}>
                  📍 {item.preferredLocation || 'Any location'}
                </Text>
                <Text style={styles.profileDetail}>
                  💰 Budget: ${item.budgetMin} - ${item.budgetMax}
                </Text>
                <View style={styles.profileTags}>
                  {item.cleanliness && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>🧹 {item.cleanliness}</Text>
                    </View>
                  )}
                  {item.sleepSchedule && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>😴 {item.sleepSchedule}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No roommate profiles found</Text>
          }
        />
      )}
    </View>
  );
}
