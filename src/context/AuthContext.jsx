import React, { createContext, useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  signIn,
  signOut,
  getSession,
  updateUser,
  getUserProfile
} from '../utils/supabaseClient';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data, error } = await getSession();

      if (data?.session?.user) {
        // Get user profile to get the role
        const { data: profileData } = await getUserProfile(data.session.user.id);

        setCurrentUser({
          id: data.session.user.id,
          email: data.session.user.email,
          name: profileData?.name || data.session.user.user_metadata?.name || data.session.user.email,
          role: profileData?.role || data.session.user.user_metadata?.role || 'user'
        });

        console.log("Session user:", {
          id: data.session.user.id,
          email: data.session.user.email,
          name: profileData?.name || data.session.user.user_metadata?.name,
          role: profileData?.role || data.session.user.user_metadata?.role
        });
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  // Login function
  const login = async (email, password) => {
    // Sign in using Supabase client
    const { data, error } = await signIn(email, password);

    if (error) {
      console.error("Login error:", error);
      return false;
    }

    if (data?.user) {
      // Get user profile to get the role
      const { data: profileData } = await getUserProfile(data.user.id);

      // Create a user object
      const authenticatedUser = {
        id: data.user.id,
        email: data.user.email,
        role: profileData?.role || data.user.user_metadata?.role || 'user',
        name: profileData?.name || data.user.user_metadata?.name || data.user.email
      };

      console.log("Authenticated user:", authenticatedUser);

      // Store user in state
      setCurrentUser(authenticatedUser);
      return true;
    }

    return false;
  };

  // Logout function
  const logout = async () => {
    const { error } = await signOut();
    setCurrentUser(null);
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Update current user profile
  const updateProfile = async (name, currentPassword, newPassword) => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };

    try {
      // Prepare update data
      const userData = { name };

      // If password change is requested, handle it
      // In a real Supabase implementation, this would be handled differently
      if (newPassword) {
        userData.password = newPassword;
      }

      // Update user in Supabase
      const { data, error } = await updateUser(userData);

      if (error) {
        return { success: false, message: error.message };
      }

      // Update the current user in state
      setCurrentUser({
        ...currentUser,
        name: name
      });

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Value object that will be passed to consumers
  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    updateProfile,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Protected route component
export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Use React Router's Navigate component instead of direct window.location
    return <Navigate to="/login" />;
  }

  return children;
};

// Admin route component
export const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Use React Router's Navigate component instead of direct window.location
    return <Navigate to="/login" />;
  }

  if (!isAdmin()) {
    // Use React Router's Navigate component instead of direct window.location
    return <Navigate to="/dashboard" />;
  }

  return children;
};
