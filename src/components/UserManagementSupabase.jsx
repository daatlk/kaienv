import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUserShield, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { supabase, signUp, getUsers } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const { currentUser: loggedInUser } = useAuth();

  useEffect(() => {
    // Load users from Supabase
    const loadUsers = async () => {
      try {
        const { data, error } = await getUsers();
        if (error) {
          console.error('Error loading users:', error);
        } else {
          setUsers(data || []);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    
    loadUsers();
  }, []);

  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'user'
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't show the password when editing
      name: user.name,
      role: user.role
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    // Prevent deleting yourself
    if (userId === loggedInUser.id) {
      alert("You cannot delete your own account!");
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // In a real Supabase implementation, this would be:
        // const { error } = await supabase.auth.admin.deleteUser(userId);
        
        // For our simulated implementation:
        const usersStr = localStorage.getItem('supabase_users');
        const users = usersStr ? JSON.parse(usersStr) : [];
        const filteredUsers = users.filter(user => user.id !== userId);
        
        localStorage.setItem('supabase_users', JSON.stringify(filteredUsers));
        
        // Update the state
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error deleting user:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.email || !formData.name || (!currentUser && !formData.password)) {
      setError('All fields are required');
      return;
    }

    try {
      if (currentUser) {
        // Update existing user
        // In a real Supabase implementation, this would be:
        // const { data, error } = await supabase.auth.admin.updateUserById(
        //   currentUser.id,
        //   { email: formData.email, user_metadata: { name: formData.name, role: formData.role } }
        // );
        
        // For our simulated implementation:
        const usersStr = localStorage.getItem('supabase_users');
        const users = usersStr ? JSON.parse(usersStr) : [];
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            email: formData.email,
            name: formData.name,
            role: formData.role,
            ...(formData.password ? { password: formData.password } : {})
          };
          
          localStorage.setItem('supabase_users', JSON.stringify(users));
          setUsers(users);
        }
      } else {
        // Add new user
        const { data, error } = await signUp(formData.email, formData.password, {
          name: formData.name,
          role: formData.role
        });
        
        if (error) {
          setError(error.message);
          return;
        }
        
        // Refresh users list
        const { data: updatedUsers } = await getUsers();
        setUsers(updatedUsers || []);
      }
      
      setShowModal(false);
    } catch (error) {
      setError(error.message);
    }
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
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" />
                      {user.email}
                    </td>
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
            
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
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
