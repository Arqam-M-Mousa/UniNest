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
  console.log("Token present:", !!token);

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    console.log(
      "Authorization header set:",
      config.headers["Authorization"].substring(0, 20) + "..."
    );
  }

  try {
    console.log("API Request:", {
      url,
      method: config.method || "GET",
      headers: config.headers,
    });
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
