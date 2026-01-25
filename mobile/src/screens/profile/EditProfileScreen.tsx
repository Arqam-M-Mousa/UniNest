import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeftIcon, CameraIcon, UserCircleIcon } from 'react-native-heroicons/outline';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { userAPI, uploadsAPI } from '../../services/api';

export default function EditProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: (user as any)?.phoneNumber || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(user?.profilePictureUrl || (user as any)?.avatarUrl || null);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImageUri(result.assets[0].uri);
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (): Promise<boolean> => {
    if (!newImageUri) return true;
    
    setUploadingImage(true);
    try {
      await uploadsAPI.uploadProfilePicture(newImageUri);
      return true;
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      Alert.alert(t('error'), error.message || 'Failed to upload profile picture.');
      return false;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert(t('error'), t('requiredField'));
      return;
    }

    setLoading(true);
    try {
      // Upload profile image first if changed
      if (newImageUri) {
        const uploadSuccess = await uploadProfileImage();
        if (!uploadSuccess) {
          setLoading(false);
          return;
        }
      }

      // Update profile data
      await userAPI.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
      });
      await refreshUser();
      Alert.alert(t('success'), t('updatedSuccessfully'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('error'), error.message || 'Failed to update profile.');
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
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: insets.top + 10,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    saveButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    content: {
      padding: 20,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.card,
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.background,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.secondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emailText: {
      fontSize: 16,
      color: colors.secondary,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editProfileTitle')}</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading || uploadingImage}
          activeOpacity={0.7}
        >
          {loading || uploadingImage ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} activeOpacity={0.7}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <UserCircleIcon size={80} color={colors.secondary} />
              </View>
            )}
            <View style={styles.cameraButton}>
              <CameraIcon size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('email')}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('firstName')}</Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            placeholder={t('enterFirstName')}
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('lastName')}</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            placeholder={t('enterLastName')}
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('phoneNumber')}</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            placeholder={t('enterPhoneNumber')}
            placeholderTextColor={colors.secondary}
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>
    </View>
  );
}

