import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
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
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function SettingsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { signout } = useAuth();

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
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
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
            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <GlobeAltIcon size={22} color={colors.text} style={styles.itemIcon} />
                <Text style={styles.itemText}>Language</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemValue}>English</Text>
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
    </View>
  );
}
