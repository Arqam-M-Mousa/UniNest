import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SignUpScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert(t('error'), t('requiredField'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToCreateAccount'));
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.secondary,
      marginBottom: 40,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      color: colors.text,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    roleContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 10,
    },
    roleButton: {
      flex: 1,
      padding: 15,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
    },
    roleButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    roleText: {
      fontSize: 16,
      color: colors.text,
    },
    roleTextActive: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 30,
    },
    signInText: {
      color: colors.secondary,
      fontSize: 14,
    },
    signInLink: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 5,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('createYourAccount')}</Text>
        <Text style={styles.subtitle}>{t('createYourAccount')}</Text>

        <TextInput
          style={styles.input}
          placeholder={t('firstName')}
          placeholderTextColor={colors.secondary}
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder={t('lastName')}
          placeholderTextColor={colors.secondary}
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder={t('email')}
          placeholderTextColor={colors.secondary}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder={t('password')}
          placeholderTextColor={colors.secondary}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder={`${t('confirm')} ${t('password')}`}
          placeholderTextColor={colors.secondary}
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
          autoCapitalize="none"
        />

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              formData.role === 'student' && styles.roleButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, role: 'student' })}
          >
            <Text
              style={[
                styles.roleText,
                formData.role === 'student' && styles.roleTextActive,
              ]}
            >
              {t('student')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              formData.role === 'landlord' && styles.roleButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, role: 'landlord' })}
          >
            <Text
              style={[
                styles.roleText,
                formData.role === 'landlord' && styles.roleTextActive,
              ]}
            >
              {t('landlord')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {loading ? `${t('signUp')}...` : t('signUp')}
          </Text>
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>{t('haveAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
            <Text style={styles.signInLink}>{t('signIn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

