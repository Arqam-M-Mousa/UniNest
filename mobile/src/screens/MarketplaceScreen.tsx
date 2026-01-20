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
import { useTheme } from '../context/ThemeContext';
import { marketplaceAPI } from '../services/api';

export default function MarketplaceScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await marketplaceAPI.list({ search: searchQuery });
      setItems(response.items || []);
    } catch (error) {
      console.error('Failed to load marketplace items:', error);
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
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 15,
    },
    searchContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 12,
    },
    searchInput: {
      fontSize: 16,
      color: colors.text,
    },
    content: {
      padding: 20,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 15,
    },
    itemCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
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
    emptyText: {
      textAlign: 'center',
      color: colors.secondary,
      fontSize: 16,
      marginTop: 40,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadItems}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No items found</Text>
        ) : (
          <View style={styles.grid}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                onPress={() => navigation.navigate('MarketplaceItemDetails', { id: item.id })}
              >
                {item.images?.[0] && (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemCondition}>{item.condition}</Text>
                  <Text style={styles.itemPrice}>${item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
