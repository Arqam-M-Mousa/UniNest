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
  RefreshControl,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeModernIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { propertyListingsAPI } from '../services/api';

export default function PropertiesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllUniversities, setShowAllUniversities] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    universityId: user?.universityId || '',
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Apply university filter unless user wants to see all
      const searchFilters = {
        ...filters,
        universityId: showAllUniversities ? '' : (user?.universityId || ''),
      };
      
      const response = await propertyListingsAPI.list(searchFilters);
      const data = response?.data?.listings || response?.listings || response?.data || [];
      const transformed = (Array.isArray(data) ? data : []).map((item: any) => ({
        ...item,
        price: item.pricePerMonth || item.price,
        address: item.city || '',
        images: item.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
      }));
      setProperties(transformed);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError('Unable to load properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadProperties(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      paddingTop: insets.top + 10,
      backgroundColor: colors.primary,
    },
    imagePlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      gap: 8,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      flex: 1,
    },
    filterInput: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      minWidth: 80,
    },
    applyButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    applyButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    listContent: {
      padding: 20,
      paddingBottom: 40,
    },
    propertyCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
    errorText: {
      fontSize: 16,
      color: '#EF4444',
      textAlign: 'center',
      marginBottom: 12,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 8,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    universityToggle: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 12,
      alignItems: 'center',
    },
    universityToggleText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
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
          <MagnifyingGlassIcon size={20} color={colors.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, title..."
            placeholderTextColor={colors.secondary}
            value={filters.search}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
            onSubmitEditing={() => loadProperties()}
            returnKeyType="search"
          />
        </View>
        {user?.universityId && (
          <TouchableOpacity
            style={styles.universityToggle}
            onPress={() => {
              setShowAllUniversities(!showAllUniversities);
              setTimeout(() => loadProperties(), 100);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.universityToggleText}>
              {showAllUniversities ? 'Show My University Only' : 'Show All Universities'}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <TextInput
              style={styles.filterInput}
              placeholder="Min"
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
              value={filters.minPrice}
              onChangeText={(text) => setFilters({ ...filters, minPrice: text })}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Max"
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
          <TouchableOpacity style={styles.applyButton} onPress={() => loadProperties()} activeOpacity={0.7}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        style={styles.content}
        contentContainerStyle={styles.listContent}
        data={properties}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadProperties()}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <HomeModernIcon size={64} color={colors.secondary} />
              <Text style={styles.emptyText}>No properties found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or check back later for new listings
              </Text>
            </View>
          )
        }
        renderItem={({ item: property }) => (
          <TouchableOpacity
            style={styles.propertyCard}
            onPress={() => navigation.navigate('PropertyDetails', { id: property.id })}
            activeOpacity={0.7}
          >
            {property.images?.[0] ? (
              <Image
                source={{ uri: property.images[0] }}
                style={styles.propertyImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <HomeModernIcon size={48} color={colors.secondary} />
                <Text style={{ color: colors.secondary, marginTop: 8 }}>No Image</Text>
              </View>
            )}
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle} numberOfLines={2}>{property.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <MapPinIcon size={14} color={colors.secondary} />
                <Text style={[styles.propertyDetails, { marginLeft: 4, marginBottom: 0 }]} numberOfLines={1}>
                  {property.address}, {property.city}
                </Text>
              </View>
              <Text style={styles.propertyDetails}>
                {property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''} • {property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}
              </Text>
              <Text style={styles.propertyPrice}>
                ${property.price}/month
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
