import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUserShield, faUser } from '@fortawesome/free-solid-svg-icons';
import { getUsers, addUser, updateUser, deleteUser } from '../utils/userStorage';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const { currentUser: loggedInUser } = useAuth();

  useEffect(() => {
    // Load users from localStorage
    setUsers(getUsers());
  }, []);

  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'user'
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't show the password when editing
      name: user.name,
      role: user.role
    });
    setShowModal(true);
  };

  const handleDeleteUser = (userId) => {
    // Prevent deleting yourself
    if (userId === loggedInUser.id) {
      alert("You cannot delete your own account!");
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      // Delete from localStorage
      const success = deleteUser(userId);

      if (success) {
        // Update local state
        setUsers(users.filter(user => user.id !== userId));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.username || !formData.name || (!currentUser && !formData.password)) {
      setError('All fields are required');
      return;
    }

    // Check if username already exists (for new users)
    if (!currentUser && users.some(user => user.username === formData.username)) {
      setError('Username already exists');
      return;
    }

    if (currentUser) {
      // Update existing user
      const updatedUser = {
        ...currentUser,
        username: formData.username,
        name: formData.name,
        role: formData.role,
        // Only update password if a new one is provided
        ...(formData.password ? { password: formData.password } : {})
      };

      // Update in localStorage
      const result = updateUser(updatedUser);

      if (result) {
        // Refresh users list
        setUsers(getUsers());
      }
    } else {
      // Add new user
      const newUser = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role
      };

      // Add to localStorage
      const result = addUser(newUser);

      if (result) {
        // Refresh users list
        setUsers(getUsers());
      }
    }

    setShowModal(false);
  };

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">User Management</h4>
          <Button variant="primary" onClick={handleAddUser}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add User
          </Button>
        </Card.Header>
        <Card.Body>
          {users.length === 0 ? (
            <p className="text-center text-muted">No users found</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="text-primary">
                          <FontAwesomeIcon icon={faUserShield} className="me-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-secondary">
                          <FontAwesomeIcon icon={faUser} className="me-1" />
                          User
                        </span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditUser(user)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === loggedInUser.id}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* User Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>
                {currentUser ? 'Password (leave blank to keep current)' : 'Password'}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!currentUser}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="role">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
