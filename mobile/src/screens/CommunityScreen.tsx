import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { forumAPI } from '../services/api';
import { format } from 'date-fns';

export default function CommunityScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await forumAPI.getPosts();
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    createButton: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    createButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    postCard: {
      backgroundColor: colors.card,
      padding: 15,
      marginHorizontal: 15,
      marginVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    postAuthor: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
    },
    postTime: {
      fontSize: 12,
      color: colors.secondary,
    },
    postTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    postContent: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 10,
    },
    postFooter: {
      flexDirection: 'row',
      gap: 20,
    },
    postStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    postStatText: {
      fontSize: 14,
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
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Community</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreatePost')}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonText}>+ New Post</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.postCard}
              onPress={() => navigation.navigate('PostDetails', { id: item.id })}
            >
              <View style={styles.postHeader}>
                <Text style={styles.postAuthor}>
                  {item.author?.firstName} {item.author?.lastName}
                </Text>
                <Text style={styles.postTime}>
                  {format(new Date(item.createdAt), 'MMM d, yyyy')}
                </Text>
              </View>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postContent} numberOfLines={3}>
                {item.content}
              </Text>
              <View style={styles.postFooter}>
                <View style={styles.postStat}>
                  <Text>👍</Text>
                  <Text style={styles.postStatText}>{item.likesCount || 0}</Text>
                </View>
                <View style={styles.postStat}>
                  <Text>💬</Text>
                  <Text style={styles.postStatText}>{item.commentsCount || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No posts yet</Text>
          }
        />
      )}
    </View>
  );
}
