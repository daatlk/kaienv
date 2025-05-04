import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import KaizensLogo from './KaizensLogo';
import DebugInfo from './DebugInfo';
import GoogleLoginButton from './GoogleLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();

  // Log environment variables for debugging
  useEffect(() => {
    console.log('Environment variables:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_PUBLIC_URL:', import.meta.env.VITE_PUBLIC_URL);

    // Log window location for debugging
    console.log('Window location:');
    console.log('href:', window.location.href);
    console.log('origin:', window.location.origin);
    console.log('protocol:', window.location.protocol);
    console.log('host:', window.location.host);
  }, []);

  // Check for user in localStorage or context
  useEffect(() => {
    console.log("Login: Checking for existing authentication");

    // Check if we're on an authentication callback URL
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log("Login: Detected authentication callback, not redirecting");
      return;
    }

    // Check for authentication errors
    const authError = localStorage.getItem('auth_error');
    if (authError) {
      console.log("Login: Found authentication error:", authError);
      setError(authError);
      localStorage.removeItem('auth_error');
      return;
    }

    // Check URL parameters for errors
    const urlParams = new URLSearchParams(window.location.search);
    const urlError = urlParams.get('error');
    if (urlError === 'unauthorized') {
      console.log("Login: Unauthorized error from URL parameter");
      setError('Your Google account is not authorized. Please contact an administrator to get access.');
      return;
    } else if (urlError === 'failed') {
      console.log("Login: Authentication failed error from URL parameter");
      setError('Authentication failed. Please try again or contact an administrator.');
      return;
    }

    // Check if we have a user in context
    if (currentUser) {
      console.log("Login: User already authenticated in context, redirecting to dashboard");
      window.location.href = '/dashboard';
      return;
    }

    // Check if we have a user in localStorage
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Login: Found user in localStorage:", parsedUser);
        console.log("Login: Redirecting to dashboard");
        window.location.href = '/dashboard';
        return;
      }
    } catch (e) {
      console.error("Login: Error parsing stored user:", e);
      localStorage.removeItem('currentUser');
    }

    console.log("Login: No authenticated user found, showing login form");
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      // Attempt to log in with Supabase
      const success = await login(email, password);

      if (!success) {
        throw new Error('Invalid email or password');
      }

      // Redirect will happen in the useEffect
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  };



  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-form">
          <h2 className="login-title">Sign in to your account</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <GoogleLoginButton />

          <div className="divider my-4">
            <span>or</span>
          </div>

          <Form onSubmit={handleSubmit} className="w-100">
            <Form.Group className="form-floating mb-3">
              <Form.Control
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or username"
                required
              />
              <Form.Label htmlFor="email">Email or username</Form.Label>
            </Form.Group>

            <Form.Group className="form-floating mb-3">
              <Form.Control
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <Form.Label htmlFor="password">Password</Form.Label>
            </Form.Group>

            <a href="#" className="forgot-password">Forgot password?</a>

            <Button
              variant="primary"
              type="submit"
              className="btn-sign-in"
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
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </Form>

          <div className="sign-up-text">
            New to Kaizens Group? <a href="#" className="sign-up-link">Sign up!</a>
          </div>

          <div className="mt-3 text-center">
            <p className="text-muted small">
              First time? Use admin@example.com / admin123 to log in, then change the password.
            </p>
          </div>

          <div className="footer-text">
            <div className="mb-2">Copyright © 2025 Kaizens Group - All Rights Reserved.</div>
            <div>
              <a href="#" className="footer-link">Contact Us</a>
              <span className="mx-2">|</span>
              <a href="#" className="footer-link">English</a>
            </div>
          </div>

          {/* Debug information for troubleshooting */}
          <DebugInfo />
        </div>
      </div>

      <div className="login-visual-container">
        <div className="login-visual-content">
          <div className="visual-image"></div>
          <div className="visual-text">
            <h3>Manage Your Virtual Infrastructure</h3>
            <p>Access all your VM resources in one secure dashboard</p>
            <p className="mt-2">Monitor, configure, and optimize your servers with ease</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
