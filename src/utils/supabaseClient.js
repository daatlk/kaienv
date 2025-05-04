import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the anon key contains the literal template string (which indicates a substitution failure)
if (supabaseAnonKey && (supabaseAnonKey.includes('${') || supabaseAnonKey.includes('${'))) {
  console.error('Anon key environment variable substitution failed. Using hardcoded fallback key.');
  // Use a hardcoded fallback key (this should be a public anon key, not a secret)
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeGVuc3lwZnp5YW9pc3hoZXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU2MzA0MDAsImV4cCI6MjAzMTIwNjQwMH0.Wd9JKu-JW3AXW-m-9-mJQENAzDVANnCHZsKUlO0Zn-o';
}

// Check if the URL contains the literal template string (which indicates a substitution failure)
if (supabaseUrl && (supabaseUrl.includes('${') || supabaseUrl.includes('${'))) {
  console.error('Environment variable substitution failed. Using hardcoded fallback URL.');
  // Use a hardcoded fallback URL for Supabase
  supabaseUrl = 'https://idxensypfzyaoisxhezs.supabase.co';
}

// Ensure the Supabase URL is valid
if (supabaseUrl) {
  // Make sure the URL has a protocol
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    supabaseUrl = 'https://' + supabaseUrl;
  }

  // Log the URL for debugging
  console.log('Using Supabase URL:', supabaseUrl);
} else {
  // Fallback to a default URL if none is provided
  console.error('No Supabase URL provided in environment variables');
  // Use a hardcoded fallback URL for Supabase
  supabaseUrl = 'https://idxensypfzyaoisxhezs.supabase.co';
}

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

// Authentication functions
export const signUp = async (email, password, userData) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: { data: userData }
  });
};

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signInWithGoogle = async () => {
  // Use a direct approach with minimal code to avoid errors
  console.log('Starting Google authentication...');

  try {
    // Direct OAuth call without any session manipulation
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://v0-kaienv.vercel.app/dashboard',
        scopes: 'email profile'
      }
    });
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

    // First, verify the user exists
    const { data: userExists, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is fine
      console.error('Error checking if user exists:', checkError);
      return { error: checkError };
    }

    if (!userExists) {
      console.warn('User not found, nothing to delete:', userId);
      return { data: { success: true, message: 'User not found' }, error: null };
    }

    console.log('User found, proceeding with deletion');

    // Try multiple approaches to ensure deletion works

    // Approach 1: Direct SQL query via RPC (most reliable)
    const { error: rpcError } = await supabase.rpc('delete_user_by_id_force', {
      user_id_param: userId
    });

    if (!rpcError) {
      console.log('User deleted successfully via RPC');
      return { data: { success: true }, error: null };
    }

    console.error('RPC deletion failed, trying standard delete:', rpcError);

    // Approach 2: Standard delete
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user profile via standard delete:', error);

      // Approach 3: Last resort - mark as deleted instead of actually deleting
      console.log('Trying to mark user as deleted instead');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          email: `deleted_${Date.now()}_${userId}` // Ensure email uniqueness
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to mark user as deleted:', updateError);
        return { error: updateError };
      }

      console.log('User marked as deleted successfully');
      return { data: { success: true, method: 'marked_as_deleted' }, error: null };
    }

    console.log('User profile deleted successfully via standard delete');
    return { data: { success: true, method: 'standard_delete' }, error: null };
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
      hostname: vmData.hostname,
      ip_address: vmData.ip_address,
      admin_user: vmData.admin_user,
      admin_password: vmData.admin_password,
      os: vmData.os || 'Linux',
      os_version: vmData.os_version || '',
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
      hostname: vmData.hostname,
      ip_address: vmData.ip_address,
      admin_user: vmData.admin_user,
      admin_password: vmData.admin_password,
      os: vmData.os || 'Linux',
      os_version: vmData.os_version || '',
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
