import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUserShield, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { supabase, signUp, getUsers, updateUserProfile, deleteUser } from '../utils/supabaseClient';
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

  // Debug logged in user
  useEffect(() => {
    console.log('Logged in user:', loggedInUser);
  }, [loggedInUser]);

  // State to track when to refresh users
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh of the users list
  const refreshUsers = (delay = 0) => {
    console.log(`Triggering user list refresh with delay: ${delay}ms`);
    if (delay > 0) {
      setTimeout(() => {
        console.log('Executing delayed refresh');
        setRefreshTrigger(prev => prev + 1);
      }, delay);
    } else {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // State to track loading status
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Load users from Supabase
    const loadUsers = async () => {
      console.log('Loading users from Supabase, trigger:', refreshTrigger);
      setLoading(true);
      setLoadError(null);

      try {
        const { data, error } = await getUsers();

        if (error) {
          console.error('Error loading users:', error);
          setLoadError(`Failed to load users: ${error.message}`);
          return;
        }

        console.log('Setting users state with data from database:', data);

        if (!data || data.length === 0) {
          console.warn('No users found in database');

          // Check if we're logged in but have no users
          if (loggedInUser) {
            console.log('Logged in user exists but no profiles found, creating one for current user');

            try {
              // Create a profile for the current user if none exists
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  id: loggedInUser.id,
                  email: loggedInUser.email,
                  name: loggedInUser.user_metadata?.name || 'Current User',
                  role: 'admin',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (profileError) {
                console.error('Error creating profile for current user:', profileError);
              } else {
                console.log('Created profile for current user, refreshing...');
                // Refresh after a short delay
                setTimeout(() => refreshUsers(), 500);
              }
            } catch (e) {
              console.error('Error creating profile:', e);
            }
          }
        }

        setUsers(data || []);
      } catch (error) {
        console.error('Error loading users:', error);
        setLoadError(`Unexpected error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [refreshTrigger, loggedInUser]); // Reload when refreshTrigger or loggedInUser changes

  // Function to create a test user for development
  const createTestUser = async () => {
    try {
      console.log('Creating test user');

      // Generate a unique email
      const testEmail = `test-user-${Date.now()}@example.com`;
      const testPassword = 'password123'; // Simple password for test users

      // Create the user
      const { data, error } = await signUp(testEmail, testPassword, {
        name: 'Test User',
        role: 'user'
      });

      if (error) {
        console.error('Error creating test user:', error);
        alert(`Failed to create test user: ${error.message}`);
        return;
      }

      console.log('Test user created successfully:', data);
      alert(`Test user created successfully with email: ${testEmail}`);

      // Refresh the users list
      refreshUsers();
    } catch (error) {
      console.error('Unexpected error creating test user:', error);
      alert(`Unexpected error creating test user: ${error.message}`);
    }
  };

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
    console.log('handleDeleteUser called with userId:', userId);

    // Prevent deleting yourself
    if (userId === loggedInUser?.id) {
      alert("You cannot delete your own account!");
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('Confirmed deletion for user:', userId);

        // Get the user before deletion for logging
        const userToDelete = users.find(u => u.id === userId);
        console.log('User to delete:', userToDelete);

        if (!userToDelete) {
          console.error('User not found in local state:', userId);
          alert('User not found. The page may be out of date. Please refresh and try again.');
          return;
        }

        // Immediately update the UI for better user experience
        setUsers(prevUsers => {
          const filtered = prevUsers.filter(user => user.id !== userId);
          console.log('Immediately filtered users in local state:', filtered);
          return filtered;
        });

        // Delete the user using our Supabase function
        console.log('Calling deleteUser function...');
        const result = await deleteUser(userId);
        console.log('deleteUser result:', result);

        if (result.error) {
          console.error('Error deleting user:', result.error);

          // Revert the UI change since deletion failed
          refreshUsers();

          alert(`Failed to delete user: ${result.error.message}`);
          return;
        }

        console.log('User deleted successfully in database');

        // Update localStorage if needed
        try {
          const usersStr = localStorage.getItem('supabase_users');
          if (usersStr) {
            const storedUsers = JSON.parse(usersStr);
            const filteredUsers = storedUsers.filter(user => user.id !== userId);
            localStorage.setItem('supabase_users', JSON.stringify(filteredUsers));
            console.log('Updated localStorage');
          }
        } catch (localStorageError) {
          console.error('Error updating localStorage:', localStorageError);
        }

        // Schedule multiple refreshes to ensure consistency
        // First refresh immediately to confirm deletion
        refreshUsers(0);

        // Second refresh after a delay to catch any potential replication lag
        refreshUsers(1000);

        // Third refresh after a longer delay as a final check
        refreshUsers(3000);

        console.log('User deletion process completed successfully');
        alert('User deleted successfully');
      } catch (error) {
        console.error('Unexpected error in handleDeleteUser:', error);
        alert('An unexpected error occurred while deleting the user.');

        // Refresh to ensure UI is consistent with database
        refreshUsers();
      }
    } else {
      console.log('User deletion cancelled by user');
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
        console.log('Updating user:', currentUser.id, 'with role:', formData.role);

        try {
          // Try to update the profile directly
          const { error: profileError } = await updateUserProfile(currentUser.id, {
            name: formData.name,
            role: formData.role,
            updated_at: new Date()
          });

          if (profileError) {
            console.error('Error updating profile:', profileError);
            setError('Failed to update user profile: ' + profileError.message);
            return;
          }

          // For our simulated implementation, also update localStorage
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
          }

          // Refresh users list
          console.log('Refreshing users after update');
          refreshUsers();
        } catch (updateError) {
          console.error('Error in user update:', updateError);
          setError('Failed to update user: ' + updateError.message);
          return;
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
        console.log('Refreshing users after adding new user');
        refreshUsers();
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message);
    }
  };

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">User Management</h4>
            <small className="text-muted">Manage users and pre-approve Google sign-in access</small>
          </div>
          <Button variant="primary" onClick={handleAddUser}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add User
          </Button>
        </Card.Header>
        <Card.Body>
          {loadError && (
            <Alert variant="danger" className="mb-3">
              {loadError}
              <div className="mt-2">
                <Button variant="outline-danger" size="sm" onClick={() => refreshUsers()}>
                  Retry
                </Button>
              </div>
            </Alert>
          )}

          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted mb-3">No users found</p>
              <p className="small text-muted">
                {loggedInUser ?
                  "We're creating a profile for you. Please wait a moment and refresh the page." :
                  "Please sign in to manage users."
                }
              </p>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => refreshUsers()}
                >
                  Refresh
                </Button>

                {loggedInUser && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={createTestUser}
                  >
                    Create Test User
                  </Button>
                )}

                {loggedInUser && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleAddUser}
                  >
                    Add User Manually
                  </Button>
                )}
              </div>
            </div>
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
                        onClick={() => {
                          console.log('Delete button clicked for user:', user.id);
                          handleDeleteUser(user.id);
                        }}
                        disabled={user.id === loggedInUser?.id}
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

            <Alert variant="info" className="mb-3">
              <strong>Google Authentication:</strong> Adding a user here with their email address will pre-approve them for Google sign-in.
              Only users with pre-approved email addresses can sign in with Google. Regular email/password login does not require pre-approval.
            </Alert>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Form.Text className="text-muted">
                This email must match the Google account the user will sign in with.
              </Form.Text>
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
