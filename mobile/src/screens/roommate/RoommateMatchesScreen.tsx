import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserGroupIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { roommatesAPI } from '../../services/api';

export default function RoommateMatchesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await roommatesAPI.getMatches();
      setMatches(response.data?.matches || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId: string, status: 'accepted' | 'rejected') => {
    try {
      setResponding(matchId);
      await roommatesAPI.respondMatch(matchId, status);
      Alert.alert(
        t('success'),
        status === 'accepted' ? t('matchRequestAccepted') : t('matchRequestRejected')
      );
      loadMatches();
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToRespondMatch'));
    } finally {
      setResponding(null);
    }
  };

  const handleDelete = async (matchId: string) => {
    Alert.alert(
      t('deleteMatch'),
      t('deleteMatchConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await roommatesAPI.deleteMatch(matchId);
              Alert.alert(t('success'), t('matchDeleted'));
              loadMatches();
            } catch (error: any) {
              Alert.alert(t('error'), error.message || t('failedToDeleteMatch'));
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#22c55e';
      case 'rejected':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return t('accepted');
      case 'rejected':
        return t('rejected');
      default:
        return t('pending');
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
    content: {
      padding: 16,
    },
    matchCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    matchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    matchInfo: {
      flex: 1,
    },
    matchName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    compatibilityBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    compatibilityText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: 'bold',
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    message: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    senderLabel: {
      fontSize: 12,
      color: colors.secondary,
      marginBottom: 8,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      gap: 6,
    },
    acceptButton: {
      backgroundColor: '#22c55e',
    },
    rejectButton: {
      backgroundColor: '#ef4444',
    },
    deleteButton: {
      backgroundColor: colors.border,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    deleteButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
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
    },
    loader: {
      padding: 40,
    },
  });

  const renderMatch = (match: any) => {
    const otherUser = match.otherUser;
    const isPending = match.status === 'pending';
    const isReceiver = !match.isSender;

    return (
      <View key={match.id} style={styles.matchCard}>
        <View style={styles.matchHeader}>
          {otherUser?.profilePictureUrl || otherUser?.avatarUrl ? (
            <Image
              source={{ uri: otherUser.profilePictureUrl || otherUser.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
              </Text>
            </View>
          )}
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>
              {otherUser?.firstName} {otherUser?.lastName}
            </Text>
            {match.compatibilityScore != null && (
              <View style={styles.compatibilityBadge}>
                <Text style={styles.compatibilityText}>
                  {match.compatibilityScore}% {t('compatible')}
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
            <Text style={styles.statusText}>{getStatusText(match.status)}</Text>
          </View>
        </View>

        {match.message && (
          <>
            <Text style={styles.senderLabel}>
              {match.isSender ? t('yourMessage') : t('theirMessage')}
            </Text>
            <Text style={styles.message}>"{match.message}"</Text>
          </>
        )}

        <View style={styles.actions}>
          {isPending && isReceiver ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleRespond(match.id, 'accepted')}
                disabled={responding === match.id}
                activeOpacity={0.7}
              >
                {responding === match.id ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <CheckIcon size={18} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{t('accept')}</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRespond(match.id, 'rejected')}
                disabled={responding === match.id}
                activeOpacity={0.7}
              >
                <XMarkIcon size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t('reject')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(match.id)}
              activeOpacity={0.7}
            >
              <XMarkIcon size={18} color={colors.text} />
              <Text style={styles.deleteButtonText}>{t('delete')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('matchRequests')}</Text>
        </View>
        <Text style={styles.subtitle}>{t('manageMatchRequests')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <UserGroupIcon size={40} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('noMatchRequests')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('noMatchRequestsHint')}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {matches.map(renderMatch)}
        </ScrollView>
      )}
    </View>
  );
}

