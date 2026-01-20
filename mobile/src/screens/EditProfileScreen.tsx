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
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function EditProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: (user as any)?.phoneNumber || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(user?.profilePictureUrl || null);

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
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required.');
      return;
    }

    setLoading(true);
    try {
      await userAPI.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
      });
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
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
          <Text style={styles.label}>Email</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            placeholder="Enter first name"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            placeholder="Enter last name"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            placeholder="Enter phone number"
            placeholderTextColor={colors.secondary}
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>
    </View>
  );
}
