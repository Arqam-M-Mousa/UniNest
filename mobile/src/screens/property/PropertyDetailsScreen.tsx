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
  FlatList,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HomeModernIcon,
  ChevronLeftIcon,
  HeartIcon,
  PlayIcon,
  XMarkIcon,
  StarIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
  MapPinIcon,
} from 'react-native-heroicons/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from 'react-native-heroicons/solid';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { propertyListingsAPI, favoritesAPI, reviewsAPI, conversationsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

// Video component using expo-video
function PropertyVideo({ videoUrl, colors, styles, t }: { videoUrl: string; colors: any; styles: any; t: (key: string) => string }) {
  const player = useVideoPlayer(videoUrl, player => {
    player.loop = false;
  });

  return (
    <View style={styles.videoSection}>
      <View style={styles.videoHeader}>
        <PlayIcon size={20} color={colors.text} />
        <Text style={styles.videoTitle}>{t('propertyVideo')}</Text>
      </View>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
}

// 360 Image Viewer using WebView with Pannellum
function Image360Viewer({ imageUrl, colors }: { imageUrl: string; colors: any }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
      <script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
      <style>
        * { margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #panorama { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="panorama"></div>
      <script>
        pannellum.viewer('panorama', {
          type: 'equirectangular',
          panorama: '${imageUrl}',
          autoLoad: true,
          autoRotate: -2,
          compass: false,
          showControls: true,
          mouseZoom: true,
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

export default function PropertyDetailsScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await propertyListingsAPI.getById(id);
      const data = response?.data || response;
      // Transform API response to match expected format
      const transformed = {
        ...data,
        price: data.pricePerMonth || data.price,
        address: data.city || '',
        images: data.images?.map((img: any) => ({
          url: typeof img === 'string' ? img : img.url,
          is360: img.is360 || false,
        })) || [],
        amenities: data.amenitiesJson ? (typeof data.amenitiesJson === 'string' ? JSON.parse(data.amenitiesJson) : data.amenitiesJson) : [],
        video: data.video || null,
        owner: data.owner || null,
      };
      setProperty(transformed);
      // Store listingId for favorites (favorites API uses Listing.id, not PropertyListing.id)
      setListingId(data.listingId);
      if (data.listingId) {
        checkFavorite(data.listingId);
        loadReviews(data.id);
      }
    } catch (error) {
      console.error('Failed to load property:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (propertyId: string) => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        reviewsAPI.getPropertyReviews(propertyId),
        reviewsAPI.getStats('Listing', propertyId),
      ]);
      setReviews(reviewsRes?.data?.reviews || reviewsRes?.reviews || []);
      setReviewStats(statsRes?.data || statsRes || null);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleContactLandlord = async () => {
    if (!user) {
      navigation.navigate('SignIn');
      return;
    }
    if (user.id === property?.owner?.id) {
      return; // Can't message yourself
    }
    try {
      // Check for existing conversation first
      const conversationsResponse = await conversationsAPI.list();
      const conversations = conversationsResponse?.data?.conversations || conversationsResponse?.conversations || conversationsResponse?.data || [];
      
      // Find existing conversation with this landlord and property
      const existingConv = conversations.find((conv: any) => 
        conv.propertyId === property?.id &&
        ((conv.studentId === user.id && conv.landlordId === property?.owner?.id) ||
         (conv.landlordId === user.id && conv.studentId === property?.owner?.id))
      );

      if (existingConv) {
        // Open existing conversation
        navigation.navigate('Main', { screen: 'Messages', params: { conversationId: existingConv.id } });
        return;
      }

      // Create new conversation if none exists
      const response = await conversationsAPI.create({
        studentId: user.id,
        landlordId: property?.owner?.id,
        propertyId: property?.id,
      });
      const conversationId = response?.data?.id || response?.id;
      if (conversationId) {
        navigation.navigate('Main', { screen: 'Messages', params: { conversationId } });
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      navigation.navigate('Main', { screen: 'Messages', params: { propertyId: property?.id } });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarSolidIcon key={i} size={16} color="#F59E0B" />
        ) : (
          <StarIcon key={i} size={16} color={colors.secondary} />
        )
      );
    }
    return stars;
  };

  const checkFavorite = async (favListingId: string) => {
    try {
      const response = await favoritesAPI.check(favListingId);
      setIsFavorite(response?.data?.isFavorite || response?.isFavorite || false);
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!listingId) return;
    try {
      if (isFavorite) {
        await favoritesAPI.remove(listingId);
      } else {
        await favoritesAPI.add(listingId);
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
      top: insets.top + 10,
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
      top: insets.top + 10,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.border,
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
    propertyPrice: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailText: {
      fontSize: 15,
      color: colors.secondary,
    },
    section: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    description: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    amenitiesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    amenityChip: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    amenityText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '500',
    },
    contactButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    contactButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnailContainer: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 8,
    },
    thumbnail: {
      width: 70,
      height: 70,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    thumbnailActive: {
      borderColor: colors.primary,
    },
    videoSection: {
      marginTop: 20,
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    videoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    videoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    video: {
      width: '100%',
      height: 220,
    },
    ownerCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    ownerAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    ownerAvatarText: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: 'bold',
    },
    propertyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    ownerRole: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 12,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B98120',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 12,
    },
    verifiedText: {
      color: '#10B981',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    ownerActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    ownerActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    ownerActionButtonSecondary: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ownerActionText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 6,
    },
    ownerActionTextSecondary: {
      color: colors.text,
    },
    reviewsSection: {
      marginTop: 20,
    },
    reviewsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    reviewsSummary: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reviewsRating: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginRight: 8,
    },
    reviewsCount: {
      fontSize: 14,
      color: colors.secondary,
    },
    reviewCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reviewerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    reviewerAvatarText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    reviewerInfo: {
      flex: 1,
    },
    reviewerName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    reviewDate: {
      fontSize: 12,
      color: colors.secondary,
    },
    reviewStars: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    reviewComment: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
    },
    modalCloseButton: {
      position: 'absolute',
      top: insets.top + 10,
      right: 20,
      zIndex: 10,
      padding: 8,
    },
    modalImage: {
      width: width,
      height: '100%',
    },
    modalCounter: {
      position: 'absolute',
      bottom: insets.bottom + 20,
      alignSelf: 'center',
      color: '#FFFFFF',
      fontSize: 16,
    },
    bottomPadding: {
      height: Math.max(insets.bottom + 20, 40),
    },
    noReviewsContainer: {
      padding: 32,
      alignItems: 'center',
    },
    noReviewsText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    noReviewsSubtext: {
      fontSize: 14,
      color: colors.secondary,
      textAlign: 'center',
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
          {t('propertyNotFound')}
        </Text>
      </View>
    );
  }

  const regularImages = property?.images?.filter((img: any) => !img.is360) || [];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {regularImages[activeImageIndex]?.url ? (
            <TouchableOpacity onPress={() => setShowImageModal(true)} activeOpacity={0.9}>
              <Image source={{ uri: regularImages[activeImageIndex].url }} style={styles.image} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePlaceholder}>
              <HomeModernIcon size={64} color={colors.secondary} />
              <Text style={{ color: colors.secondary, marginTop: 12 }}>{t('noImageAvailable')}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ChevronLeftIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite} activeOpacity={0.7}>
            {isFavorite ? (
              <HeartSolidIcon size={24} color="#EF4444" />
            ) : (
              <HeartIcon size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Image Thumbnails */}
        {regularImages.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
            {regularImages.map((img: any, index: number) => (
              <TouchableOpacity key={index} onPress={() => setActiveImageIndex(index)}>
                <Image
                  source={{ uri: img.url }}
                  style={[styles.thumbnail, index === activeImageIndex && styles.thumbnailActive]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyPrice}>${property.price}/month</Text>

          <View style={styles.detailRow}>
            <MapPinIcon size={16} color={colors.secondary} />
            <Text style={[styles.detailText, { marginLeft: 6 }]}>{property.address || property.city}</Text>
          </View>
          <View style={styles.detailRow}>
            <HomeModernIcon size={16} color={colors.secondary} />
            <Text style={[styles.detailText, { marginLeft: 6 }]}>
              {property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''} • {property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}
              {property.squareFeet ? ` • ${property.squareFeet} m²` : ''}
            </Text>
          </View>
          {property.distanceToUniversity && (
            <View style={styles.detailRow}>
              <MapPinIcon size={16} color={colors.secondary} />
              <Text style={[styles.detailText, { marginLeft: 6 }]}>{property.distanceToUniversity}m to university</Text>
            </View>
          )}

          {/* 360 Image Section */}
          {property.images?.some((img: any) => img.is360) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('panorama360')}</Text>
              {property.images
                .filter((img: any) => img.is360)
                .map((img: any, index: number) => (
                  <Image360Viewer key={index} imageUrl={img.url} colors={colors} />
                ))}
            </View>
          )}

          {/* Video Section */}
          {property.video?.url && (
            <PropertyVideo videoUrl={property.video.url} colors={colors} styles={styles} t={t} />
          )}

          {/* Description */}
          {property.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('description')}</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('amenities')}</Text>
              <View style={styles.amenitiesList}>
                {property.amenities.map((amenity: string, index: number) => (
                  <View key={index} style={styles.amenityChip}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>{t('reviews')}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('PropertyReviews', { 
                  propertyId: property.id,
                  propertyTitle: property.title,
                  listingId: listingId,
                })}
                activeOpacity={0.7}
              >
                <View style={styles.reviewsSummary}>
                  <Text style={styles.reviewsRating}>
                    {reviewStats?.averageRating?.toFixed(1) || '0.0'}
                  </Text>
                  <StarSolidIcon size={20} color="#F59E0B" />
                  <Text style={styles.reviewsCount}> ({reviewStats?.count || 0})</Text>
                </View>
              </TouchableOpacity>
            </View>
            {reviews.length > 0 ? (
              reviews.slice(0, 3).map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerAvatarText}>
                        {review.student?.firstName?.[0]}
                      </Text>
                    </View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>
                        {review.student?.firstName} {review.student?.lastName}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reviewStars}>
                    {renderStars(review.rating)}
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.noReviewsContainer}>
                <Text style={styles.noReviewsText}>{t('noReviewsYet')}</Text>
                <Text style={styles.noReviewsSubtext}>{t('beFirstToReview')}</Text>
              </View>
            )}
          </View>

          {/* Contact Button */}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactLandlord}
            activeOpacity={0.7}
          >
            <Text style={styles.contactButtonText}>{t('contactLandlord')}</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal visible={showImageModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <XMarkIcon size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <FlatList
            data={regularImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={activeImageIndex}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.url }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          <Text style={styles.modalCounter}>
            {activeImageIndex + 1} / {regularImages.length}
          </Text>
        </View>
      </Modal>
    </View>
  );
}

