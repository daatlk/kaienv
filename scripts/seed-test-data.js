// Script to seed test data into Supabase
// Run with: node scripts/seed-test-data.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This should be a service key with more privileges

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data
const testVMs = [
  {
    hostname: 'prod-db-server',
    ip_address: '192.168.1.10',
    admin_user: 'dbadmin',
    admin_password: 'securePass123!'
  },
  {
    hostname: 'app-server-01',
    ip_address: '192.168.1.20',
    admin_user: 'appadmin',
    admin_password: 'AppP@ss456!'
  },
  {
    hostname: 'test-env-server',
    ip_address: '192.168.1.30',
    admin_user: 'testadmin',
    admin_password: 'Test#789Pass'
  },
  {
    hostname: 'dev-server',
    ip_address: '192.168.1.40',
    admin_user: 'devuser',
    admin_password: 'Dev$ecure321'
  },
  {
    hostname: 'mgmt-server',
    ip_address: '192.168.1.50',
    admin_user: 'mgmtadmin',
    admin_password: 'Mgmt!Pass987'
  }
];

const testServices = [
  {
    vm_index: 0, // For prod-db-server
    name: 'Oracle Database',
    properties: {
      dbType: 'Oracle',
      version: '19c',
      port: 1521,
      sid: 'PRODDB',
      dataFilePath: '/u01/app/oracle/oradata'
    }
  },
  {
    vm_index: 1, // For app-server-01
    name: 'IFS Cloud',
    properties: {
      version: '22R2',
      port: 8080,
      deploymentPath: '/opt/ifs/cloud',
      jvmMemory: '8GB'
    }
  },
  {
    vm_index: 1, // For app-server-01
    name: 'Web Server',
    properties: {
      type: 'Apache',
      version: '2.4.41',
      port: 80,
      configPath: '/etc/apache2'
    }
  },
  {
    vm_index: 2, // For test-env-server
    name: 'Test DB',
    properties: {
      dbType: 'Oracle',
      version: '19c',
      port: 1521,
      sid: 'TESTDB',
      dataFilePath: '/u01/app/oracle/oradata/test'
    }
  },
  {
    vm_index: 2, // For test-env-server
    name: 'IFS Cloud Test',
    properties: {
      version: '22R2',
      port: 8080,
      deploymentPath: '/opt/ifs/cloud-test',
      jvmMemory: '4GB'
    }
  },
  {
    vm_index: 3, // For dev-server
    name: 'Dev DB',
    properties: {
      dbType: 'PostgreSQL',
      version: '14.5',
      port: 5432,
      sid: 'devdb',
      dataFilePath: '/var/lib/postgresql/data'
    }
  },
  {
    vm_index: 4, // For mgmt-server
    name: 'IFS Management Server',
    properties: {
      version: '10.5.0',
      port: 8443,
      configPath: '/opt/ifs/mgmt'
    }
  },
  {
    vm_index: 4, // For mgmt-server
    name: 'KaiMig',
    properties: {
      version: '3.2.1',
      configPath: '/opt/kaimig/config',
      logPath: '/var/log/kaimig',
      scheduledJobs: ['daily-backup', 'weekly-cleanup']
    }
  }
];

// Main function to seed data
async function seedData() {
  try {
    console.log('Starting to seed test data...');

    // Get admin user
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (profilesError) {
      throw new Error(`Error fetching admin profile: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      throw new Error('No admin user found. Please create an admin user first.');
    }

    const adminId = profiles[0].id;
    console.log(`Found admin user with ID: ${adminId}`);

    // Insert VMs
    const vmIds = [];
    for (const vm of testVMs) {
      const { data, error } = await supabase
        .from('vms')
        .insert({
          ...vm,
          created_by: adminId
        })
        .select();

      if (error) {
        throw new Error(`Error inserting VM ${vm.hostname}: ${error.message}`);
      }

      console.log(`Inserted VM: ${vm.hostname}`);
      vmIds.push(data[0].id);
    }

    // Insert services
    for (const service of testServices) {
      const vmId = vmIds[service.vm_index];
      
      const { error } = await supabase
        .from('services')
        .insert({
          vm_id: vmId,
          name: service.name,
          properties: service.properties
        });

      if (error) {
        throw new Error(`Error inserting service ${service.name}: ${error.message}`);
      }

      console.log(`Inserted service: ${service.name} for VM index ${service.vm_index}`);
    }

    console.log('Test data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
}

// Run the seed function
seedData();
