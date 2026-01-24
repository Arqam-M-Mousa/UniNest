import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  StarIcon,
} from 'react-native-heroicons/outline';
import { StarIcon as StarSolidIcon } from 'react-native-heroicons/solid';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI } from '../services/api';

export default function PropertyReviewsScreen({ route, navigation }: any) {
  const { propertyId, propertyTitle, listingId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        reviewsAPI.getPropertyReviews(propertyId),
        reviewsAPI.getStats('Listing', propertyId),
      ]);
      setReviews(reviewsRes?.data?.reviews || reviewsRes?.reviews || []);
      setReviewStats(statsRes?.data || statsRes || null);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsAPI.createReview({
        targetType: 'Listing',
        targetId: propertyId,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
      });
      setShowAddReview(false);
      setRating(0);
      setTitle('');
      setComment('');
      Alert.alert('Success', 'Review posted successfully');
      loadReviews();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const StarComponent = i <= rating ? StarSolidIcon : StarIcon;
      stars.push(
        interactive ? (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <StarComponent size={size} color="#F59E0B" />
          </TouchableOpacity>
        ) : (
          <StarComponent key={i} size={size} color="#F59E0B" />
        )
      );
    }
    return stars;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + 10,
      paddingBottom: 15,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 12,
      padding: 5,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    addReviewButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addReviewButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    statsContainer: {
      padding: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    averageRating: {
      fontSize: 48,
      fontWeight: 'bold',
      color: colors.text,
    },
    starsRow: {
      flexDirection: 'row',
      marginVertical: 8,
    },
    totalReviews: {
      fontSize: 14,
      color: colors.secondary,
      marginTop: 4,
    },
    reviewsList: {
      padding: 15,
    },
    reviewCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
    reviewTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    reviewComment: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.secondary,
      textAlign: 'center',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: Math.max(insets.bottom, 20),
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 5,
    },
    closeButtonText: {
      fontSize: 24,
      color: colors.text,
      fontWeight: '300',
    },
    modalBody: {
      padding: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 8,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 15,
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reviews</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {propertyTitle}
        </Text>
        {user?.role === 'Student' && (
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setShowAddReview(true)}
          >
            <Text style={styles.addReviewButtonText}>Write Review</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.averageRating}>
            {reviewStats?.averageRating?.toFixed(1) || '0.0'}
          </Text>
          <View style={styles.starsRow}>
            {renderStars(Math.round(reviewStats?.averageRating || 0), 24)}
          </View>
          <Text style={styles.totalReviews}>
            {reviewStats?.count || 0} {reviewStats?.count === 1 ? 'review' : 'reviews'}
          </Text>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviews.length > 0 ? (
            reviews.map((review: any) => (
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
                <View style={styles.reviewStars}>{renderStars(review.rating)}</View>
                {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No reviews yet. Be the first to review this property!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Review Modal */}
      <Modal
        visible={showAddReview}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddReview(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddReview(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Rating *</Text>
              <View style={styles.ratingContainer}>
                {renderStars(rating, 32, true)}
              </View>

              <Text style={styles.label}>Title (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Summary of your review"
                placeholderTextColor={colors.secondary}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Comment *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your experience with this property..."
                placeholderTextColor={colors.secondary}
                value={comment}
                onChangeText={setComment}
                multiline
              />

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Posting...' : 'Post Review'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
