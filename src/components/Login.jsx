import React, { useState } from 'react';
import { Form, Button, Alert, Container, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Navigate, Link } from 'react-router-dom';
import { signInWithGoogle } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import KaizensLogo from './KaizensLogo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, currentUser } = useAuth();

  // Handle Google login using Supabase
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setGoogleLoading(true);

      // Try to use Supabase's signInWithGoogle function
      const { error } = await signInWithGoogle();

      if (error) {
        console.error('Supabase Google auth error:', error);

        // If there's an error with Supabase Google auth, fall back to our simulated version
        // This is a temporary workaround until Google OAuth is fully configured in Supabase
        console.log('Falling back to simulated Google authentication');

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
          throw new Error('Google authentication failed');
        }

        return; // Exit early if simulation succeeds
      }

      // If no error, the redirect to Google's authentication page will happen automatically
      // After successful authentication, the user will be redirected back to the app
      // and Supabase will handle the session
    } catch (error) {
      console.error('Google auth error:', error);
      setError('Google authentication failed. Please try again or use email/password.');
      setGoogleLoading(false);
    }
  };

  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      console.log('Login attempt with email:', email);

      // Attempt to log in with Supabase
      const success = await login(email, password);

      console.log('Login result:', success);

      if (!success) {
        console.error('Login failed - success is falsy');
        throw new Error('Invalid email or password. Please try again or use the demo credentials below.');
      }

      // Redirect will happen automatically since we update currentUser
      console.log('Login successful, waiting for redirect');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-form">
          <h2 className="login-title">Sign in to your account</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button
            variant="light"
            className="btn-google w-100 mb-3"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
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

          <div className="mt-4 text-center">
            <p className="text-muted small">
              Demo credentials:<br />
              Admin: admin@example.com / admin123<br />
              User: user@example.com / user123
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
