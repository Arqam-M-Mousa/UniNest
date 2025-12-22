// API Base URL from environment variable or default to localhost
// Use internal Docker URL if available, otherwise use localhost
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "http://uninest-backend:3000");

/**
 * Make an HTTP request to the API
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token first
  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const config = {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error(
        `Server response error: ${response.status} ${response.statusText}`
      );
    }

    if (!response.ok) {
      const message = data?.message || "An error occurred";
      console.error("API Error Response:", {
        status: response.status,
        message,
        data,
      });
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error.message || error);
    throw error;
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  sendVerificationCode: async (email) => {
    return apiRequest("/api/auth/send-verification-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyCode: async (email, code) => {
    return apiRequest("/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },

  signin: async (email, password) => {
    return apiRequest("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (userData) => {
    return apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
};

/**
 * User API
 */
export const userAPI = {
  getProfile: async () => {
    return apiRequest("/api/users/profile", {
      method: "GET",
    });
  },

  updateProfile: async (userData) => {
    return apiRequest("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteProfile: async () => {
    return apiRequest("/api/users/profile", {
      method: "DELETE",
    });
  },
};

/**
 * Property Listings API
 */
export const propertyListingsAPI = {
  list: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiRequest(
      `/api/property-listings${queryString ? `?${queryString}` : ""}`
    );
  },

  getById: async (id) => {
    return apiRequest(`/api/property-listings/${id}`);
  },

  getFilterOptions: async () => {
    return apiRequest("/api/property-listings/filters/options");
  },

  create: async (payload) => {
    return apiRequest("/api/property-listings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyListings: async () => {
    return apiRequest("/api/property-listings/my-listings");
  },

  update: async (id, payload) => {
    return apiRequest(`/api/property-listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  toggleVisibility: async (id) => {
    return apiRequest(`/api/property-listings/${id}/toggle-visibility`, {
      method: "PATCH",
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/property-listings/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Notifications API
 */
export const notificationsAPI = {
  list: async (limit = 20, offset = 0) =>
    apiRequest(`/api/notifications?limit=${limit}&offset=${offset}`),
  markRead: async (id) =>
    apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: async () =>
    apiRequest(`/api/notifications/read-all`, { method: "PATCH" }),
};

/**
 * Conversations & Messages API
 */
export const conversationsAPI = {
  list: async () => apiRequest("/api/conversations"),
  create: async ({ studentId, landlordId, propertyId }) =>
    apiRequest(`/api/conversations`, {
      method: "POST",
      body: JSON.stringify({ studentId, landlordId, propertyId }),
    }),
  startDirect: async (targetUserId) =>
    apiRequest(`/api/conversations`, {
      method: "POST",
      body: JSON.stringify({ targetUserId }),
    }),
  listMessages: async (conversationId, limit = 50, offset = 0) =>
    apiRequest(
      `/api/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
    ),
  sendMessage: async (conversationId, { content, attachmentsJson }) =>
    apiRequest(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, attachmentsJson }),
    }),
  deleteMessage: async (conversationId, messageId) =>
    apiRequest(`/api/conversations/${conversationId}/messages/${messageId}`, {
      method: "DELETE",
    }),
  markRead: async (conversationId) =>
    apiRequest(`/api/conversations/${conversationId}/read`, {
      method: "PATCH",
    }),
};

/**
 * Universities API
 */
export const universitiesAPI = {
  list: async () => apiRequest("/api/universities"),
  create: async (data) =>
    apiRequest("/api/universities", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (id, data) =>
    apiRequest(`/api/universities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: async (id) =>
    apiRequest(`/api/universities/${id}`, {
      method: "DELETE",
    }),
};

/**
 * Uploads API
 */
export const uploadsAPI = {
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);

    return apiRequest("/api/uploads/profile-picture", {
      method: "POST",
      body: formData,
    });
  },

  deleteProfilePicture: async () =>
    apiRequest("/api/uploads/profile-picture", {
      method: "DELETE",
    }),

  uploadListingImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    return apiRequest("/api/uploads/listing-images", {
      method: "POST",
      body: formData,
    });
  },

  uploadVerificationDocument: async (file) => {
    const formData = new FormData();
    formData.append("document", file);

    return apiRequest("/api/uploads/verification-document", {
      method: "POST",
      body: formData,
    });
  },
};

/**
 * Admin Management API
 */
export const adminAPI = {
  listAdmins: async () => apiRequest("/api/admin/users"),
  createAdmin: async (data) =>
    apiRequest("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteAdmin: async (id) =>
    apiRequest(`/api/admin/users/${id}`, {
      method: "DELETE",
    }),
};

/**
 * User Password Change API
 */
export const passwordChangeAPI = {
  sendCode: async () => apiRequest("/api/users/change-password/send-code", { method: "POST" }),
  changePassword: async (code, newPassword) =>
    apiRequest("/api/users/change-password", {
      method: "POST",
      body: JSON.stringify({ code, newPassword }),
    }),
};

/**
 * Favorites API
 */
export const favoritesAPI = {
  list: async () => apiRequest("/api/favorites"),
  getIds: async () => apiRequest("/api/favorites/ids"),
  add: async (listingId) =>
    apiRequest(`/api/favorites/${listingId}`, { method: "POST" }),
  remove: async (listingId) =>
    apiRequest(`/api/favorites/${listingId}`, { method: "DELETE" }),
  check: async (listingId) => apiRequest(`/api/favorites/check/${listingId}`),
};

/**
 * Roommates API
 */
export const roommatesAPI = {
  getProfile: async () => apiRequest("/api/roommates/profile"),
  saveProfile: async (data) =>
    apiRequest("/api/roommates/profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteProfile: async () =>
    apiRequest("/api/roommates/profile", { method: "DELETE" }),
  search: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiRequest(
      `/api/roommates/search${queryString ? `?${queryString}` : ""}`
    );
  },
  getMatches: async () => apiRequest("/api/roommates/matches"),
  sendMatch: async (userId, message) =>
    apiRequest(`/api/roommates/matches/${userId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  respondMatch: async (matchId, status) =>
    apiRequest(`/api/roommates/matches/${matchId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  deleteMatch: async (matchId) =>
    apiRequest(`/api/roommates/matches/${matchId}`, {
      method: "DELETE",
    }),
};

/**
 * Verification API
 */
export const verificationAPI = {
  getStatus: async () => apiRequest("/api/verification/status"),
  submit: async (data) =>
    apiRequest("/api/verification/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  listRequests: async (status) =>
    apiRequest(`/api/verification/requests${status ? `?status=${status}` : ""}`),
  reviewRequest: async (id, status, reviewNotes) =>
    apiRequest(`/api/verification/requests/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, reviewNotes }),
    }),
};

/**
 * Announcements API
 */
export const announcementsAPI = {
  send: async (data) =>
    apiRequest("/api/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export default apiRequest;
