import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  HeartIcon,
  MapPinIcon,
} from 'react-native-heroicons/outline';
import { HeartIcon as HeartSolidIcon } from 'react-native-heroicons/solid';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { favoritesAPI } from '../../services/api';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl?: string;
  bedrooms: number;
  bathrooms: number;
}

export default function FavoritesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await favoritesAPI.list();
      const data = response?.data?.listings || response?.listings || response?.data || [];
      // Transform API response to match expected format
      const transformed = (Array.isArray(data) ? data : []).map((item: any) => ({
        ...item,
        price: item.pricePerMonth || item.price,
        location: item.city || '',
        imageUrl: item.images?.[0]?.url || (typeof item.images?.[0] === 'string' ? item.images[0] : null),
      }));
      setFavorites(transformed);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleRemoveFavorite = async (listingId: string, propertyId: string) => {
    try {
      // Favorites API uses listingId (Listing.id), not PropertyListing.id
      await favoritesAPI.remove(listingId);
      setFavorites(favorites.filter((f: any) => f.id !== propertyId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
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
      paddingTop: insets.top + 10,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    imagePlaceholder: {
      width: '100%',
      height: 180,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 16,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardImage: {
      width: '100%',
      height: 180,
      backgroundColor: colors.border,
    },
    cardImagePlaceholder: {
      width: '100%',
      height: 180,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardContent: {
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    cardPrice: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    cardLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    cardLocationText: {
      fontSize: 14,
      color: colors.secondary,
      marginLeft: 4,
    },
    cardDetails: {
      flexDirection: 'row',
      marginTop: 12,
    },
    cardDetail: {
      fontSize: 14,
      color: colors.secondary,
      marginRight: 16,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.secondary,
      textAlign: 'center',
      marginTop: 8,
    },
    loader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PropertyDetails', { id: item.id })}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MapPinIcon size={48} color={colors.secondary} />
          <Text style={{ color: colors.secondary, marginTop: 8 }}>{t('noImageText')}</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => handleRemoveFavorite(item.listingId, item.id)} activeOpacity={0.7}>
            <HeartSolidIcon size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardPrice}>${item.price}/mo</Text>
        <View style={styles.cardLocation}>
          <MapPinIcon size={16} color={colors.secondary} />
          <Text style={styles.cardLocationText}>{item.location}</Text>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardDetail}>{item.bedrooms} {t('beds')}</Text>
          <Text style={styles.cardDetail}>{item.bathrooms} {t('baths')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('favoritesTitle')}</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('favoritesTitle')}</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <HeartIcon size={64} color={colors.secondary} />
          <Text style={styles.emptyText}>{t('noFavoritesYet')}</Text>
          <Text style={styles.emptySubtext}>
            {t('startExploringFavorites')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}

