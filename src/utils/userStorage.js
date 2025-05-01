import initialUsers from '../data/users.json';

// Initialize users in localStorage if not already present
const initializeUsers = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(initialUsers.users));
  }
  return getUsers();
};

// Get all users from localStorage
const getUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Get a user by username
const getUserByUsername = (username) => {
  const users = getUsers();
  return users.find(user => user.username === username);
};

// Get a user by ID
const getUserById = (id) => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

// Add a new user
const addUser = (user) => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Update an existing user
const updateUser = (updatedUser) => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === updatedUser.id);
  
  if (index !== -1) {
    users[index] = updatedUser;
    saveUsers(users);
    return updatedUser;
  }
  
  return null;
};

// Delete a user
const deleteUser = (userId) => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== userId);
  
  if (filteredUsers.length < users.length) {
    saveUsers(filteredUsers);
    return true;
  }
  
  return false;
};

// Update user password
const updatePassword = (userId, newPassword) => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === userId);
  
  if (index !== -1) {
    users[index].password = newPassword;
    saveUsers(users);
    return true;
  }
  
  return false;
};

// Verify user credentials
const verifyCredentials = (username, password) => {
  const user = getUserByUsername(username);
  return user && user.password === password ? user : null;
};

export {
  initializeUsers,
  getUsers,
  getUserByUsername,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  updatePassword,
  verifyCredentials
};
