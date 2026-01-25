import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  TrashIcon,
  LockClosedIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { userAPI } from '../../services/api';

export default function SettingsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { signout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await userAPI.deleteProfile();
              console.log('Delete account response:', response);
              await signout();
            } catch (error: any) {
              console.error('Delete account error:', error);
              Alert.alert('Error', error.message || 'Failed to delete account.');
            }
          },
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
    section: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.secondary,
      marginLeft: 16,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    sectionContent: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemLast: {
      borderBottomWidth: 0,
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemIcon: {
      marginRight: 12,
    },
    itemText: {
      fontSize: 16,
      color: colors.text,
    },
    itemValue: {
      fontSize: 16,
      color: colors.secondary,
      marginRight: 8,
    },
    itemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dangerItem: {
      backgroundColor: colors.card,
      marginTop: 24,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    dangerText: {
      color: colors.error,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 20,
      textAlign: 'center',
    },
    languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 12,
    },
    languageText: {
      fontSize: 16,
      fontWeight: '600',
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmarkText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
    cancelButton: {
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 8,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <BellIcon size={22} color={colors.text} style={styles.itemIcon} />
                <Text style={styles.itemText}>Push Notifications</Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            <View style={[styles.item, styles.itemLast]}>
              <View style={styles.itemLeft}>
                <BellIcon size={22} color={colors.text} style={styles.itemIcon} />
                <Text style={styles.itemText}>Email Notifications</Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.item} onPress={() => setLanguageModalVisible(true)}>
              <View style={styles.itemLeft}>
                <GlobeAltIcon size={22} color={colors.text} style={styles.itemIcon} />
                <Text style={styles.itemText}>{t('language')}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemValue}>{language === 'en' ? t('english') : t('arabic')}</Text>
                <ChevronRightIcon size={20} color={colors.secondary} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.item, styles.itemLast]}>
              <View style={styles.itemLeft}>
                <ShieldCheckIcon size={22} color={colors.text} style={styles.itemIcon} />
                <Text style={styles.itemText}>Privacy</Text>
              </View>
              <ChevronRightIcon size={20} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={[styles.item, styles.itemLast]}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <View style={styles.itemLeft}>
                <LockClosedIcon size={22} color={colors.text} style={styles.itemIcon} />
                <Text style={styles.itemText}>Change Password</Text>
              </View>
              <ChevronRightIcon size={20} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dangerItem}>
          <TouchableOpacity 
            style={[styles.item, styles.itemLast]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <TrashIcon size={22} color={colors.error} style={styles.itemIcon} />
              <Text style={[styles.itemText, styles.dangerText]}>Delete Account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('selectLanguage')}</Text>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                { borderColor: colors.border },
                language === 'en' && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
              ]}
              onPress={() => {
                changeLanguage('en');
                setLanguageModalVisible(false);
                Alert.alert(
                  'Language Changed',
                  'Please restart the app for the language change to take full effect.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={[styles.languageText, { color: language === 'en' ? colors.primary : colors.text }]}>
                {t('english')}
              </Text>
              {language === 'en' && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                { borderColor: colors.border },
                language === 'ar' && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
              ]}
              onPress={() => {
                changeLanguage('ar');
                setLanguageModalVisible(false);
                Alert.alert(
                  'تم تغيير اللغة',
                  'يرجى إعادة تشغيل التطبيق لتطبيق تغيير اللغة بالكامل.',
                  [{ text: 'حسناً' }]
                );
              }}
            >
              <Text style={[styles.languageText, { color: language === 'ar' ? colors.primary : colors.text }]}>
                {t('arabic')}
              </Text>
              {language === 'ar' && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.border }]}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>{t('cancel')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

