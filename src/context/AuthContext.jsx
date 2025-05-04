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
      console.log("Checking authentication session...");
      setLoading(true);

      try {
        // First check if we have tokens in localStorage
        const storedTokens = localStorage.getItem('supabase.auth.token');
        if (storedTokens) {
          try {
            const parsedTokens = JSON.parse(storedTokens);
            console.log("Found tokens in localStorage, setting session");

            // Set the session with the stored tokens
            if (parsedTokens.access_token) {
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: parsedTokens.access_token,
                refresh_token: parsedTokens.refresh_token || null
              });

              if (sessionError) {
                console.error("Error setting session with stored tokens:", sessionError);
                // If there's an error, remove the stored tokens
                localStorage.removeItem('supabase.auth.token');
              } else {
                console.log("Session set successfully with stored tokens:", sessionData);
              }
            }
          } catch (e) {
            console.error("Error parsing stored tokens:", e);
            localStorage.removeItem('supabase.auth.token');
          }
        }

        // Now get the current session
        const { data, error } = await getSession();

        if (error) {
          console.error("Error getting session:", error);

          // Check if we have a user in localStorage (for simulated auth)
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log("Found user in localStorage despite session error:", parsedUser);
              setCurrentUser(parsedUser);
            } catch (e) {
              console.error("Error parsing stored user:", e);
              localStorage.removeItem('currentUser');
            }
          }

          setLoading(false);
          return;
        }

        console.log("Session data:", data);

        if (data?.session?.user) {
          console.log("User found in session:", data.session.user);

          // Get user profile to get the role
          const { data: profileData, error: profileError } = await getUserProfile(data.session.user.id);

          if (profileError) {
            console.error("Error getting user profile:", profileError);
          }

          console.log("User profile data:", profileData);

          // Check if this is a Google-authenticated user
          const isGoogleUser = data.session.user.app_metadata?.provider === 'google';
          console.log("Is Google user:", isGoogleUser);
          console.log("User metadata:", data.session.user.user_metadata);
          console.log("App metadata:", data.session.user.app_metadata);

          const userObj = {
            id: data.session.user.id,
            email: data.session.user.email,
            name: profileData?.name || data.session.user.user_metadata?.name || data.session.user.email,
            role: profileData?.role || data.session.user.user_metadata?.role || 'user',
            authProvider: isGoogleUser ? 'google' : 'email',
            picture: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture
          };

          console.log("Setting current user:", userObj);
          setCurrentUser(userObj);

          // Also store in localStorage for persistence across page refreshes
          localStorage.setItem('currentUser', JSON.stringify(userObj));

          // Store the tokens in localStorage as well
          if (data.session.access_token) {
            localStorage.setItem('supabase.auth.token', JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token || null,
              expires_at: new Date(data.session.expires_at).getTime() || (Date.now() + 3600 * 1000)
            }));
          }
        } else {
          console.log("No user found in session");

          // Check if we have a user in localStorage (for simulated auth)
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log("Found user in localStorage:", parsedUser);
              setCurrentUser(parsedUser);
            } catch (e) {
              console.error("Error parsing stored user:", e);
              localStorage.removeItem('currentUser');
            }
          }
        }
      } catch (e) {
        console.error("Unexpected error in checkSession:", e);
      } finally {
        setLoading(false);
      }
    };

    // Check for hash parameters that indicate an auth callback
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      console.log("Detected authentication callback hash parameters");
    }

    checkSession();

    // Set up an interval to periodically check the session
    const interval = setInterval(checkSession, 60000); // Check every minute

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  // Login function
  const login = async (email, password, authProvider = 'email', additionalInfo = {}) => {
    if (authProvider === 'google') {
      // Handle Google authentication as a fallback
      // This is used when Supabase Google auth is not fully configured
      console.log("Simulating Google authentication for:", email);

      try {
        // Create a user object for Google auth using the provided information
        const googleUserId = 'google-' + Math.random().toString(36).substring(2, 15);
        const googleUser = {
          id: googleUserId,
          email: email,
          role: email.includes('admin') ? 'admin' : 'user',
          name: additionalInfo.name || email.split('@')[0], // Use provided name or fallback to email
          picture: additionalInfo.picture, // Store profile picture URL
          authProvider: 'google'
        };

        console.log("Simulated Google authenticated user:", googleUser);

        // Store user in state
        setCurrentUser(googleUser);

        // Also store in localStorage for our VM operations
        localStorage.setItem('currentUser', JSON.stringify(googleUser));

        return true;
      } catch (error) {
        console.error("Error in simulated Google authentication:", error);
        return false;
      }
    } else {
      // Regular email/password authentication
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
          name: profileData?.name || data.user.user_metadata?.name || data.user.email,
          authProvider: 'email'
        };

        console.log("Authenticated user:", authenticatedUser);

        // Store user in state
        setCurrentUser(authenticatedUser);
        return true;
      }

      return false;
    }
  };

  // Logout function
  const logout = async () => {
    const { error } = await signOut();
    setCurrentUser(null);

    // Clear localStorage
    localStorage.removeItem('currentUser');
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };



  // Update current user profile
  const updateProfile = async (name, currentPassword, newPassword, role) => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };

    try {
      // Prepare update data
      const userData = { name };

      // If role is provided, update it
      if (role) {
        userData.role = role;
      }

      // If password change is requested, handle it
      // In a real Supabase implementation, this would be handled differently
      if (newPassword) {
        userData.password = newPassword;
      }

      // Update user in Supabase
      const { data, error } = await updateUser(userData);

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, message: error.message };
      }

      // Update the current user in state
      setCurrentUser({
        ...currentUser,
        name: name,
        ...(role && { role }) // Only update role if it was provided
      });

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error in updateProfile:', error);
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
    loading,
    isGoogleUser: () => currentUser?.authProvider === 'google'
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
