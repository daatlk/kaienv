import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use consistent credentials for Supabase
// The anon key from .env file
const envAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeGVuc3lwZnp5YW9pc3hoZXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMDYxNjYsImV4cCI6MjA2MTY4MjE2Nn0.NSwoS3sZ43xPnkqC8vlB9lNAAKK7akC9WVDS1fto6Ps';

// If the environment variable is not available, use the hardcoded key
if (!supabaseAnonKey || supabaseAnonKey.includes('${') || supabaseAnonKey === '') {
  console.log('Using hardcoded anon key');
  supabaseAnonKey = envAnonKey;
} else {
  console.log('Using environment variable anon key');
}

// Ensure the Supabase URL is valid
if (!supabaseUrl || supabaseUrl.includes('${') || supabaseUrl === '') {
  console.log('Using hardcoded URL');
  supabaseUrl = 'https://idxensypfzyaoisxhezs.supabase.co';
} else {
  // Make sure the URL has a protocol
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    supabaseUrl = 'https://' + supabaseUrl;
  }
  console.log('Using environment variable URL');
}

// Log the URL for debugging
console.log('Supabase URL:', supabaseUrl);

// Create options with better error handling
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
};

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

// Create a default admin user if none exists
const createDefaultAdminIfNeeded = async () => {
  try {
    console.log('Checking if default admin user needs to be created...');

    // Check if any users exist
    const { data: existingUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (usersError) {
      console.error('Error checking for existing users:', usersError);
      return;
    }

    // If users exist, no need to create default admin
    if (existingUsers && existingUsers.length > 0) {
      console.log('Users already exist, no need to create default admin');
      return;
    }

    console.log('No users found, creating default admin user...');

    // Create default admin user with a valid email domain
    const defaultEmail = 'admin@gmail.com'; // Using gmail.com which is typically allowed
    const defaultPassword = 'admin123';

    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: defaultEmail,
      password: defaultPassword,
      options: {
        data: {
          name: 'Default Admin',
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Error creating default admin auth user:', authError);
      return;
    }

    if (!authData.user) {
      console.error('No user returned from auth signup');
      return;
    }

    console.log('Created default admin auth user:', authData.user.id);

    // Then create the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: defaultEmail,
        name: 'Default Admin',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating default admin profile:', profileError);
      return;
    }

    console.log('Successfully created default admin user with email:', defaultEmail);
    console.log('Default admin password:', defaultPassword);
    console.log('IMPORTANT: Please change this password after first login!');

  } catch (error) {
    console.error('Unexpected error creating default admin:', error);
  }
};

// Call the function to create default admin if needed
createDefaultAdminIfNeeded();

// Authentication functions
export const signUp = async (email, password, userData) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: { data: userData }
  });
};

export const signIn = async (email, password) => {
  // First, check if this is a valid user in our system
  try {
    // Attempt to sign in with the provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error during sign in:', error);
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error during sign in:', error);
    return { error };
  }
};

export const signInWithGoogle = async () => {
  // Get the current hostname to determine the redirect URL
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';

  // Determine the appropriate redirect URL
  let redirectUrl;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For local development, use the production URL
    redirectUrl = 'https://v0-kaienv.vercel.app/dashboard';
    console.log('Local development detected, using production redirect URL:', redirectUrl);
  } else {
    // For production, use the current origin
    redirectUrl = `${protocol}//${hostname}${port}/dashboard`;
    console.log('Production environment detected, using current origin for redirect:', redirectUrl);
  }

  console.log('Starting Google authentication with redirect URL:', redirectUrl);
  console.log('Make sure this exact URL is configured in Supabase Google OAuth settings');

  try {
    // Direct OAuth call with detailed logging
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        scopes: 'email profile',
        queryParams: {
          // Force Google to show the account selection screen
          prompt: 'select_account'
          // Domain restriction removed - allowing all Google accounts
        }
      }
    });

    console.log('Google OAuth initialization result:', result);

    if (result.error) {
      console.error('Error initializing Google OAuth:', result.error);
    } else if (result.data?.url) {
      console.log('Redirecting to Google OAuth URL:', result.data.url);
    }

    return result;
  } catch (error) {
    console.error('Error in Google authentication:', error);
    return { error };
  }
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getSession = async () => {
  return await supabase.auth.getSession();
};

// User profile functions
export const getUserProfile = async (userId) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

// Check if an email is pre-approved (exists in auth.users with a corresponding profile)
export const isEmailPreApproved = async (email) => {
  if (!email) return { data: false, error: new Error('Email is required') };

  try {
    console.log('Checking if email is pre-approved:', email);

    // First, try to find the user in auth.users by email
    // Note: This approach might not work depending on your Supabase version and permissions
    let user = null;
    let authError = null;

    try {
      // Try using the admin API if available
      const response = await supabase.auth.admin.listUsers({
        filter: {
          email: email.toLowerCase()
        }
      });

      if (response.error) {
        authError = response.error;
      } else if (response.data && response.data.users && response.data.users.length > 0) {
        user = response.data.users[0];
      }
    } catch (e) {
      console.log('Admin API not available, will try alternative methods:', e);
      authError = e;
    }

    if (authError) {
      console.error('Error finding user by email in auth.users:', authError);

      // Alternative approach if admin API is not available
      console.log('Trying alternative approach to find user...');

      // Use a custom query to find the user
      const { data: users, error: queryError } = await supabase
        .rpc('find_user_by_email', { email_to_find: email.toLowerCase() });

      if (queryError || !users || users.length === 0) {
        console.error('Error or no results from find_user_by_email:', queryError);
        return { data: false, error: queryError || new Error('User not found') };
      }

      // Check if the user has a profile
      const userId = users[0].id;
      console.log('Found user ID from custom query:', userId);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking for profile:', profileError);
        return { data: false, error: profileError };
      }

      const isApproved = !!profile;
      console.log('Email pre-approval check result (alternative method):', isApproved);

      return { data: isApproved, error: null };
    }

    if (!user) {
      console.log('No user found with email:', email);
      return { data: false, error: null };
    }

    console.log('Found user in auth.users:', user.id);

    // Now check if this user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking for profile:', profileError);
      return { data: false, error: profileError };
    }

    const isApproved = !!profile;
    console.log('Email pre-approval check result:', isApproved);

    return { data: isApproved, error: null };
  } catch (error) {
    console.error('Unexpected error checking email approval:', error);

    // Last resort fallback - try a direct SQL query via RPC
    try {
      console.log('Trying fallback RPC method...');
      const { data: isApproved, error: rpcError } = await supabase
        .rpc('check_email_pre_approved', { check_email: email.toLowerCase() });

      if (rpcError) {
        console.error('Error in RPC fallback:', rpcError);
        return { data: false, error: rpcError };
      }

      console.log('Email pre-approval check result (RPC fallback):', isApproved);
      return { data: !!isApproved, error: null };
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
      return { data: false, error };
    }
  }
};

export const updateUserProfile = async (userId, userData) => {
  return await supabase
    .from('profiles')
    .update(userData)
    .eq('id', userId);
};

// Get all users (admin only)
export const getUsers = async () => {
  console.log('Fetching all users from database...');

  // First try to get all profiles without any filtering
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return { data: [], error };
  }

  console.log(`Retrieved ${data?.length || 0} users from database`);

  // Log the IDs of all users for debugging
  if (data && data.length > 0) {
    console.log('User IDs in result:', data.map(user => user.id));

    // Filter out deleted users in JavaScript instead of SQL
    // This is more lenient and will work even if the is_deleted column doesn't exist
    const filteredData = data.filter(user => {
      // Keep the user if:
      // 1. is_deleted doesn't exist as a property, OR
      // 2. is_deleted is null, OR
      // 3. is_deleted is false
      return !Object.prototype.hasOwnProperty.call(user, 'is_deleted') || user.is_deleted === null || user.is_deleted === false;
    });

    console.log(`After filtering, ${filteredData.length} users remain`);
    return { data: filteredData, error: null };
  }

  // If no users found, try to create a default admin user
  if (data.length === 0) {
    console.log('No users found, checking if we need to create a default admin');

    try {
      // Check if we're authenticated
      const { data: session } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('Found authenticated user, creating profile if needed');

        // Check if this user already has a profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingProfile) {
          // Create a profile for this user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || 'Admin User',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating default admin profile:', insertError);
          } else {
            console.log('Created default admin profile');

            // Fetch the newly created profile
            const { data: newData } = await supabase
              .from('profiles')
              .select('*')
              .order('created_at', { ascending: false });

            return { data: newData || [], error: null };
          }
        }
      }
    } catch (e) {
      console.error('Error checking for default admin:', e);
    }
  }

  return { data: data || [], error: null };
};

// Delete a user (admin only)
export const deleteUser = async (userId) => {
  try {
    console.log('Deleting user with ID:', userId);

    // First, try using our new RPC function
    try {
      const { data, error: rpcError } = await supabase.rpc('delete_user_by_id', {
        user_id: userId
      });

      if (!rpcError && data === true) {
        console.log('User deleted successfully via delete_user_by_id RPC');
        return { data: { success: true, method: 'rpc_delete_user_by_id' }, error: null };
      }

      console.log('RPC delete_user_by_id failed or returned false:', rpcError || 'Function returned false');
    } catch (rpcError) {
      console.error('Error calling delete_user_by_id RPC:', rpcError);
    }

    // If RPC fails, verify the user exists in profiles
    const { data: userExists, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is fine
      console.error('Error checking if user exists in profiles:', checkError);
      // Continue anyway - the user might exist in auth.users but not in profiles
    }

    console.log('Proceeding with deletion, profile exists:', !!userExists);

    // Try multiple approaches to ensure deletion works

    // First delete from profiles if it exists
    if (userExists) {
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileDeleteError) {
        console.error('Error deleting profile:', profileDeleteError);
        // Continue anyway - we'll try to delete from auth.users
      } else {
        console.log('Profile deleted successfully');
      }
    }

    // Now try to delete from auth.users using our force delete function
    try {
      const { error: forceError } = await supabase.rpc('force_delete_user_by_id', {
        user_id: userId
      });

      if (!forceError) {
        console.log('User deleted successfully via force_delete_user_by_id RPC');
        return { data: { success: true, method: 'rpc_force_delete' }, error: null };
      }

      console.error('Force delete RPC failed:', forceError);
    } catch (forceError) {
      console.error('Error calling force_delete_user_by_id RPC:', forceError);
    }

    // If all else fails, try the original delete_user_by_id_force function
    try {
      const { error: legacyRpcError } = await supabase.rpc('delete_user_by_id_force', {
        user_id_param: userId
      });

      if (!legacyRpcError) {
        console.log('User deleted successfully via legacy delete_user_by_id_force RPC');
        return { data: { success: true, method: 'legacy_rpc' }, error: null };
      }

      console.error('Legacy RPC deletion failed:', legacyRpcError);
    } catch (legacyError) {
      console.error('Error calling legacy delete function:', legacyError);
    }

    // Last resort - mark as deleted if profile exists
    if (userExists) {
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            is_deleted: true,
            deleted_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (!updateError) {
          console.log('User marked as deleted successfully');
          return { data: { success: true, method: 'marked_as_deleted' }, error: null };
        }

        console.error('Failed to mark user as deleted:', updateError);
      } catch (updateError) {
        console.error('Error marking user as deleted:', updateError);
      }
    }

    // If we got here, all deletion methods failed
    return {
      error: {
        message: 'All deletion methods failed. The user might still exist in auth.users but not in profiles.'
      }
    };
  } catch (error) {
    console.error('Unexpected error deleting user:', error);
    return { error: { message: 'Unexpected error deleting user' } };
  }
};

// VM management functions
export const getVMs = async () => {
  return await supabase
    .from('vms')
    .select(`
      *,
      services(*)
    `);
};

export const getVMById = async (id) => {
  return await supabase
    .from('vms')
    .select(`
      *,
      services(*)
    `)
    .eq('id', id)
    .single();
};

export const createVM = async (vmData) => {
  // Get current user
  const { data: { session } } = await getSession();
  let userId = null;

  if (session) {
    // For Supabase-authenticated users
    userId = session.user.id;
  } else {
    // For simulated Google users or other non-Supabase auth methods
    // Check if there's a user in localStorage (our simulated auth might store it there)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (currentUser && currentUser.id) {
      userId = currentUser.id;
    } else {
      // Generate a temporary ID if no user is found
      userId = 'temp-' + Math.random().toString(36).substring(2, 15);
    }
  }

  // First create the VM
  const { data: vm, error: vmError } = await supabase
    .from('vms')
    .insert([{
      name: vmData.name,
      hostname: vmData.hostname,
      ip_address: vmData.ip_address,
      admin_user: vmData.admin_user,
      admin_password: vmData.admin_password,
      os: vmData.os || 'Linux',
      os_version: vmData.os_version || '',
      group_id: vmData.group_id || null,
      created_by: userId
    }])
    .select()
    .single();

  if (vmError) return { error: vmError };

  // Then create the services
  if (vmData.services && vmData.services.length > 0) {
    const services = vmData.services.map(service => ({
      vm_id: vm.id,
      name: service.name,
      properties: service.properties
    }));

    const { error: servicesError } = await supabase
      .from('services')
      .insert(services);

    if (servicesError) return { error: servicesError };
  }

  // Return the created VM with its services
  return await getVMById(vm.id);
};

export const updateVM = async (id, vmData) => {
  // Update the VM
  const { error: vmError } = await supabase
    .from('vms')
    .update({
      name: vmData.name,
      hostname: vmData.hostname,
      ip_address: vmData.ip_address,
      admin_user: vmData.admin_user,
      admin_password: vmData.admin_password,
      os: vmData.os || 'Linux',
      os_version: vmData.os_version || '',
      group_id: vmData.group_id,
      updated_at: new Date()
    })
    .eq('id', id);

  if (vmError) return { error: vmError };

  // Handle services updates (more complex in a real app)
  // This is a simplified approach
  if (vmData.services) {
    // Delete existing services
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('vm_id', id);

    if (deleteError) return { error: deleteError };

    // Insert new services
    if (vmData.services.length > 0) {
      const services = vmData.services.map(service => ({
        vm_id: id,
        name: service.name,
        properties: service.properties
      }));

      const { error: servicesError } = await supabase
        .from('services')
        .insert(services);

      if (servicesError) return { error: servicesError };
    }
  }

  // Return the updated VM with its services
  return await getVMById(id);
};

export const deleteVM = async (id) => {
  // Services will be automatically deleted due to ON DELETE CASCADE
  return await supabase
    .from('vms')
    .delete()
    .eq('id', id);
};

export const getServiceTypes = async () => {
  return await supabase
    .from('service_types')
    .select('*');
};

// VM Group management functions
export const getVMGroups = async () => {
  return await supabase
    .from('vm_groups')
    .select('*')
    .order('name');
};

export const getVMGroupById = async (id) => {
  return await supabase
    .from('vm_groups')
    .select('*')
    .eq('id', id)
    .single();
};

export const createVMGroup = async (groupData) => {
  // Get current user
  const { data: { session } } = await getSession();
  let userId = null;

  if (session) {
    userId = session.user.id;
  } else {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    userId = currentUser?.id || null;
  }

  return await supabase
    .from('vm_groups')
    .insert([{
      name: groupData.name,
      description: groupData.description || '',
      color: groupData.color || '#6c757d', // Default gray if no color provided
      created_by: userId
    }])
    .select()
    .single();
};

export const updateVMGroup = async (id, groupData) => {
  return await supabase
    .from('vm_groups')
    .update({
      name: groupData.name,
      description: groupData.description || '',
      color: groupData.color || '#6c757d', // Default gray if no color provided
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
};

export const deleteVMGroup = async (id) => {
  // This will set group_id to null for all VMs in this group due to ON DELETE SET NULL
  return await supabase
    .from('vm_groups')
    .delete()
    .eq('id', id);
};

// Move multiple VMs to a group
export const moveVMsToGroup = async (vmIds, groupId) => {
  return await supabase
    .from('vms')
    .update({
      group_id: groupId,
      updated_at: new Date()
    })
    .in('id', vmIds);
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data, error } = await getSession();

  if (error || !data.session) {
    return null;
  }

  return data.session.user;
};

// Update user data in auth and profile
export const updateUser = async (userData) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: { message: 'Not authenticated' } };
  }

  // Update auth user metadata if needed
  if (userData.name || userData.role) {
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        name: userData.name,
        role: userData.role
      }
    });

    if (authError) {
      console.error('Error updating auth user metadata:', authError);
      return { error: authError };
    }
  }

  // Update profile data
  const profileData = {
    updated_at: new Date()
  };

  // Only include fields that are provided
  if (userData.name) profileData.name = userData.name;
  if (userData.role) profileData.role = userData.role;

  const { error: profileError } = await updateUserProfile(user.id, profileData);

  if (profileError) {
    console.error('Error updating profile:', profileError);
    return { error: profileError };
  }

  return { data: { user }, error: null };
};
