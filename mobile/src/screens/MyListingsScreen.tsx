import React, { useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useAuth } from '../context/AuthContext';
import { propertyListingsAPI, marketplaceAPI, forumAPI } from '../services/api';

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
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isStudent = user?.role === 'Student';
  const isLandlord = user?.role === 'Landlord';
  const isAdmin = user?.role === 'Admin';
  
  const [activeTab, setActiveTab] = useState<'properties' | 'marketplace' | 'posts'>(
    isLandlord ? 'properties' : isStudent ? 'posts' : 'properties'
  );

  const fetchListings = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (activeTab === 'properties') {
        const response = await propertyListingsAPI.getMyListings();
        data = response?.data?.listings || response?.listings || response?.data || [];
        const transformed = (Array.isArray(data) ? data : []).map((item: any) => ({
          ...item,
          type: 'property',
          price: item.pricePerMonth || item.price,
          location: item.city || '',
          imageUrl: item.images?.[0]?.url || (typeof item.images?.[0] === 'string' ? item.images[0] : null),
        }));
        setListings(transformed);
      } else if (activeTab === 'marketplace') {
        const response = await marketplaceAPI.getMyItems();
        data = response?.data?.listings || response?.listings || response?.data || [];
        const transformed = (Array.isArray(data) ? data : []).map((item: any) => ({
          ...item,
          type: 'marketplace',
          price: item.price || item.itemDetails?.price,
          location: item.location || 'N/A',
          imageUrl: item.images?.[0]?.url || (typeof item.images?.[0] === 'string' ? item.images[0] : null),
        }));
        setListings(transformed);
      } else if (activeTab === 'posts') {
        const response = await forumAPI.getPosts();
        const allPosts = response?.data?.posts || response?.posts || response?.data || [];
        const myPosts = (Array.isArray(allPosts) ? allPosts : []).filter(
          (post: any) => post.author?.id === user?.id
        );
        const transformed = myPosts.map((item: any) => ({
          ...item,
          type: 'post',
          imageUrl: null,
        }));
        setListings(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

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

  const handleDelete = (id: string, type: string) => {
    Alert.alert(
      `Delete ${type === 'post' ? 'Post' : 'Listing'}`,
      `Are you sure you want to delete this ${type === 'post' ? 'post' : 'listing'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'property') {
                await propertyListingsAPI.delete(id);
              } else if (type === 'marketplace') {
                await marketplaceAPI.delete(id);
              } else if (type === 'post') {
                await forumAPI.deletePost(id);
              }
              setListings(listings.filter((l) => l.id !== id));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete.');
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
      paddingTop: insets.top + 10,
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
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.secondary,
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: '600',
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

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => {
          if (item.type === 'property') navigation.navigate('PropertyDetails', { id: item.id });
          else if (item.type === 'marketplace') navigation.navigate('MarketplaceItemDetails', { id: item.id });
          else if (item.type === 'post') navigation.navigate('PostDetails', { id: item.id });
        }}
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
          {item.type !== 'post' && (
            <Text style={styles.cardPrice}>
              ${item.price}{item.type === 'property' ? '/mo' : ''}
            </Text>
          )}
          {item.type !== 'post' && item.location && (
            <View style={styles.cardLocation}>
              <MapPinIcon size={16} color={colors.secondary} />
              <Text style={styles.cardLocationText}>{item.location}</Text>
            </View>
          )}
          {item.type === 'post' && (
            <Text style={styles.cardLocationText} numberOfLines={2}>
              {item.content}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.cardActions}>
        {item.type !== 'post' && (
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
        )}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => {
            if (item.type === 'property') navigation.navigate('EditListing', { id: item.id });
            else if (item.type === 'post') navigation.navigate('EditPost', { id: item.id });
          }}
          activeOpacity={0.7}
        >
          <PencilIcon size={18} color={colors.text} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonLast]}
          onPress={() => handleDelete(item.id, item.type)}
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
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            if (activeTab === 'properties') navigation.navigate('AddListing');
            else if (activeTab === 'marketplace') navigation.navigate('AddMarketplaceItem');
            else if (activeTab === 'posts') navigation.navigate('CreatePost');
          }} 
          activeOpacity={0.7}
        >
          <PlusIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {/* Students: Posts and Marketplace */}
        {isStudent && (
          <>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                Posts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'marketplace' && styles.activeTab]}
              onPress={() => setActiveTab('marketplace')}
            >
              <Text style={[styles.tabText, activeTab === 'marketplace' && styles.activeTabText]}>
                Marketplace
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        {/* Landlords: Properties only */}
        {isLandlord && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'properties' && styles.activeTab]}
            onPress={() => setActiveTab('properties')}
          >
            <Text style={[styles.tabText, activeTab === 'properties' && styles.activeTabText]}>
              Properties
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Admins: All tabs */}
        {isAdmin && (
          <>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'properties' && styles.activeTab]}
              onPress={() => setActiveTab('properties')}
            >
              <Text style={[styles.tabText, activeTab === 'properties' && styles.activeTabText]}>
                Properties
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                Posts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'marketplace' && styles.activeTab]}
              onPress={() => setActiveTab('marketplace')}
            >
              <Text style={[styles.tabText, activeTab === 'marketplace' && styles.activeTabText]}>
                Marketplace
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MapPinIcon size={64} color={colors.secondary} />
          <Text style={styles.emptyText}>
            {activeTab === 'posts' ? 'No posts yet' : 'No listings yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'posts' 
              ? 'Create your first post to start sharing'
              : activeTab === 'marketplace'
              ? 'Create your first marketplace listing'
              : 'Create your first property listing to start renting'}
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
