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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MagnifyingGlassIcon,
  HomeModernIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { propertyListingsAPI, forumAPI } from '../../services/api';

export default function HomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [properties, setProperties] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isStudent = user?.role === 'Student';
  const isLandlord = user?.role === 'Landlord';
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load properties for landlords and admins
      if (isLandlord || isAdmin) {
        const response = await propertyListingsAPI.list({ limit: 10 });
        const data = response?.data?.listings || response?.listings || [];
        const transformed = (Array.isArray(data) ? data : []).map((item: any) => ({
          ...item,
          price: item.pricePerMonth || item.price,
          address: item.city || '',
          images: item.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
        }));
        setProperties(transformed);
      }
      
      // Load community posts for students and admins
      if (isStudent || isAdmin) {
        const postsResponse = await forumAPI.getPosts({ limit: 10 });
        const postsData = postsResponse?.data?.posts || postsResponse?.posts || [];
        setPosts(Array.isArray(postsData) ? postsData : []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
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
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 10,
    },
    searchContainer: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 12,
      marginTop: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    actionCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      width: '48%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionIcon: {
      marginBottom: 8,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
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
    postCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    postTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    postContent: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    postMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    postAuthor: {
      fontSize: 12,
      color: colors.secondary,
    },
    postCategory: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.secondary,
      fontSize: 14,
      padding: 20,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {t('welcomeBackShort')}, {user?.firstName || 'Student'}!
        </Text>
        <View style={styles.searchContainer}>
          <MagnifyingGlassIcon size={20} color={colors.secondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchProperties')}
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('properties')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Properties')}
            activeOpacity={0.7}
          >
            <HomeModernIcon size={32} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>{t('browseProperties')}</Text>
          </TouchableOpacity>

          {/* Find Roommates - Only for Students */}
          {user?.role === 'Student' && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Roommates')}
              activeOpacity={0.7}
            >
              <UserGroupIcon size={32} color={colors.primary} style={styles.actionIcon} />
              <Text style={styles.actionText}>{t('findRoommate')}</Text>
            </TouchableOpacity>
          )}

          {/* My Listings - For all users */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyListings')}
            activeOpacity={0.7}
          >
            <HomeModernIcon size={32} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>{t('myListings')}</Text>
          </TouchableOpacity>

          {/* Marketplace - Only for Students and Admins */}
          {(isStudent || isAdmin) && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Marketplace')}
              activeOpacity={0.7}
            >
              <ShoppingBagIcon size={32} color={colors.primary} style={styles.actionIcon} />
              <Text style={styles.actionText}>{t('marketplace')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Community')}
            activeOpacity={0.7}
          >
            <ChatBubbleLeftRightIcon size={32} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>{t('community')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Community Posts for Students and Admins */}
      {(isStudent || isAdmin) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('communityPosts')}</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                onPress={() => navigation.navigate('PostDetails', { id: post.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent} numberOfLines={2}>
                  {post.content}
                </Text>
                <View style={styles.postMeta}>
                  <Text style={styles.postAuthor}>
                    {t('by')} {post.author?.firstName} {post.author?.lastName}
                  </Text>
                  <Text style={styles.postCategory}>{post.category}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>{t('noCommunityPosts')}</Text>
          )}
        </View>
      )}

      {/* Properties for Landlords and Admins */}
      {(isLandlord || isAdmin) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('featuredProperties')}</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : properties.length > 0 ? (
            properties.map((property) => (
              <TouchableOpacity
                key={property.id}
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
                    <Text style={{ color: colors.secondary, marginTop: 8 }}>{t('noImage')}</Text>
                  </View>
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
                    {property.bedrooms} {t('bedrooms')} • {property.bathrooms} {t('bathrooms')}
                  </Text>
                  <Text style={styles.propertyPrice}>
                    ${property.price}/{t('month')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>{t('noPropertiesAvailable')}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

