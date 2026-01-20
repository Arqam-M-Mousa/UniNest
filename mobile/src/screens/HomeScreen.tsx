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
  HomeModernIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { propertyListingsAPI } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertyListingsAPI.list({ limit: 10 });
      setProperties(response.listings || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
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
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome back, {user?.firstName || 'Student'}!
        </Text>
        <View style={styles.searchContainer}>
          <MagnifyingGlassIcon size={20} color={colors.secondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Properties')}
          >
            <HomeModernIcon size={32} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Browse Properties</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Roommates')}
          >
            <UserGroupIcon size={32} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Find Roommates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Marketplace')}
          >
            <ShoppingBagIcon size={32} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Marketplace</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Community')}
          >
            <ChatBubbleLeftRightIcon size={32} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Community</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Properties</Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          properties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={styles.propertyCard}
              onPress={() => navigation.navigate('PropertyDetails', { id: property.id })}
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
      </View>
    </ScrollView>
  );
}
