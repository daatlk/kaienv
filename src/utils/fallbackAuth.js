/**
 * Fallback Authentication Module
 * 
 * This module provides a fallback authentication mechanism when Supabase authentication fails.
 * It's intended for development and testing purposes only.
 */

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  name: 'Default Admin'
};

// Default test user credentials
const DEFAULT_USER = {
  email: 'user@example.com',
  password: 'user123',
  role: 'user',
  name: 'Test User'
};

/**
 * Attempts to authenticate a user with the fallback mechanism
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Object} Authentication result with user data or error
 */
export const fallbackAuthenticate = (email, password) => {
  console.log('Using fallback authentication mechanism');
  
  // Check for default admin
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    console.log('Fallback auth: Default admin authenticated');
    return {
      success: true,
      user: {
        id: 'fallback-admin-' + Date.now(),
        email: DEFAULT_ADMIN.email,
        role: DEFAULT_ADMIN.role,
        name: DEFAULT_ADMIN.name,
        authProvider: 'fallback'
      }
    };
  }
  
  // Check for default user
  if (email === DEFAULT_USER.email && password === DEFAULT_USER.password) {
    console.log('Fallback auth: Default user authenticated');
    return {
      success: true,
      user: {
        id: 'fallback-user-' + Date.now(),
        email: DEFAULT_USER.email,
        role: DEFAULT_USER.role,
        name: DEFAULT_USER.name,
        authProvider: 'fallback'
      }
    };
  }
  
  // Check for any email with admin123 password (for testing)
  if (password === 'admin123') {
    console.log('Fallback auth: Generic admin123 password accepted');
    const isAdmin = email.includes('admin');
    return {
      success: true,
      user: {
        id: 'fallback-' + Date.now(),
        email: email,
        role: isAdmin ? 'admin' : 'user',
        name: email.split('@')[0],
        authProvider: 'fallback'
      }
    };
  }
  
  // Authentication failed
  console.log('Fallback auth: Authentication failed');
  return {
    success: false,
    error: 'Invalid email or password'
  };
};

/**
 * Checks if fallback authentication should be used
 * @returns {boolean} True if fallback authentication should be used
 */
export const shouldUseFallbackAuth = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  // Check if Supabase URL is valid
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const hasValidSupabaseUrl = supabaseUrl && 
    !supabaseUrl.includes('${') && 
    supabaseUrl !== '';
  
  // Use fallback auth in development or when Supabase URL is invalid
  return isDevelopment || !hasValidSupabaseUrl;
};
