import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 to reach host machine's localhost
// For iOS simulator, localhost works
// For physical devices, use your machine's actual IP address
const getApiBaseUrl = (): string => {
  // Check for environment variable first (from app.json extra or .env)
  const envUrl = Constants.expoConfig?.extra?.apiUrl;
  if (envUrl) {
    return envUrl;
  }

  // Default fallback based on platform
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to reach host's localhost
    return 'http://10.0.2.2:8080';
  }
  
  // iOS simulator can use localhost
  return 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await AsyncStorage.getItem('token');

  const isFormData = options.body instanceof FormData;

  const config: RequestOptions = {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers!['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    let data;
    
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error(`Server response error: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      const message = data?.message || 'An error occurred';
      console.error('API Error Response:', { status: response.status, message, data });
      
      // Handle token expiration - clear token and let AuthContext handle redirect
      if (response.status === 401 && (message.includes('expired') || message.includes('invalid') || message.includes('Unauthorized'))) {
        await AsyncStorage.removeItem('token');
        // The app will redirect to login when token is cleared
      }
      
      throw new Error(message);
    }

    return data;
  } catch (error: any) {
    // Provide user-friendly error messages for common network issues
    if (error.message === 'Network request failed') {
      console.error('Network Error: Unable to connect to server at', API_BASE_URL);
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    }
    if (error.message?.includes('timeout')) {
      throw new Error('Request timed out. Please try again.');
    }
    console.error('API Request Error:', error.message || error);
    throw error;
  }
}

export const authAPI = {
  sendVerificationCode: async (email: string) => {
    return apiRequest('/api/auth/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyCode: async (email: string, code: string) => {
    return apiRequest('/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  signin: async (email: string, password: string) => {
    return apiRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (userData: any) => {
    return apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

export const userAPI = {
  getProfile: async () => {
    return apiRequest('/api/users/profile', { method: 'GET' });
  },

  updateProfile: async (userData: any) => {
    return apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteProfile: async () => {
    return apiRequest('/api/users/profile', { method: 'DELETE' });
  },
};

export const propertyListingsAPI = {
  list: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/property-listings${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/api/property-listings/${id}`);
  },

  getFilterOptions: async () => {
    return apiRequest('/api/property-listings/filters/options');
  },

  create: async (payload: any) => {
    return apiRequest('/api/property-listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMyListings: async () => {
    return apiRequest('/api/property-listings/my-listings');
  },

  update: async (id: string, payload: any) => {
    return apiRequest(`/api/property-listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  toggleVisibility: async (id: string) => {
    return apiRequest(`/api/property-listings/${id}/toggle-visibility`, {
      method: 'PATCH',
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/api/property-listings/${id}`, { method: 'DELETE' });
  },

  getPriceHistory: async (id: string) =>
    apiRequest(`/api/property-listings/${id}/price-history`),
};

export const notificationsAPI = {
  list: async (limit = 20, offset = 0) =>
    apiRequest(`/api/notifications?limit=${limit}&offset=${offset}`),
  markRead: async (id: string) =>
    apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: async () =>
    apiRequest(`/api/notifications/read-all`, { method: 'PATCH' }),
};

export const conversationsAPI = {
  list: async () => apiRequest('/api/conversations'),
  create: async ({ studentId, landlordId, propertyId }: any) =>
    apiRequest(`/api/conversations`, {
      method: 'POST',
      body: JSON.stringify({ studentId, landlordId, propertyId }),
    }),
  startDirect: async (targetUserId: string) =>
    apiRequest(`/api/conversations`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    }),
  listMessages: async (conversationId: string, limit = 50, offset = 0) =>
    apiRequest(
      `/api/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
    ),
  sendMessage: async (conversationId: string, { content, attachmentsJson }: any) =>
    apiRequest(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachmentsJson }),
    }),
  deleteMessage: async (conversationId: string, messageId: string) =>
    apiRequest(`/api/conversations/${conversationId}/messages/${messageId}`, {
      method: 'DELETE',
    }),
  markRead: async (conversationId: string) =>
    apiRequest(`/api/conversations/${conversationId}/read`, {
      method: 'PATCH',
    }),
};

export const favoritesAPI = {
  list: async () => apiRequest('/api/favorites'),
  getIds: async () => apiRequest('/api/favorites/ids'),
  add: async (listingId: string) =>
    apiRequest(`/api/favorites/${listingId}`, { method: 'POST' }),
  remove: async (listingId: string) =>
    apiRequest(`/api/favorites/${listingId}`, { method: 'DELETE' }),
  check: async (listingId: string) => apiRequest(`/api/favorites/check/${listingId}`),
};

export const roommatesAPI = {
  getProfile: async () => apiRequest('/api/roommates/profile'),
  saveProfile: async (data: any) =>
    apiRequest('/api/roommates/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteProfile: async () =>
    apiRequest('/api/roommates/profile', { method: 'DELETE' }),
  search: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/roommates/search${queryString ? `?${queryString}` : ''}`);
  },
  getMatches: async () => apiRequest('/api/roommates/matches'),
  sendMatch: async (userId: string, message: string) =>
    apiRequest(`/api/roommates/matches/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  respondMatch: async (matchId: string, status: string) =>
    apiRequest(`/api/roommates/matches/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  deleteMatch: async (matchId: string) =>
    apiRequest(`/api/roommates/matches/${matchId}`, {
      method: 'DELETE',
    }),
};

export const marketplaceAPI = {
  list: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/marketplace${queryString ? `?${queryString}` : ''}`);
  },
  getById: async (id: string) => apiRequest(`/api/marketplace/${id}`),
  getFilterOptions: async () => apiRequest('/api/marketplace/filter-options'),
  create: async (data: any) =>
    apiRequest('/api/marketplace', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: async (id: string, data: any) =>
    apiRequest(`/api/marketplace/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: async (id: string) =>
    apiRequest(`/api/marketplace/${id}`, { method: 'DELETE' }),
  getMyItems: async () => apiRequest('/api/marketplace/my-items'),
  toggleVisibility: async (id: string) =>
    apiRequest(`/api/marketplace/${id}/toggle-visibility`, { method: 'PATCH' }),
};

export const forumAPI = {
  getPosts: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/api/forum/posts${queryString ? `?${queryString}` : ''}`);
  },
  getPostById: async (id: string) => apiRequest(`/api/forum/posts/${id}`),
  createPost: async (data: any) =>
    apiRequest('/api/forum/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePost: async (id: string, data: any) =>
    apiRequest(`/api/forum/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePost: async (id: string) =>
    apiRequest(`/api/forum/posts/${id}`, { method: 'DELETE' }),
  addComment: async (postId: string, content: string) =>
    apiRequest(`/api/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteComment: async (commentId: string) =>
    apiRequest(`/api/forum/comments/${commentId}`, { method: 'DELETE' }),
  vote: async (postId: string, voteType: string) =>
    apiRequest(`/api/forum/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    }),
  toggleLike: async (postId: string) =>
    apiRequest(`/api/forum/posts/${postId}/like`, { method: 'POST' }),
};

export const passwordChangeAPI = {
  sendCode: async () =>
    apiRequest('/api/users/change-password/send-code', { method: 'POST' }),
  changePassword: async (code: string, newPassword: string) =>
    apiRequest('/api/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ code, newPassword }),
    }),
};

export const universitiesAPI = {
  list: async () => apiRequest('/api/universities'),
  getById: async (id: string) => apiRequest(`/api/universities/${id}`),
};

export const uploadsAPI = {
  uploadProfilePicture: async (imageUri: string) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.([\w]+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('profilePicture', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
    
    return apiRequest('/api/uploads/profile-picture', {
      method: 'POST',
      body: formData,
    });
  },
  deleteProfilePicture: async () =>
    apiRequest('/api/uploads/profile-picture', { method: 'DELETE' }),
  uploadListingImages: async (imageUris: string[]) => {
    const formData = new FormData();
    imageUris.forEach((uri, index) => {
      const filename = uri.split('/').pop() || `image_${index}.jpg`;
      const match = /\.([\w]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('images', {
        uri,
        name: filename,
        type,
      } as any);
    });
    return apiRequest('/api/uploads/listing-images', {
      method: 'POST',
      body: formData,
    });
  },
  uploadListingVideo: async (videoUri: string) => {
    const formData = new FormData();
    const filename = videoUri.split('/').pop() || 'video.mp4';
    formData.append('video', {
      uri: videoUri,
      name: filename,
      type: 'video/mp4',
    } as any);
    return apiRequest('/api/uploads/listing-video', {
      method: 'POST',
      body: formData,
    });
  },
};

export const reviewsAPI = {
  getPropertyReviews: async (propertyId: string, sortBy = 'createdAt', sortOrder = 'DESC') =>
    apiRequest(`/api/reviews/property/${propertyId}?sortBy=${sortBy}&sortOrder=${sortOrder}`),
  getLandlordReviews: async (landlordId: string, sortBy = 'createdAt', sortOrder = 'DESC') =>
    apiRequest(`/api/reviews/landlord/${landlordId}?sortBy=${sortBy}&sortOrder=${sortOrder}`),
  getStats: async (targetType: string, targetId: string) =>
    apiRequest(`/api/reviews/stats/${targetType}/${targetId}`),
  createReview: async (data: any) =>
    apiRequest('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateReview: async (id: string, data: any) =>
    apiRequest(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteReview: async (id: string) =>
    apiRequest(`/api/reviews/${id}`, { method: 'DELETE' }),
  toggleHelpful: async (reviewId: string) =>
    apiRequest(`/api/reviews/${reviewId}/helpful`, { method: 'POST' }),
};

export default apiRequest;
