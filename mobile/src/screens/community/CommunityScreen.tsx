import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  UserCircleIcon,
  ClockIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { forumAPI } from '../../services/api';
import { format } from 'date-fns';

export default function CommunityScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votingStates, setVotingStates] = useState<Record<string, { upvoted: boolean; downvoted: boolean }>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', 'General', 'Housing', 'Roommates', 'University', 'Tips', 'Questions'];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await forumAPI.getPosts();
      const data = response?.data?.posts || response?.posts || response?.data || [];
      const postsArray = Array.isArray(data) ? data : [];
      
      // Sort: pinned posts first, then by creation date
      const sortedPosts = postsArray.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setPosts(sortedPosts);
      filterPosts(sortedPosts, selectedCategory);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Unable to load posts. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadPosts(true);
  };

  const filterPosts = (postsToFilter: any[], category: string) => {
    if (category === 'All') {
      setFilteredPosts(postsToFilter);
    } else {
      setFilteredPosts(postsToFilter.filter(post => post.category === category));
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterPosts(posts, category);
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      const currentState = votingStates[postId] || { upvoted: false, downvoted: false };
      const isUpvote = voteType === 'up';
      const isCurrentlyVoted = isUpvote ? currentState.upvoted : currentState.downvoted;
      
      // Toggle vote
      await forumAPI.vote(postId, isCurrentlyVoted ? 'none' : voteType);
      
      // Update local state
      setVotingStates(prev => ({
        ...prev,
        [postId]: {
          upvoted: isUpvote ? !currentState.upvoted : false,
          downvoted: !isUpvote ? !currentState.downvoted : false,
        }
      }));
      
      // Update post counts
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          let upvotesChange = 0;
          let downvotesChange = 0;
          
          if (isUpvote) {
            upvotesChange = currentState.upvoted ? -1 : 1;
            if (currentState.downvoted) downvotesChange = -1;
          } else {
            downvotesChange = currentState.downvoted ? -1 : 1;
            if (currentState.upvoted) upvotesChange = -1;
          }
          
          return {
            ...post,
            upvotes: (post.upvotes || 0) + upvotesChange,
            downvotes: (post.downvotes || 0) + downvotesChange,
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Failed to vote:', err);
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    createButtonText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 14,
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
    categoryFilter: {
      paddingHorizontal: 15,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryScroll: {
      flexDirection: 'row',
      gap: 8,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      textTransform: 'capitalize',
    },
    categoryChipTextActive: {
      color: '#FFFFFF',
    },
    pinnedBadge: {
      backgroundColor: '#F59E0B20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 8,
      alignSelf: 'flex-start',
    },
    pinnedText: {
      color: '#F59E0B',
      fontSize: 12,
      fontWeight: '600',
    },
    postFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginTop: 4,
    },
    voteContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    voteButton: {
      padding: 4,
    },
    voteCount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      minWidth: 24,
      textAlign: 'center',
    },
    postStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    postStatText: {
      fontSize: 14,
      color: colors.secondary,
      fontWeight: '500',
    },
    authorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
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
      textAlign: 'center',
      color: colors.secondary,
      fontSize: 16,
      marginTop: 16,
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
          <PlusIcon size={16} color={colors.primary} />
          <Text style={styles.createButtonText}>New Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryChange(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postCard}
            onPress={() => navigation.navigate('PostDetails', { id: item.id })}
            activeOpacity={0.7}
          >
            <View style={styles.postHeader}>
              <View style={styles.authorContainer}>
                <UserCircleIcon size={20} color={colors.secondary} />
                <View>
                  <Text style={styles.postAuthor}>
                    {item.author?.firstName} {item.author?.lastName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <ClockIcon size={12} color={colors.secondary} />
                    <Text style={styles.postTime}>
                      {format(new Date(item.createdAt), 'MMM d, yyyy')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {item.isPinned && (
              <View style={styles.pinnedBadge}>
                <Text style={styles.pinnedText}>📌 Pinned</Text>
              </View>
            )}
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postContent} numberOfLines={3}>
              {item.content}
            </Text>
            <View style={styles.postFooter}>
              <View style={styles.voteContainer}>
                <TouchableOpacity 
                  style={styles.voteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleVote(item.id, 'up');
                  }}
                  activeOpacity={0.6}
                >
                  <ArrowUpIcon 
                    size={20} 
                    color={votingStates[item.id]?.upvoted ? '#10B981' : colors.secondary}
                    strokeWidth={votingStates[item.id]?.upvoted ? 3 : 2}
                  />
                </TouchableOpacity>
                <Text style={styles.voteCount}>
                  {(item.upvotes || 0) - (item.downvotes || 0)}
                </Text>
                <TouchableOpacity 
                  style={styles.voteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleVote(item.id, 'down');
                  }}
                  activeOpacity={0.6}
                >
                  <ArrowDownIcon 
                    size={20} 
                    color={votingStates[item.id]?.downvoted ? '#EF4444' : colors.secondary}
                    strokeWidth={votingStates[item.id]?.downvoted ? 3 : 2}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.postStat}>
                <ChatBubbleLeftIcon size={18} color={colors.secondary} />
                <Text style={styles.postStatText}>{item.commentCount || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadPosts()}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          )
        }
      />
    </View>
  );
}

