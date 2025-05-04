import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Container, Alert } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import Login from './components/Login'
import UserManagement from './components/UserManagementSupabase'
import Profile from './components/Profile'
import LoadingSpinner from './components/LoadingSpinner'
import ManualLogout from './components/ManualLogout'
import ServiceDetailsPage from './components/ServiceDetailsPage'
import {
  getVMs,
  getServiceTypes,
  createVM,
  updateVM as updateVMInSupabase,
  deleteVM as deleteVMFromSupabase
} from './utils/supabaseClient'
import { AuthProvider, useAuth, ProtectedRoute, AdminRoute } from './context/AuthContext'
import { initAuthCallbackHandler } from './utils/authCallback'

// Main dashboard component with VM management functionality
const DashboardContainer = () => {
  const [vms, setVms] = useState([])
  const [serviceTypes, setServiceTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser, isGoogleUser } = useAuth()

  // Load VMs and service types from Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if we have a valid session first
        const { supabase } = await import('./utils/supabaseClient');
        const { data: sessionData } = await supabase.auth.getSession();

        console.log("Dashboard: Checking session before loading data:", sessionData);

        // If we have tokens in localStorage, try to set the session
        const storedTokens = localStorage.getItem('supabase.auth.token');
        if (storedTokens && (!sessionData || !sessionData.session)) {
          try {
            const parsedTokens = JSON.parse(storedTokens);
            console.log("Dashboard: Found tokens in localStorage, setting session");

            if (parsedTokens.access_token) {
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: parsedTokens.access_token,
                refresh_token: parsedTokens.refresh_token || null
              });

              if (sessionError) {
                console.error("Dashboard: Error setting session with stored tokens:", sessionError);
              } else {
                console.log("Dashboard: Session set successfully with stored tokens:", sessionData);
              }
            }
          } catch (e) {
            console.error("Dashboard: Error parsing stored tokens:", e);
          }
        }

        // Load VMs from Supabase for all users
        const { data: vmData, error: vmError } = await getVMs();
        if (vmError) {
          console.error('Error loading VMs:', vmError);

          // If it's an authentication error, show a more specific message
          if (vmError.message === 'Invalid API key') {
            setError('Authentication error. Please try logging out and logging in again.');
          } else {
            setError('Failed to load VMs. Please try again later.');
          }

          // Set empty VMs array when there's an error
          setVms([]);
        } else {
          setVms(vmData || []);
        }

        // Load service types
        const { data: serviceTypeData, error: serviceTypeError } = await getServiceTypes();
        if (serviceTypeError) {
          console.error('Error loading service types:', serviceTypeError);

          // If it's an authentication error, show a more specific message
          if (serviceTypeError.message === 'Invalid API key') {
            if (!error) {
              setError('Authentication error. Please try logging out and logging in again.');
            }
          } else if (!error) {
            setError('Failed to load service types. Please try again later.');
          }

          // Set empty service types array when there's an error
          setServiceTypes([]);
        } else {
          setServiceTypes(serviceTypeData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('An unexpected error occurred. Please try again later.');

        // Set empty arrays when there's an error
        setVms([]);
        setServiceTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // State for VM operations
  const [vmOperationLoading, setVmOperationLoading] = useState(false)
  const [vmOperationError, setVmOperationError] = useState(null)
  const [operationType, setOperationType] = useState(null) // 'add', 'update', or 'delete'

  // Function to add a new VM
  const handleAddVM = async (newVM) => {
    setVmOperationLoading(true);
    setVmOperationError(null);
    setOperationType('add');

    try {
      // Add to Supabase for all users
      const { data, error } = await createVM(newVM);

      if (error) {
        console.error('Error adding VM:', error);
        setVmOperationError(`Failed to add VM: ${error.message}`);
        return false;
      }

      // Add the new VM to the state
      setVms([...vms, data]);
      return true;
    } catch (error) {
      console.error('Error adding VM:', error);
      setVmOperationError('An unexpected error occurred while adding the VM.');
      return false;
    } finally {
      setVmOperationLoading(false);
      // Reset operation type after a delay
      setTimeout(() => setOperationType(null), 2000);
    }
  }

  // Function to update an existing VM
  const handleUpdateVM = async (updatedVM) => {
    setVmOperationLoading(true);
    setVmOperationError(null);
    setOperationType('update');

    try {
      // Update in Supabase for all users
      const { data, error } = await updateVMInSupabase(updatedVM.id, updatedVM);

      if (error) {
        console.error('Error updating VM:', error);
        setVmOperationError(`Failed to update VM: ${error.message}`);
        return false;
      }

      // Update the VM in the state
      setVms(vms.map(vm => vm.id === updatedVM.id ? data : vm));
      return true;
    } catch (error) {
      console.error('Error updating VM:', error);
      setVmOperationError('An unexpected error occurred while updating the VM.');
      return false;
    } finally {
      setVmOperationLoading(false);
      // Reset operation type after a delay
      setTimeout(() => setOperationType(null), 2000);
    }
  }

  // Function to delete a VM
  const handleDeleteVM = async (vmId) => {
    setVmOperationLoading(true);
    setVmOperationError(null);
    setOperationType('delete');

    try {
      // Delete from Supabase for all users
      const { error } = await deleteVMFromSupabase(vmId);

      if (error) {
        console.error('Error deleting VM:', error);
        setVmOperationError(`Failed to delete VM: ${error.message}`);
        return false;
      }

      // Remove the VM from the state
      setVms(vms.filter(vm => vm.id !== vmId));
      return true;
    } catch (error) {
      console.error('Error deleting VM:', error);
      setVmOperationError('An unexpected error occurred while deleting the VM.');
      return false;
    } finally {
      setVmOperationLoading(false);
      // Reset operation type after a delay
      setTimeout(() => setOperationType(null), 2000);
    }
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <Header />
      <Container className="mt-4">
        {/* Show error message if there is one */}
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Show VM operation error if there is one */}
        {vmOperationError && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setVmOperationError(null)}>
            {vmOperationError}
          </Alert>
        )}

        {/* Show loading spinner if loading */}
        {loading ? (
          <LoadingSpinner fullPage text="Loading dashboard data..." />
        ) : (
          <Dashboard
            vms={vms}
            serviceTypes={serviceTypes}
            onAddVM={handleAddVM}
            onUpdateVM={handleUpdateVM}
            onDeleteVM={handleDeleteVM}
            loading={vmOperationLoading}
            operationType={operationType}
          />
        )}
      </Container>
    </>
  )
}

// User management container
const UserManagementContainer = () => {
  return (
    <>
      <Header />
      <Container className="mt-4">
        <UserManagement />
      </Container>
    </>
  )
}

// Profile container
const ProfileContainer = () => {
  return (
    <>
      <Header />
      <Container className="mt-4">
        <Profile />
      </Container>
    </>
  )
}

// Service details page container
const ServiceDetailsPageContainer = () => {
  return (
    <>
      <Header />
      <ServiceDetailsPage />
    </>
  )
}

// Main App component with routing
function App() {
  // State to track if we're handling an auth callback
  const [isHandlingCallback, setIsHandlingCallback] = useState(false);

  // Initialize the auth callback handler
  // This will check if the current URL is an authentication callback
  // and redirect to the correct URL if needed
  useEffect(() => {
    const checkAuth = async () => {
      // Check if this is an authentication callback
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log('Detected authentication callback in App component');
        setIsHandlingCallback(true);

        try {
          // Initialize the auth callback handler
          const isHandled = initAuthCallbackHandler();

          if (isHandled) {
            console.log('Authentication callback handled. Redirecting...');
            // If the callback was handled, we don't need to render the app
            // The user will be redirected to the correct URL
            return;
          }
        } catch (error) {
          console.error('Error handling authentication callback:', error);
          // If there's an error, redirect to dashboard anyway
          window.location.href = '/dashboard';
          return;
        }
      } else {
        try {
          // Check if we have a valid session from Supabase
          const { supabase } = await import('./utils/supabaseClient');
          const { data: sessionData } = await supabase.auth.getSession();

          if (sessionData?.session) {
            console.log('Found authenticated session:', sessionData.session.user.email);

            // If we're on the login page but have a valid session, redirect to dashboard
            if (window.location.pathname === '/login') {
              console.log('Already logged in, redirecting to dashboard');
              window.location.href = '/dashboard';
              return;
            }
          }
        } catch (error) {
          console.error('Error checking authentication session:', error);
        }
      }

      console.log('Not an authentication callback or already handled.');
    };

    checkAuth();
  }, []);

  // If we're handling an auth callback, show a loading spinner
  if (isHandlingCallback) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Processing authentication...</p>
        </div>
      </Container>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Container fluid className="p-0">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardContainer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <UserManagementContainer />
                </AdminRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileContainer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/service/:vmId/:serviceId"
              element={
                <ProtectedRoute>
                  <ServiceDetailsPageContainer />
                </ProtectedRoute>
              }
            />
            {/* Manual logout route - accessible to anyone */}
            <Route path="/manual-logout" element={<ManualLogout />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  )
}

export default App
