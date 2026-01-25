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
import { ShoppingBagIcon, MagnifyingGlassIcon, ChevronLeftIcon, PlusIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { marketplaceAPI } from '../../services/api';

export default function MarketplaceScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await marketplaceAPI.list({ search: searchQuery });
      const data = response?.data?.items || response?.items || response?.data?.listings || response?.listings || [];
      const transformed = (Array.isArray(data) ? data : []).map((item: any) => ({
        ...item,
        price: item.price || item.itemDetails?.price,
        condition: item.condition || item.itemDetails?.condition,
        images: item.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
      }));
      setItems(transformed);
    } catch (err) {
      console.error('Failed to load marketplace items:', err);
      setError(t('somethingWentWrong'));
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadItems(true);
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
      height: 150,
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
      flex: 1,
    },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    content: {
      flex: 1,
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    itemCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    itemImage: {
      width: '100%',
      height: 150,
      backgroundColor: colors.border,
    },
    itemInfo: {
      padding: 12,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 5,
    },
    itemPrice: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 5,
    },
    itemCondition: {
      fontSize: 12,
      color: colors.secondary,
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('marketplaceTitle')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddMarketplaceItem')}
            activeOpacity={0.7}
          >
            <PlusIcon size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <MagnifyingGlassIcon size={20} color={colors.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchItems')}
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => loadItems()}
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        style={styles.content}
        contentContainerStyle={styles.listContent}
        data={items}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadItems()}>
                <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ShoppingBagIcon size={64} color={colors.secondary} />
              <Text style={styles.emptyText}>{t('noItemsFound')}</Text>
              <Text style={styles.emptySubtext}>
                {t('checkBackLater')}
              </Text>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <View style={{ width: '48%' }}>
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => navigation.navigate('MarketplaceItemDetails', { id: item.id })}
              activeOpacity={0.7}
            >
              {item.images?.[0] ? (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <ShoppingBagIcon size={32} color={colors.secondary} />
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.itemCondition}>{item.condition}</Text>
                <Text style={styles.itemPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

