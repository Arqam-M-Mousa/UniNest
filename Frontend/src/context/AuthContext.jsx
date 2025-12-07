import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useLanguage } from "./LanguageContext";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { changeLanguage } = useLanguage();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Set language based on user's preferred language
        if (userData.preferredLanguage) {
          changeLanguage(userData.preferredLanguage);
        }
      } catch (e) {
        console.error("Failed to parse user data:", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, [changeLanguage]);

  const signin = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.signin(email, password);

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update state
        setToken(token);
        setUser(user);

        // Set language based on user's preferred language
        if (user.preferredLanguage) {
          changeLanguage(user.preferredLanguage);
        }

        return { success: true };
      } else {
        throw new Error(response.message || "Sign in failed");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to sign in";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.signup(userData);

      if (response.success) {
        // Backend signup response does not issue a session token; direct the
        // caller to move to the sign-in flow instead of storing empty auth state.
        return {
          success: true,
          message: response.message || "Account created. Please sign in.",
        };
      }

      throw new Error(response.message || "Sign up failed");
    } catch (err) {
      const errorMessage = err.message || "Failed to sign up";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear state
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    error,
    signin,
    signup,
    signout,
    clearError,
    updateUser,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
