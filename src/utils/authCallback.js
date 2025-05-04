/**
 * Helper function to handle authentication callbacks
 * This is used to redirect the user to the correct URL after authentication
 */
import { supabase } from './supabaseClient';

// Function to extract hash parameters from URL
export const getHashParams = () => {
  const hash = window.location.hash.substring(1);
  const params = {};

  if (!hash) return params;

  hash.split('&').forEach(param => {
    const [key, value] = param.split('=');
    params[key] = decodeURIComponent(value);
  });

  return params;
};

// Function to check if the current URL is an authentication callback
export const isAuthCallback = () => {
  const hash = window.location.hash;
  return hash && hash.includes('access_token');
};

// Function to handle the authentication callback
export const handleAuthCallback = () => {
  if (!isAuthCallback()) return false;

  console.log('Detected authentication callback with hash parameters');

  // Get the stored redirect URL from localStorage
  const redirectUrl = localStorage.getItem('auth_redirect_url');
  console.log('Stored redirect URL:', redirectUrl);

  // If we're on localhost but have a production redirect URL, redirect to production
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    if (redirectUrl && redirectUrl.includes('v0-kaienv.vercel.app')) {
      console.log('Detected authentication callback on localhost. Redirecting to production URL...');

      // Get the hash parameters
      const hashParams = getHashParams();
      console.log('Hash parameters:', hashParams);

      // Construct the production URL with the hash parameters
      const productionUrl = new URL(redirectUrl);
      productionUrl.hash = window.location.hash;

      console.log('Redirecting to:', productionUrl.toString());

      // Redirect to the production URL
      window.location.href = productionUrl.toString();
      return true;
    }
  }

  // If we're already on the production URL, process the authentication
  console.log('Processing authentication on current domain');

  // Process the authentication callback
  // This will update the Supabase auth state
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Error getting session after callback:', error);
      return;
    }

    console.log('Session after callback:', data);

    if (data?.session) {
      console.log('User authenticated:', data.session.user);

      // Store the user in localStorage for persistence
      const userObj = {
        id: data.session.user.id,
        email: data.session.user.email,
        name: data.session.user.user_metadata?.name || data.session.user.email,
        role: data.session.user.user_metadata?.role || 'user',
        authProvider: data.session.user.app_metadata?.provider || 'email',
        picture: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture
      };

      console.log('Storing user in localStorage:', userObj);
      localStorage.setItem('currentUser', JSON.stringify(userObj));

      // Redirect to the dashboard
      if (redirectUrl) {
        console.log('Redirecting to stored redirect URL:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        console.log('No stored redirect URL, redirecting to dashboard');
        window.location.href = '/dashboard';
      }

      return true;
    }
  });

  return true;
};

// Export a function to initialize the auth callback handler
export const initAuthCallbackHandler = () => {
  // Check if this is an authentication callback
  return handleAuthCallback();
};
