import React, { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { signInWithGoogle } from '../utils/supabaseClient';
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

      // Try to use Supabase's signInWithGoogle function
      const { error } = await signInWithGoogle();

      if (error) {
        console.error('Supabase Google auth error:', error);
        setError(`Google authentication error: ${error.message}`);
        setShowManualLogin(true);
      } else {
        console.log('Google authentication initiated successfully');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      setError(`Failed to initiate Google login: ${error.message}`);
      setShowManualLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);

      // Simulate user info from Google
      const userInfo = {
        email: 'user@gmail.com',
        name: 'Google User',
        picture: 'https://example.com/profile.jpg'
      };

      // Log in the user with the simulated information
      const success = await login(userInfo.email, null, 'google', {
        name: userInfo.name,
        picture: userInfo.picture
      });

      if (!success) {
        throw new Error('Simulated Google authentication failed');
      }

      console.log('Simulated Google login successful');
    } catch (error) {
      console.error('Simulated Google auth error:', error);
      setError(`Simulated Google login failed: ${error.message}`);
    } finally {
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

      {showManualLogin && (
        <div className="mt-3">
          <Alert variant="warning">
            <p>
              It seems there's an issue with Google authentication. This could be due to:
            </p>
            <ul>
              <li>Google OAuth not being properly configured in Supabase</li>
              <li>Network issues preventing the authentication flow</li>
              <li>Redirect URL issues in the Google OAuth configuration</li>
            </ul>
            <p>
              You can try our simulated Google login for demonstration purposes:
            </p>
            <Button
              variant="outline-primary"
              onClick={handleManualGoogleLogin}
              disabled={loading}
              className="mt-2"
            >
              Use Simulated Google Login
            </Button>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
