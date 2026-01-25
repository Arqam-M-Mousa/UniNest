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

export default function SignInScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { signin } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('requiredField'));
      return;
    }

    setLoading(true);
    try {
      await signin(email, password);
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('invalidCredentials'));
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
    forgotPassword: {
      alignSelf: 'center',
      marginTop: 15,
    },
    forgotPasswordText: {
      color: colors.primary,
      fontSize: 14,
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 30,
    },
    signUpText: {
      color: colors.secondary,
      fontSize: 14,
    },
    signUpLink: {
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
        <Text style={styles.title}>{t('welcomeBack')}</Text>
        <Text style={styles.subtitle}>{t('welcomeBack')}</Text>

        <TextInput
          style={styles.input}
          placeholder={t('email')}
          placeholderTextColor={colors.secondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder={t('password')}
          placeholderTextColor={colors.secondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {loading ? `${t('signIn')}...` : t('signIn')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>{t('noAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
            <Text style={styles.signUpLink}>{t('signUp')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

