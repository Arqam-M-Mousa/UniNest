import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  UserPlusIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  MoonIcon,
  SparklesIcon,
  HomeIcon,
  BookOpenIcon,
  TagIcon,
  CheckIcon,
  FireIcon,
  HeartIcon,
  UserGroupIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { roommatesAPI } from '../../services/api';

export default function RoommateDetailScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { profile } = route.params || {};
  
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!profile) {
    navigation.goBack();
    return null;
  }

  const handleSendMatch = async () => {
    if (!profile.userId) return;

    try {
      setSending(true);
      await roommatesAPI.sendMatch(profile.userId.toString(), matchMessage);
      setShowMatchModal(false);
      setSuccess(true);
      Alert.alert(t('success'), t('matchRequestSentSuccess'));
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToSendMatchRequest'));
    } finally {
      setSending(false);
    }
  };

  const userData = profile.user || {};

  const formatBudget = () => {
    if (profile.minBudget && profile.maxBudget) {
      return `${profile.minBudget} - ${profile.maxBudget} NIS`;
    }
    return t('notSpecified');
  };

  const getSleepLabel = (schedule: string) => {
    const labels: any = {
      early: t('earlyBird'),
      normal: t('normal'),
      late: t('nightOwl'),
    };
    return labels[schedule] || schedule;
  };

  const getCleanlinessLabel = (level: number) => {
    const labels: any = {
      1: t('relaxed'),
      2: t('flexible'),
      3: t('moderate'),
      4: t('clean'),
      5: t('veryClean'),
    };
    return labels[level] || `${t('level')} ${level}`;
  };

  const getStudyLabel = (habits: string) => {
    const labels: any = {
      home: t('atHome'),
      mixed: t('mixed'),
      library: t('library'),
    };
    return labels[habits] || habits;
  };

  const getGuestsLabel = (policy: string) => {
    const labels: any = {
      never: t('never'),
      rarely: t('rarely'),
      sometimes: t('sometimes'),
      often: t('often'),
    };
    return labels[policy] || policy;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + 10,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    backButton: {
      marginRight: 12,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarLarge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 15,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 32,
      fontWeight: 'bold',
    },
    headerInfo: {
      flex: 1,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 5,
    },
    compatibilityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    compatibilityBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    compatibilityText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: 'bold',
    },
    universityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    universityText: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 14,
      marginLeft: 6,
    },
    headerBadges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    headerBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    headerBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginLeft: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bioText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    noBioText: {
      fontSize: 14,
      color: colors.secondary,
      fontStyle: 'italic',
    },
    interestsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    interestBadge: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    interestText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '500',
    },
    preferencesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    preferenceItem: {
      width: '47%',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    preferenceLabel: {
      fontSize: 11,
      color: colors.secondary,
      textTransform: 'uppercase',
      fontWeight: '600',
      marginTop: 6,
      marginBottom: 4,
    },
    preferenceValue: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    lifestyleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    lifestyleLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    lifestyleLabelText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    lifestyleValue: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    lifestyleValueText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    connectButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 10,
    },
    connectButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    successButton: {
      backgroundColor: '#22c55e',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 16,
    },
    textInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      color: colors.text,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    modalButton: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sendButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.text,
    },
    sendButtonText: {
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          {userData.profilePictureUrl || userData.avatarUrl ? (
            <Image
              source={{ uri: userData.profilePictureUrl || userData.avatarUrl }}
              style={styles.avatarLarge}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userData.firstName?.[0]}{userData.lastName?.[0]}
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>
              {userData.firstName} {userData.lastName}
            </Text>
            <View style={styles.compatibilityContainer}>
              {profile.compatibilityScore != null && (
                <View style={styles.compatibilityBadge}>
                  <Text style={styles.compatibilityText}>
                    {profile.compatibilityScore}% {t('compatible')}
                  </Text>
                </View>
              )}
            </View>
            {profile.university?.name && (
              <View style={styles.universityRow}>
                <AcademicCapIcon size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.universityText}>{profile.university.name}</Text>
              </View>
            )}
            <View style={styles.headerBadges}>
              {profile.major && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{profile.major}</Text>
                </View>
              )}
              {profile.sameMajor === 1 && (
                <View style={[styles.headerBadge, { backgroundColor: '#22c55e' }]}>
                  <CheckIcon size={12} color="#FFFFFF" />
                  <Text style={styles.headerBadgeText}>{t('sameMajor')}</Text>
                </View>
              )}
              <View style={styles.headerBadge}>
                <CurrencyDollarIcon size={12} color="#FFFFFF" />
                <Text style={styles.headerBadgeText}>{formatBudget()}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* About Me */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpenIcon size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('aboutMe')}</Text>
          </View>
          <View style={styles.card}>
            {profile.bio ? (
              <Text style={styles.bioText}>{profile.bio}</Text>
            ) : (
              <Text style={styles.noBioText}>{t('noBioProvided')}</Text>
            )}
          </View>
        </View>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TagIcon size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>{t('interests')}</Text>
            </View>
            <View style={styles.interestsContainer}>
              {profile.interests.map((interest: string) => (
                <View key={interest} style={styles.interestBadge}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Living Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HomeIcon size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('livingPreferences')}</Text>
          </View>
          <View style={styles.preferencesGrid}>
            <View style={styles.preferenceItem}>
              <SparklesIcon size={24} color="#22c55e" />
              <Text style={styles.preferenceLabel}>{t('cleanliness')}</Text>
              <Text style={styles.preferenceValue}>
                {profile.cleanlinessLevel ? getCleanlinessLabel(profile.cleanlinessLevel) : '-'}
              </Text>
            </View>
            <View style={styles.preferenceItem}>
              <MoonIcon size={24} color="#6366f1" />
              <Text style={styles.preferenceLabel}>{t('sleep')}</Text>
              <Text style={styles.preferenceValue}>
                {profile.sleepSchedule ? getSleepLabel(profile.sleepSchedule) : '-'}
              </Text>
            </View>
            <View style={styles.preferenceItem}>
              <AcademicCapIcon size={24} color="#a855f7" />
              <Text style={styles.preferenceLabel}>{t('study')}</Text>
              <Text style={styles.preferenceValue}>
                {profile.studyHabits ? getStudyLabel(profile.studyHabits) : '-'}
              </Text>
            </View>
            <View style={styles.preferenceItem}>
              <UserGroupIcon size={24} color="#f59e0b" />
              <Text style={styles.preferenceLabel}>{t('guests')}</Text>
              <Text style={styles.preferenceValue}>
                {profile.guestsAllowed ? getGuestsLabel(profile.guestsAllowed) : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Lifestyle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HomeIcon size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('lifestyle')}</Text>
          </View>
          <View style={styles.lifestyleRow}>
            <View style={styles.lifestyleLabel}>
              <FireIcon size={20} color="#f97316" />
              <Text style={styles.lifestyleLabelText}>{t('smokingAllowed')}</Text>
            </View>
            <View
              style={[
                styles.lifestyleValue,
                {
                  backgroundColor: profile.smokingAllowed ? '#22c55e20' : '#ef444420',
                },
              ]}
            >
              <Text
                style={[
                  styles.lifestyleValueText,
                  { color: profile.smokingAllowed ? '#22c55e' : '#ef4444' },
                ]}
              >
                {profile.smokingAllowed ? t('yes') : t('no')}
              </Text>
            </View>
          </View>
          <View style={styles.lifestyleRow}>
            <View style={styles.lifestyleLabel}>
              <HeartIcon size={20} color="#ec4899" />
              <Text style={styles.lifestyleLabelText}>{t('petsAllowed')}</Text>
            </View>
            <View
              style={[
                styles.lifestyleValue,
                {
                  backgroundColor: profile.petsAllowed ? '#22c55e20' : '#ef444420',
                },
              ]}
            >
              <Text
                style={[
                  styles.lifestyleValueText,
                  { color: profile.petsAllowed ? '#22c55e' : '#ef4444' },
                ]}
              >
                {profile.petsAllowed ? t('yes') : t('no')}
              </Text>
            </View>
          </View>
        </View>

        {/* Connect Button */}
        {!success ? (
          <TouchableOpacity 
            style={styles.connectButton} 
            activeOpacity={0.7}
            onPress={() => setShowMatchModal(true)}
          >
            <UserPlusIcon size={20} color="#FFFFFF" />
            <Text style={styles.connectButtonText}>{t('connectAsRoommate')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.connectButton, styles.successButton]}>
            <CheckIcon size={20} color="#FFFFFF" />
            <Text style={styles.connectButtonText}>{t('requestSent')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Match Request Modal */}
      <Modal
        visible={showMatchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('sendMatchRequest')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('sendMessageTo')} {userData.firstName} {t('toIntroduceYourself')}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('writeMessage')}
              placeholderTextColor={colors.secondary}
              value={matchMessage}
              onChangeText={setMatchMessage}
              multiline
              maxLength={300}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowMatchModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendMatch}
                disabled={sending}
                activeOpacity={0.7}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.sendButtonText]}>
                    {t('sendRequest')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

