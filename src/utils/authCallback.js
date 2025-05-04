/**
 * Helper function to handle authentication callbacks
 * This is used to redirect the user to the correct URL after authentication
 */

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
  
  // Get the stored redirect URL from localStorage
  const redirectUrl = localStorage.getItem('auth_redirect_url');
  
  // If we're on localhost but have a production redirect URL, redirect to production
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    if (redirectUrl && redirectUrl.includes('v0-kaienv.vercel.app')) {
      console.log('Detected authentication callback on localhost. Redirecting to production URL...');
      
      // Get the hash parameters
      const hashParams = getHashParams();
      
      // Construct the production URL with the hash parameters
      const productionUrl = new URL(redirectUrl);
      productionUrl.hash = window.location.hash;
      
      // Redirect to the production URL
      window.location.href = productionUrl.toString();
      return true;
    }
  }
  
  return false;
};

// Export a function to initialize the auth callback handler
export const initAuthCallbackHandler = () => {
  // Check if this is an authentication callback
  return handleAuthCallback();
};
