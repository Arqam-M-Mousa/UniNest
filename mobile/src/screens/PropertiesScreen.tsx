import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeModernIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { propertyListingsAPI } from '../services/api';

export default function PropertiesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyListingsAPI.list(filters);
      const data = response?.data?.listings || response?.listings || response?.data || [];
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load properties:', error);
      setProperties([]);
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
      padding: 20,
      paddingTop: 60,
      backgroundColor: colors.primary,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    backButton: {
      marginRight: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    searchContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
    },
    searchInput: {
      fontSize: 16,
      color: colors.text,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    filterInput: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      color: colors.text,
    },
    content: {
      padding: 20,
    },
    propertyCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 15,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    propertyImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.border,
    },
    propertyInfo: {
      padding: 15,
    },
    propertyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 5,
    },
    propertyDetails: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 3,
    },
    propertyPrice: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 8,
    },
    loader: {
      padding: 40,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.secondary,
      textAlign: 'center',
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Properties</Text>
        </View>
        <View style={styles.searchContainer}>
          <MagnifyingGlassIcon size={20} color={colors.secondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, title..."
            placeholderTextColor={colors.secondary}
            value={filters.search}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
            onSubmitEditing={loadProperties}
          />
        </View>
        <View style={styles.filterContainer}>
          <TextInput
            style={styles.filterInput}
            placeholder="Min Price"
            placeholderTextColor={colors.secondary}
            keyboardType="numeric"
            value={filters.minPrice}
            onChangeText={(text) => setFilters({ ...filters, minPrice: text })}
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Max Price"
            placeholderTextColor={colors.secondary}
            keyboardType="numeric"
            value={filters.maxPrice}
            onChangeText={(text) => setFilters({ ...filters, maxPrice: text })}
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Beds"
            placeholderTextColor={colors.secondary}
            keyboardType="numeric"
            value={filters.bedrooms}
            onChangeText={(text) => setFilters({ ...filters, bedrooms: text })}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : properties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <HomeModernIcon size={64} color={colors.secondary} />
            <Text style={styles.emptyText}>No properties found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or check back later for new listings
            </Text>
          </View>
        ) : (
          properties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={styles.propertyCard}
              onPress={() => navigation.navigate('PropertyDetails', { id: property.id })}
              activeOpacity={0.7}
            >
              {property.images?.[0] && (
                <Image
                  source={{ uri: property.images[0] }}
                  style={styles.propertyImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle}>{property.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <MapPinIcon size={14} color={colors.secondary} />
                  <Text style={[styles.propertyDetails, { marginLeft: 4, marginBottom: 0 }]}>
                    {property.address}, {property.city}
                  </Text>
                </View>
                <Text style={styles.propertyDetails}>
                  {property.bedrooms} Bedrooms • {property.bathrooms} Bathrooms
                </Text>
                <Text style={styles.propertyPrice}>
                  ${property.price}/month
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
