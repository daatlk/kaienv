import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  // Get all profiles
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  return { data, error };
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

  if (!session) {
    return { error: { message: 'Not authenticated' } };
  }

  // First create the VM
  const { data: vm, error: vmError } = await supabase
    .from('vms')
    .insert([{
      hostname: vmData.hostname,
      ip_address: vmData.ipAddress,
      admin_user: vmData.adminUser,
      admin_password: vmData.adminPassword,
      os: vmData.os || 'Linux',
      created_by: session.user.id
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
      ip_address: vmData.ipAddress,
      admin_user: vmData.adminUser,
      admin_password: vmData.adminPassword,
      os: vmData.os || 'Linux',
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
  if (userData.name) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { name: userData.name }
    });

    if (authError) {
      return { error: authError };
    }
  }

  // Update profile data
  const { error: profileError } = await updateUserProfile(user.id, {
    name: userData.name,
    updated_at: new Date()
  });

  if (profileError) {
    return { error: profileError };
  }

  return { data: { user }, error: null };
};
