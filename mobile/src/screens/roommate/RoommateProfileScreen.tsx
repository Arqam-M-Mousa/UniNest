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
  Switch,
} from 'react-native';
import {
  ChevronLeftIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TrashIcon,
  SparklesIcon,
  MoonIcon,
  BookOpenIcon,
  HomeIcon,
  AcademicCapIcon,
  TagIcon,
  FireIcon,
  HeartIcon,
  SpeakerWaveIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { roommatesAPI } from '../../services/api';

export default function RoommateProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState({
    bio: '',
    minBudget: '',
    maxBudget: '',
    cleanlinessLevel: 3,
    noiseLevel: 3,
    sleepSchedule: 'normal',
    studyHabits: 'mixed',
    smokingAllowed: false,
    petsAllowed: false,
    guestsAllowed: 'sometimes',
    major: '',
    interests: [] as string[],
    isActive: true,
    matchingPriorities: {
      budget: 3,
      cleanliness: 3,
      noise: 3,
      sleepSchedule: 3,
      studyHabits: 3,
      interests: 3,
      major: 3,
      smoking: 3,
      pets: 3,
      guests: 3,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await roommatesAPI.getProfile();
      if (response.data?.profile) {
        const p = response.data.profile;
        setHasProfile(true);
        setProfile({
          bio: p.bio || '',
          minBudget: p.minBudget?.toString() || '',
          maxBudget: p.maxBudget?.toString() || '',
          cleanlinessLevel: p.cleanlinessLevel || 3,
          noiseLevel: p.noiseLevel || 3,
          sleepSchedule: p.sleepSchedule || 'normal',
          studyHabits: p.studyHabits || 'mixed',
          smokingAllowed: p.smokingAllowed || false,
          petsAllowed: p.petsAllowed || false,
          guestsAllowed: p.guestsAllowed || 'sometimes',
          major: p.major || '',
          interests: p.interests || [],
          isActive: p.isActive ?? true,
          matchingPriorities: p.matchingPriorities || {
            budget: 3,
            cleanliness: 3,
            noise: 3,
            sleepSchedule: 3,
            studyHabits: 3,
            interests: 3,
            major: 3,
            smoking: 3,
            pets: 3,
            guests: 3,
          },
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
    if (!profile.minBudget || !profile.maxBudget) {
      Alert.alert(t('error'), t('enterBudgetRange'));
      return;
    }

    setSaving(true);
    try {
      await roommatesAPI.saveProfile({
        ...profile,
        minBudget: parseInt(profile.minBudget),
        maxBudget: parseInt(profile.maxBudget),
      });
      setHasProfile(true);
      Alert.alert(t('success'), t('profileSavedSuccess'));
      loadProfile();
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToSaveProfile'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('deleteProfile'),
      t('deleteRoommateProfileConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await roommatesAPI.deleteProfile();
              setHasProfile(false);
              setProfile({
                bio: '',
                minBudget: '',
                maxBudget: '',
                cleanlinessLevel: 3,
                noiseLevel: 3,
                sleepSchedule: 'normal',
                studyHabits: 'mixed',
                smokingAllowed: false,
                petsAllowed: false,
                guestsAllowed: 'sometimes',
                major: '',
                interests: [],
                isActive: true,
                matchingPriorities: {
                  budget: 3,
                  cleanliness: 3,
                  noise: 3,
                  sleepSchedule: 3,
                  studyHabits: 3,
                  interests: 3,
                  major: 3,
                  smoking: 3,
                  pets: 3,
                  guests: 3,
                },
              });
              Alert.alert(t('success'), t('profileDeletedSuccess'));
            } catch (error: any) {
              Alert.alert(t('error'), error.message || t('failedToDeleteProfile'));
            }
          },
        },
      ]
    );
  };

  const sleepOptions = ['early', 'normal', 'late'];
  const studyOptions = ['home', 'mixed', 'library'];
  const guestsOptions = ['never', 'rarely', 'sometimes', 'often'];
  
  const majorOptions = [
    'majorEngineering', 'majorComputerScience', 'majorMedicine', 'majorBusiness',
    'majorLaw', 'majorArts', 'majorScience', 'majorEducation',
  ];
  
  const interestOptions = [
    'interestSports', 'interestGaming', 'interestReading', 'interestMusic',
    'interestCooking', 'interestFitness', 'interestMovies', 'interestTravel',
  ];
  
  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

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
    sectionSubtitle: {
      fontSize: 13,
      color: colors.secondary,
      marginBottom: 16,
      lineHeight: 18,
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
    sliderContainer: {
      marginBottom: 16,
    },
    sliderLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    sliderValue: {
      fontSize: 12,
      color: colors.secondary,
      marginBottom: 8,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    switchLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    interestBadge: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginRight: 8,
      marginBottom: 8,
    },
    interestBadgeActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    interestText: {
      fontSize: 13,
      color: colors.text,
    },
    interestTextActive: {
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
            {option.replace('major', '').replace('interest', '')}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderSlider = (label: string, value: number, onChange: (val: number) => void, min = 1, max = 5) => (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <Text style={styles.sliderValue}>{t('level')}: {value}</Text>
      <View style={styles.optionsRow}>
        {[1, 2, 3, 4, 5].map(num => (
          <TouchableOpacity
            key={num}
            style={[
              styles.optionButton,
              value === num && styles.optionButtonActive,
            ]}
            onPress={() => onChange(num)}
          >
            <Text style={[styles.optionText, value === num && styles.optionTextActive]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('roommateProfileTitle')}</Text>
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
        <Text style={styles.headerTitle}>{t('roommateProfileTitle')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Status */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('profileActive')}</Text>
            <Switch
              value={profile.isActive}
              onValueChange={(val) => setProfile({ ...profile, isActive: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('aboutYou')}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('bio')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('bioPlaceholder')}
              placeholderTextColor={colors.secondary}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              multiline
            />
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('budget')}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('budgetRange')}</Text>
            <View style={styles.budgetRow}>
              <View style={styles.budgetInput}>
                <TextInput
                  style={styles.input}
                  placeholder={t('min')}
                  placeholderTextColor={colors.secondary}
                  value={profile.minBudget}
                  onChangeText={(text) => setProfile({ ...profile, minBudget: text })}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.budgetInput}>
                <TextInput
                  style={styles.input}
                  placeholder={t('max')}
                  placeholderTextColor={colors.secondary}
                  value={profile.maxBudget}
                  onChangeText={(text) => setProfile({ ...profile, maxBudget: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Academic */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('academic')}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('major')}</Text>
            {renderOptionButtons(majorOptions, profile.major, (value) =>
              setProfile({ ...profile, major: value })
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('studyHabits')}</Text>
            {renderOptionButtons(studyOptions, profile.studyHabits, (value) =>
              setProfile({ ...profile, studyHabits: value })
            )}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('interests')}</Text>
          <View style={styles.optionsRow}>
            {interestOptions.map(interest => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestBadge,
                  profile.interests.includes(interest) && styles.interestBadgeActive,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.interestText,
                  profile.interests.includes(interest) && styles.interestTextActive,
                ]}>
                  {interest.replace('interest', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Living Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('livingPreferences')}</Text>
          {renderSlider(t('cleanlinessLevel'), profile.cleanlinessLevel, (val) =>
            setProfile({ ...profile, cleanlinessLevel: val })
          )}
          {renderSlider(t('noiseTolerance'), profile.noiseLevel, (val) =>
            setProfile({ ...profile, noiseLevel: val })
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('sleepSchedule')}</Text>
            {renderOptionButtons(sleepOptions, profile.sleepSchedule, (value) =>
              setProfile({ ...profile, sleepSchedule: value })
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('guestsPolicy')}</Text>
            {renderOptionButtons(guestsOptions, profile.guestsAllowed, (value) =>
              setProfile({ ...profile, guestsAllowed: value })
            )}
          </View>
        </View>

        {/* Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lifestyle')}</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('smokingAllowed')}</Text>
            <Switch
              value={profile.smokingAllowed}
              onValueChange={(val) => setProfile({ ...profile, smokingAllowed: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('petsAllowed')}</Text>
            <Switch
              value={profile.petsAllowed}
              onValueChange={(val) => setProfile({ ...profile, petsAllowed: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Matching Priorities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('matchingPriorities')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('matchingPrioritiesHint')}
          </Text>
          {renderSlider(t('budgetPriority'), profile.matchingPriorities.budget, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, budget: val } })
          )}
          {renderSlider(t('cleanlinessPriority'), profile.matchingPriorities.cleanliness, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, cleanliness: val } })
          )}
          {renderSlider(t('noisePriority'), profile.matchingPriorities.noise, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, noise: val } })
          )}
          {renderSlider(t('sleepSchedulePriority'), profile.matchingPriorities.sleepSchedule, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, sleepSchedule: val } })
          )}
          {renderSlider(t('studyHabitsPriority'), profile.matchingPriorities.studyHabits, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, studyHabits: val } })
          )}
          {renderSlider(t('interestsPriority'), profile.matchingPriorities.interests, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, interests: val } })
          )}
          {renderSlider(t('majorPriority'), profile.matchingPriorities.major, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, major: val } })
          )}
          {renderSlider(t('smokingPriority'), profile.matchingPriorities.smoking, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, smoking: val } })
          )}
          {renderSlider(t('petsPriority'), profile.matchingPriorities.pets, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, pets: val } })
          )}
          {renderSlider(t('guestsPriority'), profile.matchingPriorities.guests, (val) =>
            setProfile({ ...profile, matchingPriorities: { ...profile.matchingPriorities, guests: val } })
          )}
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
              {hasProfile ? t('updateProfile') : t('createProfile')}
            </Text>
          )}
        </TouchableOpacity>

        {hasProfile && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
            <TrashIcon size={20} color={colors.error} />
            <Text style={styles.deleteButtonText}>{t('deleteProfileButton')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

