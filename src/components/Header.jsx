import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import {
  faServer,
  faSignOutAlt,
  faUserCog,
  faUserShield,
  faUser,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="navbar">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          <FontAwesomeIcon icon={faServer} className="me-2" />
          VM Management Dashboard
        </Navbar.Brand>

        {currentUser && (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
              <Nav>
                {isAdmin() && (
                  <Nav.Link as={Link} to="/users">
                    <FontAwesomeIcon icon={faUsers} className="me-1" />
                    User Management
                  </Nav.Link>
                )}
                <NavDropdown
                  title={
                    <span>
                      <FontAwesomeIcon
                        icon={isAdmin() ? faUserShield : faUser}
                        className="me-1"
                      />
                      {currentUser.name}
                    </span>
                  }
                  id="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    <FontAwesomeIcon icon={faUserCog} className="me-2" />
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </>
        )}
      </Container>
    </Navbar>
  );
};

export default Header;
