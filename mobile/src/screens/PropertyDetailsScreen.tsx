import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { propertyListingsAPI, favoritesAPI } from '../services/api';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await propertyListingsAPI.getById(id);
      setProperty(response.listing);
      checkFavorite();
    } catch (error) {
      console.error('Failed to load property:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await favoritesAPI.check(id);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesAPI.remove(id);
      } else {
        await favoritesAPI.add(id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    imageContainer: {
      width: width,
      height: 300,
      backgroundColor: colors.border,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    favoriteButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    price: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 15,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    detailText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    section: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      color: colors.secondary,
      lineHeight: 24,
    },
    amenitiesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    amenityChip: {
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    amenityText: {
      fontSize: 14,
      color: colors.text,
    },
    contactButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    contactButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text }}>
          Property not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {property.images?.[0] && (
          <Image source={{ uri: property.images[0] }} style={styles.image} resizeMode="cover" />
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.price}>${property.price}/month</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailText}>📍 {property.address}, {property.city}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailText}>
            🛏️ {property.bedrooms} Bedrooms • 🚿 {property.bathrooms} Bathrooms
          </Text>
        </View>
        {property.squareFeet && (
          <View style={styles.detailRow}>
            <Text style={styles.detailText}>📐 {property.squareFeet} sq ft</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesList}>
              {property.amenities.map((amenity: string, index: number) => (
                <View key={index} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => navigation.navigate('Messages', { propertyId: property.id })}
          activeOpacity={0.7}
        >
          <Text style={styles.contactButtonText}>Contact Landlord</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
