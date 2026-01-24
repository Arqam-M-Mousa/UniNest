import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeftIcon, 
  ChatBubbleLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserCircleIcon,
  ClockIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { forumAPI } from '../services/api';
import { format } from 'date-fns';

export default function PostDetailsScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voteState, setVoteState] = useState<{ upvoted: boolean; downvoted: boolean }>({ upvoted: false, downvoted: false });

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await forumAPI.getPostById(id);
      const data = response?.data || response;
      setPost(data);
      setComments(data.comments || []);
      setVoteState({
        upvoted: data.userVote === 'up',
        downvoted: data.userVote === 'down',
      });
    } catch (err: any) {
      console.error('Failed to load post:', err);
      setError('Unable to load post details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      navigation.navigate('SignIn');
      return;
    }
    try {
      const isUpvote = voteType === 'up';
      const isCurrentlyVoted = isUpvote ? voteState.upvoted : voteState.downvoted;
      
      await forumAPI.vote(id, isCurrentlyVoted ? 'none' : voteType);
      
      const newVoteState = {
        upvoted: isUpvote ? !voteState.upvoted : false,
        downvoted: !isUpvote ? !voteState.downvoted : false,
      };
      setVoteState(newVoteState);
      
      setPost((prev: any) => {
        let upvotesChange = 0;
        let downvotesChange = 0;
        
        if (isUpvote) {
          upvotesChange = voteState.upvoted ? -1 : 1;
          if (voteState.downvoted) downvotesChange = -1;
        } else {
          downvotesChange = voteState.downvoted ? -1 : 1;
          if (voteState.upvoted) upvotesChange = -1;
        }
        
        return {
          ...prev,
          upvotes: (prev.upvotes || 0) + upvotesChange,
          downvotes: (prev.downvotes || 0) + downvotesChange,
        };
      });
    } catch (err) {
      console.error('Failed to vote:', err);
      Alert.alert('Error', 'Unable to update vote. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      navigation.navigate('SignIn');
      return;
    }
    if (!commentText.trim()) {
      return;
    }
    try {
      setSubmitting(true);
      const response = await forumAPI.addComment(id, commentText.trim());
      const newComment = response?.data || response;
      setComments([...comments, newComment]);
      setCommentText('');
      setPost((prev: any) => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1,
      }));
    } catch (err) {
      console.error('Failed to add comment:', err);
      Alert.alert('Error', 'Unable to post comment. Please try again.');
    } finally {
      setSubmitting(false);
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
    content: {
      padding: 20,
    },
    postCard: {
      backgroundColor: colors.card,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    authorInfo: {
      flex: 1,
    },
    authorName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    postTime: {
      fontSize: 13,
      color: colors.secondary,
      marginTop: 2,
    },
    postTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      lineHeight: 32,
    },
    postContent: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      marginBottom: 16,
    },
    postActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    voteContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    voteButton: {
      padding: 6,
    },
    voteCount: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      minWidth: 32,
      textAlign: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionText: {
      fontSize: 14,
      color: colors.secondary,
      fontWeight: '500',
    },
    authorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    commentsSection: {
      marginTop: 24,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    commentCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    commentAuthorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 8,
    },
    commentAuthor: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    commentTime: {
      fontSize: 12,
      color: colors.secondary,
      marginLeft: 8,
    },
    commentContent: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    commentInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: Math.max(insets.bottom + 12, 12),
    },
    commentInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      maxHeight: 100,
    },
    sendButton: {
      backgroundColor: colors.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
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
    emptyComments: {
      textAlign: 'center',
      color: colors.secondary,
      fontSize: 15,
      marginTop: 12,
      lineHeight: 22,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Details</Text>
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Post not found'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPost}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.authorContainer}>
              <UserCircleIcon size={24} color={colors.secondary} />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {post.author?.firstName} {post.author?.lastName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <ClockIcon size={14} color={colors.secondary} />
                  <Text style={styles.postTime}>
                    {format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          <View style={styles.postActions}>
            <View style={styles.voteContainer}>
              <TouchableOpacity 
                style={styles.voteButton}
                onPress={() => handleVote('up')}
                activeOpacity={0.6}
              >
                <ArrowUpIcon 
                  size={24} 
                  color={voteState.upvoted ? '#10B981' : colors.secondary}
                  strokeWidth={voteState.upvoted ? 3 : 2}
                />
              </TouchableOpacity>
              <Text style={styles.voteCount}>
                {(post.upvotes || 0) - (post.downvotes || 0)}
              </Text>
              <TouchableOpacity 
                style={styles.voteButton}
                onPress={() => handleVote('down')}
                activeOpacity={0.6}
              >
                <ArrowDownIcon 
                  size={24} 
                  color={voteState.downvoted ? '#EF4444' : colors.secondary}
                  strokeWidth={voteState.downvoted ? 3 : 2}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.actionButton}>
              <ChatBubbleLeftIcon size={20} color={colors.secondary} />
              <Text style={styles.actionText}>{post.commentCount || 0} comments</Text>
            </View>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
          {comments.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <ChatBubbleLeftIcon size={48} color={colors.secondary} />
              <Text style={styles.emptyComments}>No comments yet. Be the first to comment!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAuthorContainer}>
                    <UserCircleIcon size={20} color={colors.secondary} />
                    <Text style={styles.commentAuthor}>
                      {comment.author?.firstName} {comment.author?.lastName}
                    </Text>
                    <Text style={styles.commentTime}>
                      • {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          placeholderTextColor={colors.secondary}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!commentText.trim() || submitting) && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!commentText.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>→</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
