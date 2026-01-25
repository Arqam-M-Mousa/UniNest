import React, { useState } from 'react';
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
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: t('faqSearchProperties'),
      answer: t('faqSearchPropertiesAnswer'),
    },
    {
      question: t('faqContactLandlord'),
      answer: t('faqContactLandlordAnswer'),
    },
    {
      question: t('faqSaveProperties'),
      answer: t('faqSavePropertiesAnswer'),
    },
    {
      question: t('faqListProperty'),
      answer: t('faqListPropertyAnswer'),
    },
    {
      question: t('faqSecure'),
      answer: t('faqSecureAnswer'),
    },
    {
      question: t('faqReport'),
      answer: t('faqReportAnswer'),
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    faqItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    faqQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    faqQuestionText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    faqAnswer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    faqAnswerText: {
      fontSize: 14,
      color: colors.secondary,
      lineHeight: 22,
    },
    contactSection: {
      marginTop: 32,
    },
    contactCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    contactItemLast: {
      borderBottomWidth: 0,
    },
    contactIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    contactInfo: {
      flex: 1,
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    contactSubtitle: {
      fontSize: 14,
      color: colors.secondary,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('helpTitle')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>{t('faq')}</Text>

        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.faqQuestion}
              onPress={() => toggleExpand(index)}
            >
              <Text style={styles.faqQuestionText}>{faq.question}</Text>
              {expandedIndex === index ? (
                <ChevronUpIcon size={20} color={colors.secondary} />
              ) : (
                <ChevronDownIcon size={20} color={colors.secondary} />
              )}
            </TouchableOpacity>
            {expandedIndex === index && (
              <View style={styles.faqAnswer}>
                <Text style={styles.faqAnswerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>{t('contactSupport')}</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL('mailto:support@uninest.com')}
            >
              <View style={styles.contactIcon}>
                <EnvelopeIcon size={22} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{t('email')}</Text>
                <Text style={styles.contactSubtitle}>support@uninest.com</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactItem, styles.contactItemLast]}>
              <View style={styles.contactIcon}>
                <ChatBubbleLeftRightIcon size={22} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{t('liveChat')}</Text>
                <Text style={styles.contactSubtitle}>{t('availableHours')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

