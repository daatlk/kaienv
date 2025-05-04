import React, { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { signInWithGoogle, supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const { login } = useAuth();

  // Check if we're running on localhost
  useEffect(() => {
    const hostname = window.location.hostname;
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);

      console.log('Initiating Google login...');

      // Use the simplest possible approach
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://v0-kaienv.vercel.app/dashboard',
          scopes: 'email profile'
        }
      });

      console.log('Google auth result:', result);

      if (result.error) {
        console.error('Google auth error:', result.error);
        setError(`Google authentication error: ${result.error.message}`);
        setShowManualLogin(true);
      } else if (result.data?.url) {
        console.log('Redirecting to:', result.data.url);
        window.location.href = result.data.url;
        return;
      } else {
        console.log('Authentication initiated but no URL provided');
      }
    } catch (error) {
      console.error('Unexpected error in Google login:', error);
      setError(`Failed to initiate Google login: ${error.message}`);
      setShowManualLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualGoogleLogin = () => {
    try {
      setError(null);
      setLoading(true);

      // Create a more realistic user object with admin role for demo
      const userInfo = {
        id: 'google-user-' + Math.random().toString(36).substring(2, 15),
        email: 'demo@kaizens.co.uk',
        name: 'Demo User',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
        role: 'admin', // Set as admin for full access
        authProvider: 'google'
      };

      console.log('Creating demo user:', userInfo);

      // Clear any existing auth data
      localStorage.removeItem('supabase.auth.token');

      // Store the user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(userInfo));

      console.log('Demo login successful, stored user in localStorage');

      // Set a flag to indicate demo mode
      localStorage.setItem('demo_mode', 'true');

      // Show success message
      alert('Demo login successful! Redirecting to dashboard...');

      // Redirect to dashboard with a slight delay to ensure localStorage is updated
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (error) {
      console.error('Demo login error:', error);
      setError(`Demo login failed: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {isLocalhost && (
        <Alert variant="info" className="mb-3">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          <strong>Local Development Environment Detected</strong>
          <p className="mt-2 mb-0">
            You're running the app on localhost. After Google authentication, you'll be redirected to the production URL
            (https://v0-kaienv.vercel.app) instead of localhost to ensure proper authentication flow.
          </p>
        </Alert>
      )}

      <Button
        variant="light"
        className="btn-google w-100 mb-3"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Connecting...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faGoogle} className="me-2" />
            Sign in with Google
          </>
        )}
      </Button>

      <div className="mt-3">
        <Alert variant="info">
          <p>
            <strong>Demo Mode Available</strong>
          </p>
          <p>
            You can use our simulated Google login for demonstration purposes:
          </p>
          <Button
            variant="outline-primary"
            onClick={handleManualGoogleLogin}
            disabled={loading}
            className="mt-2"
          >
            Use Demo Login
          </Button>
          <p className="mt-2 small text-muted">
            This will create a simulated user account with demo data.
          </p>
        </Alert>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
