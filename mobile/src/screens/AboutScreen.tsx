import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  ChevronLeftIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';

export default function AboutScreen({ navigation }: any) {
  const { colors } = useTheme();

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
    logoSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    appName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    version: {
      fontSize: 14,
      color: colors.secondary,
      marginTop: 4,
    },
    description: {
      fontSize: 16,
      color: colors.secondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionItemLast: {
      borderBottomWidth: 0,
    },
    sectionIcon: {
      marginRight: 12,
    },
    sectionText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    copyright: {
      textAlign: 'center',
      fontSize: 14,
      color: colors.secondary,
      marginTop: 32,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <BuildingOffice2Icon size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>UniNest</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <Text style={styles.description}>
          UniNest is your trusted platform for finding student housing. We connect
          students with verified landlords to make finding your perfect home easier
          and safer.
        </Text>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => Linking.openURL('mailto:support@uninest.com')}
          >
            <EnvelopeIcon size={22} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => Linking.openURL('https://uninest.com')}
          >
            <GlobeAltIcon size={22} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Visit Website</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem}>
            <DocumentTextIcon size={22} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sectionItem, styles.sectionItemLast]}>
            <ShieldCheckIcon size={22} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2024 UniNest. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}
