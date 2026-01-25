import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { ChevronLeftIcon, PhotoIcon, XMarkIcon, MapPinIcon } from 'react-native-heroicons/outline';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from '../../components/MapView';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { propertyListingsAPI, universitiesAPI } from '../../services/api';

const propertyTypes = ['Apartment', 'House', 'Studio', 'Room'];
const currencies = ['NIS', 'JOD'];
const listingDurations = [
  { value: '1week', label: '1 Week' },
  { value: '2weeks', label: '2 Weeks' },
  { value: '1month', label: '1 Month' },
  { value: '2months', label: '2 Months' },
  { value: '3months', label: '3 Months' },
];

interface University {
  id: string;
  name: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export default function AddListingScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 31.9539,
    longitude: 35.9106,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const mapRef = useRef<MapView>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerMonth: '',
    currency: 'NIS',
    bedrooms: '1',
    bathrooms: '1',
    squareFeet: '',
    propertyType: 'Apartment',
    leaseDuration: '',
    listingDuration: '1month',
    universityId: '',
    maxOccupants: '1',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Fetch universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await universitiesAPI.list();
        const data = response?.data || response || [];
        setUniversities(Array.isArray(data) ? data : []);
        // Set default university if user has one
        if (user?.universityId) {
          setFormData(prev => ({ ...prev, universityId: user.universityId || '' }));
        }
      } catch (error) {
        console.error('Failed to fetch universities:', error);
      } finally {
        setUniversitiesLoading(false);
      }
    };
    fetchUniversities();
  }, [user?.universityId]);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissionRequired'), t('photoLibraryPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - selectedImages.length,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionDenied'), t('locationPermission'));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setFormData(prev => ({ ...prev, latitude, longitude }));
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(t('error'), t('failedToGetLocation'));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setFormData(prev => ({ ...prev, latitude, longitude }));
  };

  const confirmLocation = () => {
    if (formData.latitude && formData.longitude) {
      setShowMapModal(false);
    } else {
      Alert.alert(t('noLocationSelected'), t('tapMapToSelect'));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert(t('error'), t('pleaseEnterTitle'));
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert(t('error'), t('pleaseEnterDescription'));
      return;
    }
    if (!formData.pricePerMonth.trim()) {
      Alert.alert(t('error'), t('pleaseEnterPrice'));
      return;
    }
    if (!formData.squareFeet.trim()) {
      Alert.alert(t('error'), t('pleaseEnterSize'));
      return;
    }
    if (!formData.leaseDuration.trim()) {
      Alert.alert(t('error'), t('pleaseEnterLeaseDuration'));
      return;
    }
    if (!formData.universityId) {
      Alert.alert(t('error'), t('pleaseSelectUniversity'));
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert(t('error'), t('pleaseAddImage'));
      return;
    }

    setLoading(true);
    try {
      // For now, we'll create the listing with image URLs
      // In production, you'd upload images first
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        propertyType: formData.propertyType,
        pricePerMonth: Number(formData.pricePerMonth),
        currency: formData.currency,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        squareFeet: Number(formData.squareFeet),
        leaseDuration: formData.leaseDuration.trim(),
        listingDuration: formData.listingDuration,
        latitude: formData.latitude,
        longitude: formData.longitude,
        universityId: formData.universityId,
        maxOccupants: Number(formData.maxOccupants) || 1,
        // Images would be uploaded separately in production
        images: selectedImages.map(uri => ({ url: uri, is360: false })),
      };

      await propertyListingsAPI.create(payload);
      Alert.alert(t('success'), t('listingCreatedSuccess'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToCreateListing'));
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
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    required: {
      color: colors.error || '#EF4444',
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    halfInput: {
      flex: 1,
    },
    thirdInput: {
      flex: 1,
    },
    typeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typeButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    typeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    typeText: {
      fontSize: 14,
      color: colors.text,
    },
    typeTextActive: {
      color: '#FFFFFF',
    },
    picker: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
    },
    pickerText: {
      fontSize: 16,
      color: colors.text,
    },
    imageSection: {
      marginBottom: 16,
    },
    imageUploadButton: {
      height: 120,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    imageUploadText: {
      marginTop: 8,
      fontSize: 14,
      color: colors.secondary,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    imagePreview: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    imageContainer: {
      position: 'relative',
    },
    removeImageButton: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.error || '#EF4444',
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hint: {
      fontSize: 12,
      color: colors.secondary,
      marginTop: 4,
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
      gap: 8,
    },
    locationButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    locationButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    locationInfo: {
      marginTop: 8,
      padding: 10,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    locationInfoText: {
      fontSize: 12,
      color: colors.secondary,
    },
    mapPreview: {
      height: 150,
      borderRadius: 10,
      marginTop: 12,
      overflow: 'hidden',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
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
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    modalButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    map: {
      flex: 1,
    },
    mapInstructions: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    mapInstructionsText: {
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
    },
    currentLocationButton: {
      position: 'absolute',
      bottom: 170,
      right: 20,
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Listing</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Listing Basics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Basics</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder={t('titlePlaceholder')}
              placeholderTextColor={colors.secondary}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('descriptionPlaceholder')}
              placeholderTextColor={colors.secondary}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Property Type</Text>
            <View style={styles.typeContainer}>
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.propertyType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, propertyType: type })}
                >
                  <Text
                    style={[
                      styles.typeText,
                      formData.propertyType === type && styles.typeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>University <Text style={styles.required}>*</Text></Text>
            {universitiesLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={styles.typeContainer}>
                {universities.slice(0, 6).map((uni) => (
                  <TouchableOpacity
                    key={uni.id}
                    style={[
                      styles.typeButton,
                      formData.universityId === uni.id && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, universityId: uni.id })}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        formData.universityId === uni.id && styles.typeTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {uni.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Pricing & Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Details</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Monthly Price <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder={t('pricePlaceholder')}
                placeholderTextColor={colors.secondary}
                value={formData.pricePerMonth}
                onChangeText={(text) => setFormData({ ...formData, pricePerMonth: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Currency</Text>
              <View style={styles.typeContainer}>
                {currencies.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.typeButton,
                      { paddingHorizontal: 12 },
                      formData.currency === curr && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, currency: curr })}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        formData.currency === curr && styles.typeTextActive,
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.thirdInput]}>
              <Text style={styles.label}>Bedrooms <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={colors.secondary}
                value={formData.bedrooms}
                onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.thirdInput]}>
              <Text style={styles.label}>Bathrooms <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={colors.secondary}
                value={formData.bathrooms}
                onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.thirdInput]}>
              <Text style={styles.label}>Size (m²) <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder={t('sizePlaceholder')}
                placeholderTextColor={colors.secondary}
                value={formData.squareFeet}
                onChangeText={(text) => setFormData({ ...formData, squareFeet: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Lease Duration <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder={t('leaseDurationPlaceholder')}
                placeholderTextColor={colors.secondary}
                value={formData.leaseDuration}
                onChangeText={(text) => setFormData({ ...formData, leaseDuration: text })}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Max Occupants</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={colors.secondary}
                value={formData.maxOccupants}
                onChangeText={(text) => setFormData({ ...formData, maxOccupants: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Listing Duration <Text style={styles.required}>*</Text></Text>
            <View style={styles.typeContainer}>
              {listingDurations.map((dur) => (
                <TouchableOpacity
                  key={dur.value}
                  style={[
                    styles.typeButton,
                    formData.listingDuration === dur.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, listingDuration: dur.value })}
                >
                  <Text
                    style={[
                      styles.typeText,
                      formData.listingDuration === dur.value && styles.typeTextActive,
                    ]}
                  >
                    {dur.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hint}>How long the listing will be visible</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.hint}>Set the property location on the map (optional but recommended)</Text>
          
          <TouchableOpacity
            style={[
              styles.locationButton,
              (formData.latitude && formData.longitude) ? styles.locationButtonActive : null,
            ]}
            onPress={() => setShowMapModal(true)}
            activeOpacity={0.7}
          >
            <MapPinIcon size={24} color={formData.latitude ? colors.primary : colors.secondary} />
            <Text style={styles.locationButtonText}>
              {formData.latitude && formData.longitude
                ? 'Location Selected'
                : 'Select Location on Map'}
            </Text>
          </TouchableOpacity>

          {formData.latitude && formData.longitude && (
            <View style={styles.mapPreview}>
              <MapView
                style={{ flex: 1 }}
                region={{
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                  }}
                />
              </MapView>
            </View>
          )}
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images <Text style={styles.required}>*</Text></Text>
          <Text style={styles.hint}>Up to 10 images. Remaining: {10 - selectedImages.length}</Text>
          
          <View style={styles.imageSection}>
            <TouchableOpacity 
              style={styles.imageUploadButton} 
              onPress={pickImages}
              disabled={selectedImages.length >= 10}
            >
              <PhotoIcon size={32} color={colors.secondary} />
              <Text style={styles.imageUploadText}>Tap to select images</Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
              <View style={styles.imageGrid}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <XMarkIcon size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <ChevronLeftIcon size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={confirmLocation}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          <MapView
            ref={mapRef}
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={handleMapPress}
          >
            {formData.latitude && formData.longitude && (
              <Marker
                coordinate={{
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                }}
              />
            )}
          </MapView>

          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
            disabled={locationLoading}
            activeOpacity={0.7}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MapPinIcon size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <View style={styles.mapInstructions}>
            <Text style={styles.mapInstructionsText}>
              Tap on the map to select location or use the button to get your current location
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

