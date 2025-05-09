import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import './Header.css'; // Assuming you will create a Header.css for specific styles

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="app-header shadow-sm mb-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center">
          <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
          VM Dashboard
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {currentUser && (
              <Nav.Link as="span" className="text-light me-3">
                <FontAwesomeIcon icon={faUserCircle} className="me-1" />
                {currentUser.name || currentUser.email}
              </Nav.Link>
            )}
            {currentUser && (
              <Button variant="outline-light" onClick={handleLogout} size="sm">
                <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                Logout
              </Button>
            )}
            {!currentUser && (
              <Nav.Link as={Link} to="/login" className="text-light">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;

