import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { propertyListingsAPI } from '../services/api';

export default function EditListingScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerMonth: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const response = await propertyListingsAPI.getById(id);
      const data = response?.data || response;
      setFormData({
        title: data.title || '',
        description: data.description || '',
        pricePerMonth: data.pricePerMonth?.toString() || data.price?.toString() || '',
        bedrooms: data.bedrooms?.toString() || '',
        bathrooms: data.bathrooms?.toString() || '',
        squareFeet: data.squareFeet?.toString() || '',
        city: data.city || '',
        address: data.address || '',
      });
    } catch (err) {
      console.error('Failed to load listing:', err);
      Alert.alert('Error', 'Unable to load listing details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.pricePerMonth || !formData.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await propertyListingsAPI.update(id, {
        title: formData.title,
        description: formData.description,
        pricePerMonth: parseFloat(formData.pricePerMonth),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        squareFeet: parseInt(formData.squareFeet) || 0,
        city: formData.city,
        address: formData.address,
      });
      Alert.alert('Success', 'Listing updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Failed to update listing:', err);
      Alert.alert('Error', 'Unable to update listing. Please try again.');
    } finally {
      setSaving(false);
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
      paddingHorizontal: 20,
      paddingTop: insets.top + 10,
      paddingBottom: 15,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      marginBottom: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listing</Text>
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="e.g., Cozy 2BR Apartment"
            placeholderTextColor={colors.secondary}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe your property..."
            placeholderTextColor={colors.secondary}
            multiline
          />

          <Text style={styles.label}>Price per Month *</Text>
          <TextInput
            style={styles.input}
            value={formData.pricePerMonth}
            onChangeText={(text) => setFormData({ ...formData, pricePerMonth: text })}
            placeholder="e.g., 1200"
            placeholderTextColor={colors.secondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          
          <Text style={styles.label}>Bedrooms</Text>
          <TextInput
            style={styles.input}
            value={formData.bedrooms}
            onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
            placeholder="e.g., 2"
            placeholderTextColor={colors.secondary}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Bathrooms</Text>
          <TextInput
            style={styles.input}
            value={formData.bathrooms}
            onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
            placeholder="e.g., 1"
            placeholderTextColor={colors.secondary}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Square Feet</Text>
          <TextInput
            style={styles.input}
            value={formData.squareFeet}
            onChangeText={(text) => setFormData({ ...formData, squareFeet: text })}
            placeholder="e.g., 850"
            placeholderTextColor={colors.secondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            placeholder="e.g., New York"
            placeholderTextColor={colors.secondary}
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="e.g., 123 Main St"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: Math.max(insets.bottom + 20, 40) }} />
      </ScrollView>
    </View>
  );
}
