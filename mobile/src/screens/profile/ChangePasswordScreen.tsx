import React, { useState } from 'react';
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
  LockClosedIcon,
  EnvelopeIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { passwordChangeAPI } from '../../services/api';

export default function ChangePasswordScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 1: send code, 2: enter code and new password
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setLoading(true);
    try {
      await passwordChangeAPI.sendCode();
      Alert.alert(t('success'), t('verificationCodeSent'));
      setStep(2);
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToSendCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!code.trim()) {
      Alert.alert(t('error'), t('pleaseEnterCode'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await passwordChangeAPI.changePassword(code, newPassword);
      Alert.alert(t('success'), t('passwordChangedSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToChangePassword'));
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
    iconContainer: {
      alignItems: 'center',
      marginVertical: 30,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: colors.secondary,
      textAlign: 'center',
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    stepDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border,
      marginHorizontal: 5,
    },
    stepDotActive: {
      backgroundColor: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('changePasswordTitle')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            {step === 1 ? (
              <EnvelopeIcon size={40} color={colors.primary} />
            ) : (
              <LockClosedIcon size={40} color={colors.primary} />
            )}
          </View>
        </View>

        {step === 1 ? (
          <>
            <Text style={styles.title}>{t('verifyYourEmail')}</Text>
            <Text style={styles.subtitle}>
              {t('verifyEmailHint')}
            </Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t('sendVerificationCode')}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{t('setNewPassword')}</Text>
            <Text style={styles.subtitle}>
              {t('setNewPasswordHint')}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('verificationCode')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterVerificationCode')}
                placeholderTextColor={colors.secondary}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('newPassword')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterNewPassword')}
                placeholderTextColor={colors.secondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('confirmNewPassword')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('confirmNewPasswordPlaceholder')}
                placeholderTextColor={colors.secondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t('changePassword')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSendCode}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>{t('resendCode')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

