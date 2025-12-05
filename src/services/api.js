// API Base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Make an HTTP request to the API
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred");
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

/**
 * Authentication API
 */
export const authAPI = {
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
};

export default apiRequest;
