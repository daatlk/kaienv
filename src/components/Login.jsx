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

  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

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
