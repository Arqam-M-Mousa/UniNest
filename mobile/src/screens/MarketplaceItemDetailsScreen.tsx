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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceAPI } from '../services/api';

const { width } = Dimensions.get('window');

export default function MarketplaceItemDetailsScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await marketplaceAPI.getById(id);
      const data = response?.data || response;
      const transformed = {
        ...data,
        price: data.price || data.itemDetails?.price,
        condition: data.condition || data.itemDetails?.condition,
        category: data.category || data.itemDetails?.category,
        images: data.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
        seller: data.seller || data.student || null,
      };
      setItem(transformed);
    } catch (err: any) {
      console.error('Failed to load item:', err);
      setError('Unable to load item details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      navigation.navigate('SignIn');
      return;
    }
    if (user.id === item?.seller?.id) {
      Alert.alert('Info', "This is your listing");
      return;
    }
    try {
      // First go back to close this screen
      navigation.goBack();
      
      // Then navigate to Messages tab with params using a small delay
      setTimeout(() => {
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate('Main', {
            screen: 'Messages',
            params: {
              recipientId: item?.seller?.id,
              recipientName: `${item?.seller?.firstName} ${item?.seller?.lastName}`,
              itemId: item?.id,
              itemTitle: item?.title,
            }
          });
        }
      }, 100);
    } catch (err) {
      console.error('Failed to navigate to messages:', err);
      Alert.alert('Error', 'Unable to open messages. Please try again.');
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
    imageContainer: {
      width: width,
      height: 300,
      backgroundColor: colors.border,
    },
    image: {
      width: '100%',
      height: '100%',
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
      marginBottom: 8,
    },
    price: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 12,
    },
    categoryBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    categoryText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    conditionBadge: {
      backgroundColor: '#10B98120',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    conditionText: {
      color: '#10B981',
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    section: {
      marginTop: 20,
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
    sellerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    sellerAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    sellerAvatarText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '700',
    },
    sellerInfo: {
      flex: 1,
    },
    sellerName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    sellerRole: {
      fontSize: 14,
      color: colors.secondary,
      textTransform: 'capitalize',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailText: {
      fontSize: 14,
      color: colors.secondary,
      marginLeft: 8,
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    errorText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    bottomPadding: {
      height: Math.max(insets.bottom + 20, 40),
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Details</Text>
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Item not found'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadItem}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Item Details</Text>
      </View>

      <ScrollView>
        <View style={styles.imageContainer}>
          {item.images?.[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ color: colors.secondary }}>No Image Available</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>${item.price}</Text>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 16 }}>
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
            {item.condition && (
              <View style={styles.conditionBadge}>
                <Text style={styles.conditionText}>{item.condition}</Text>
              </View>
            )}
          </View>

          {item.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}

          {item.seller && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seller Information</Text>
              <View style={styles.sellerCard}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerAvatarText}>
                    {item.seller.firstName?.[0]}{item.seller.lastName?.[0]}
                  </Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>
                    {item.seller.firstName} {item.seller.lastName}
                  </Text>
                  <Text style={styles.sellerRole}>{item.seller.role || 'Student'}</Text>
                </View>
              </View>
            </View>
          )}

          {item.location && (
            <View style={styles.section}>
              <View style={styles.detailRow}>
                <MapPinIcon size={18} color={colors.secondary} />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
            </View>
          )}

          {item.createdAt && (
            <View style={styles.detailRow}>
              <ClockIcon size={18} color={colors.secondary} />
              <Text style={styles.detailText}>
                Listed {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSeller}
            activeOpacity={0.7}
          >
            <Text style={styles.contactButtonText}>Contact Seller</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
}
