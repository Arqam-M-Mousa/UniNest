import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeftIcon,
  UserGroupIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TrashIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { roommatesAPI } from '../services/api';

export default function RoommateProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState({
    bio: '',
    preferredLocation: '',
    budgetMin: '',
    budgetMax: '',
    cleanliness: 'Moderate',
    sleepSchedule: 'Flexible',
    smokingPreference: 'No Preference',
    petsPreference: 'No Preference',
    guestPolicy: 'Occasional',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await roommatesAPI.getProfile();
      if (response.profile) {
        setHasProfile(true);
        setProfile({
          bio: response.profile.bio || '',
          preferredLocation: response.profile.preferredLocation || '',
          budgetMin: response.profile.budgetMin?.toString() || '',
          budgetMax: response.profile.budgetMax?.toString() || '',
          cleanliness: response.profile.cleanliness || 'Moderate',
          sleepSchedule: response.profile.sleepSchedule || 'Flexible',
          smokingPreference: response.profile.smokingPreference || 'No Preference',
          petsPreference: response.profile.petsPreference || 'No Preference',
          guestPolicy: response.profile.guestPolicy || 'Occasional',
        });
      }
    } catch (error: any) {
      if (!error.message?.includes('not found')) {
        console.error('Failed to load roommate profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.budgetMin || !profile.budgetMax) {
      Alert.alert('Error', 'Please enter your budget range');
      return;
    }

    setSaving(true);
    try {
      await roommatesAPI.saveProfile({
        ...profile,
        budgetMin: parseInt(profile.budgetMin),
        budgetMax: parseInt(profile.budgetMax),
      });
      setHasProfile(true);
      Alert.alert('Success', 'Roommate profile saved successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your roommate profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await roommatesAPI.deleteProfile();
              setHasProfile(false);
              setProfile({
                bio: '',
                preferredLocation: '',
                budgetMin: '',
                budgetMax: '',
                cleanliness: 'Moderate',
                sleepSchedule: 'Flexible',
                smokingPreference: 'No Preference',
                petsPreference: 'No Preference',
                guestPolicy: 'Occasional',
              });
              Alert.alert('Success', 'Roommate profile deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete profile');
            }
          },
        },
      ]
    );
  };

  const cleanlinessOptions = ['Very Clean', 'Moderate', 'Relaxed'];
  const sleepOptions = ['Early Bird', 'Night Owl', 'Flexible'];
  const smokingOptions = ['No Smoking', 'Outside Only', 'No Preference'];
  const petsOptions = ['Love Pets', 'No Pets', 'No Preference'];
  const guestOptions = ['Rarely', 'Occasional', 'Frequently'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 16,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    budgetRow: {
      flexDirection: 'row',
      gap: 12,
    },
    budgetInput: {
      flex: 1,
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    optionButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
    },
    optionTextActive: {
      color: '#FFFFFF',
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.error,
    },
    deleteButtonText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    loader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const renderOptionButtons = (
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.optionsRow}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.optionButton,
            selectedValue === option && styles.optionButtonActive,
          ]}
          onPress={() => onSelect(option)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              selectedValue === option && styles.optionTextActive,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Roommate Profile</Text>
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Roommate Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About You</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell potential roommates about yourself..."
              placeholderTextColor={colors.secondary}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preferred Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Near campus, Downtown"
              placeholderTextColor={colors.secondary}
              value={profile.preferredLocation}
              onChangeText={(text) => setProfile({ ...profile, preferredLocation: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Budget Range ($/month)</Text>
            <View style={styles.budgetRow}>
              <View style={styles.budgetInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Min"
                  placeholderTextColor={colors.secondary}
                  value={profile.budgetMin}
                  onChangeText={(text) => setProfile({ ...profile, budgetMin: text })}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.budgetInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Max"
                  placeholderTextColor={colors.secondary}
                  value={profile.budgetMax}
                  onChangeText={(text) => setProfile({ ...profile, budgetMax: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cleanliness</Text>
            {renderOptionButtons(cleanlinessOptions, profile.cleanliness, (value) =>
              setProfile({ ...profile, cleanliness: value })
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sleep Schedule</Text>
            {renderOptionButtons(sleepOptions, profile.sleepSchedule, (value) =>
              setProfile({ ...profile, sleepSchedule: value })
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Smoking</Text>
            {renderOptionButtons(smokingOptions, profile.smokingPreference, (value) =>
              setProfile({ ...profile, smokingPreference: value })
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pets</Text>
            {renderOptionButtons(petsOptions, profile.petsPreference, (value) =>
              setProfile({ ...profile, petsPreference: value })
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Guests</Text>
            {renderOptionButtons(guestOptions, profile.guestPolicy, (value) =>
              setProfile({ ...profile, guestPolicy: value })
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {hasProfile ? 'Update Profile' : 'Create Profile'}
            </Text>
          )}
        </TouchableOpacity>

        {hasProfile && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
            <TrashIcon size={20} color={colors.error} />
            <Text style={styles.deleteButtonText}>Delete Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
