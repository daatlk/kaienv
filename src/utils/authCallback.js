/**
 * Helper function to handle authentication callbacks
 * This is used to redirect the user to the correct URL after authentication
 */
import { supabase, isEmailPreApproved } from './supabaseClient';

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

  // Extract the access token from the URL hash
  const hashParams = getHashParams();
  console.log('Hash parameters extracted:', Object.keys(hashParams));

  if (hashParams.access_token) {
    console.log('Found access_token in hash parameters');

    try {
      // Store the tokens in localStorage immediately
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: hashParams.access_token,
        refresh_token: hashParams.refresh_token || null,
        expires_at: hashParams.expires_at || (Date.now() + 3600 * 1000)
      }));

      console.log('Stored tokens in localStorage');

      // Set the session directly using the tokens from the URL
      supabase.auth.setSession({
        access_token: hashParams.access_token,
        refresh_token: hashParams.refresh_token || null
      }).then(({ data, error }) => {
        if (error) {
          console.error('Error setting session with tokens:', error);
          // Continue anyway - we've stored the tokens in localStorage
        } else {
          console.log('Session set successfully:', data);
        }

        // Now get the session to verify it worked
        return supabase.auth.getSession();
      }).then(async ({ data, error }) => {
        if (error) {
          console.error('Error getting session after setting tokens:', error);
          // Try to get user info from the token directly
          try {
            // Parse the JWT to get user info
            const tokenParts = hashParams.access_token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Extracted user info from token:', payload);

              // Check if the user's email is pre-approved
              const email = payload.email || '';
              if (email) {
                const { data: isApproved } = await isEmailPreApproved(email);

                if (!isApproved) {
                  console.log('User email is not pre-approved:', email);
                  // Sign out the user
                  await supabase.auth.signOut();
                  // Clear any stored tokens
                  localStorage.removeItem('supabase.auth.token');
                  localStorage.removeItem('currentUser');
                  // Redirect to login with error message
                  localStorage.setItem('auth_error', 'Your Google account is not authorized. Please contact an administrator to get access.');
                  window.location.href = '/login?error=unauthorized';
                  return;
                }

                console.log('User email is pre-approved:', email);
              }

              // Create a user object from the token payload
              const userObj = {
                id: payload.sub,
                email: payload.email || 'user@example.com',
                name: payload.name || payload.email || 'User',
                role: payload.role || 'user',
                authProvider: 'google',
                picture: payload.picture || null
              };

              console.log('Created user object from token:', userObj);
              localStorage.setItem('currentUser', JSON.stringify(userObj));
            }
          } catch (e) {
            console.error('Error parsing token:', e);
          }
        } else if (data?.session) {
          console.log('User authenticated:', data.session.user);

          // Check if the user's email is pre-approved
          const email = data.session.user.email;
          if (email) {
            const { data: isApproved } = await isEmailPreApproved(email);

            if (!isApproved) {
              console.log('User email is not pre-approved:', email);
              // Sign out the user
              await supabase.auth.signOut();
              // Clear any stored tokens
              localStorage.removeItem('supabase.auth.token');
              localStorage.removeItem('currentUser');
              // Redirect to login with error message
              localStorage.setItem('auth_error', 'Your Google account is not authorized. Please contact an administrator to get access.');
              window.location.href = '/login?error=unauthorized';
              return;
            }

            console.log('User email is pre-approved:', email);
          }

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
        } else {
          console.error('No session found after setting tokens');
          // Redirect to login with error message
          localStorage.setItem('auth_error', 'Authentication failed. Please try again or contact an administrator.');
          window.location.href = '/login?error=failed';
          return;
        }

        // Redirect to the dashboard
        if (redirectUrl) {
          console.log('Redirecting to stored redirect URL:', redirectUrl);
          // Remove the hash from the URL to avoid exposing tokens
          window.location.href = redirectUrl.split('#')[0];
        } else {
          console.log('No stored redirect URL, redirecting to dashboard');
          window.location.href = '/dashboard';
        }
      }).catch(err => {
        console.error('Unexpected error in auth callback:', err);
        // Redirect to dashboard anyway as a fallback
        window.location.href = '/dashboard';
      });
    } catch (err) {
      console.error('Error in auth callback:', err);
      // Redirect to dashboard anyway as a fallback
      window.location.href = '/dashboard';
    }
  } else {
    console.error('No access_token found in hash parameters');
    // Just redirect to dashboard as a fallback
    window.location.href = '/dashboard';
  }

  return true;
};

// Export a function to initialize the auth callback handler
export const initAuthCallbackHandler = () => {
  // Check if this is an authentication callback
  return handleAuthCallback();
};
