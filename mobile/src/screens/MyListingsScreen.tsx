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
  Alert,
} from 'react-native';
import {
  ChevronLeftIcon,
  PlusIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { propertyListingsAPI } from '../services/api';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl?: string;
  isVisible: boolean;
  bedrooms: number;
  bathrooms: number;
}

export default function MyListingsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      const response = await propertyListingsAPI.getMyListings();
      const data = response?.data?.listings || response?.data || [];
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      await propertyListingsAPI.toggleVisibility(id);
      setListings(
        listings.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible } : l))
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update visibility.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyListingsAPI.delete(id);
              setListings(listings.filter((l) => l.id !== id));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete listing.');
            }
          },
        },
      ]
    );
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
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 16,
    },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
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
      height: 160,
      backgroundColor: colors.border,
    },
    cardImagePlaceholder: {
      width: '100%',
      height: 160,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hiddenOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    hiddenText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    cardContent: {
      padding: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    cardPrice: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 4,
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
    cardActions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    actionButtonLast: {
      borderRightWidth: 0,
    },
    actionText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 6,
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

  const renderItem = ({ item }: { item: Property }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
      >
        {item.imageUrl ? (
          <View>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            {!item.isVisible && (
              <View style={styles.hiddenOverlay}>
                <EyeSlashIcon size={24} color="#FFFFFF" />
                <Text style={styles.hiddenText}>Hidden</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <MapPinIcon size={48} color={colors.secondary} />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardPrice}>${item.price}/mo</Text>
          <View style={styles.cardLocation}>
            <MapPinIcon size={16} color={colors.secondary} />
            <Text style={styles.cardLocationText}>{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleVisibility(item.id)}
          activeOpacity={0.7}
        >
          {item.isVisible ? (
            <>
              <EyeSlashIcon size={18} color={colors.text} />
              <Text style={styles.actionText}>Hide</Text>
            </>
          ) : (
            <>
              <EyeIcon size={18} color={colors.text} />
              <Text style={styles.actionText}>Show</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <PencilIcon size={18} color={colors.text} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonLast]}
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
        >
          <TrashIcon size={18} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Listings</Text>
          </View>
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
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Listings</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddListing')} activeOpacity={0.7}>
          <PlusIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MapPinIcon size={64} color={colors.secondary} />
          <Text style={styles.emptyText}>No listings yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first property listing to start renting
          </Text>
        </View>
      ) : (
        <FlatList
          data={listings}
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
