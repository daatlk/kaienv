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
  const [isLocalhost, setIsLocalhost] = useState(false);

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

      // Use the Google authentication function
      const result = await signInWithGoogle();

      console.log('Google auth result:', result);

      if (result.error) {
        console.error('Google auth error:', result.error);
        setError(`Google authentication error: ${result.error.message}`);
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

      <div className="mt-3 text-center">
        <p className="text-muted small">
          Sign in with your Kaizens Group Google account to access the dashboard.
        </p>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
