import React, { useState } from 'react';
import { Button, Spinner, Card, Container, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';

const ManualLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a new Supabase client directly
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables not found');
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear any local storage items related to authentication
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase_auth_token');
      
      // Set success state
      setSuccess(true);
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message || 'Error logging out. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px' }} className="shadow">
        <Card.Header as="h5" className="text-center bg-primary text-white">
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Manual Logout
        </Card.Header>
        <Card.Body className="text-center">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          
          {success ? (
            <Alert variant="success" className="mb-4">
              You have been successfully logged out. Redirecting to login page...
            </Alert>
          ) : (
            <>
              <p>Click the button below to manually log out from the application.</p>
              <p className="text-muted small">This will clear your authentication session and redirect you to the login page.</p>
              
              <Button 
                variant="danger" 
                size="lg"
                onClick={handleLogout}
                disabled={loading}
                className="mt-3 mb-4 px-4"
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
                    Logging out...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Logout
                  </>
                )}
              </Button>
            </>
          )}
          
          <div className="mt-3">
            <Link to="/dashboard" className="btn btn-outline-secondary">
              <FontAwesomeIcon icon={faHome} className="me-2" />
              Back to Dashboard
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ManualLogout;
