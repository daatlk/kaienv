-- Test Data for VM Dashboard
-- Run this script in the Supabase SQL Editor to populate your database with test data

-- Clear existing data (optional - uncomment if you want to reset data)
-- DELETE FROM services;
-- DELETE FROM vms;

-- Function to get the admin user ID (replace with your admin user ID if needed)
CREATE OR REPLACE FUNCTION get_admin_id() 
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Try to get the admin user ID from the profiles table
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  -- If no admin found, return NULL
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql;

-- Insert test VMs
DO $$
DECLARE
  admin_id UUID := get_admin_id();
  vm1_id UUID;
  vm2_id UUID;
  vm3_id UUID;
  vm4_id UUID;
  vm5_id UUID;
BEGIN
  -- Only proceed if we have an admin ID
  IF admin_id IS NOT NULL THEN
    -- Production Database Server
    INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
    VALUES ('prod-db-server', '192.168.1.10', 'dbadmin', 'securePass123!', admin_id)
    RETURNING id INTO vm1_id;
    
    -- Application Server
    INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
    VALUES ('app-server-01', '192.168.1.20', 'appadmin', 'AppP@ss456!', admin_id)
    RETURNING id INTO vm2_id;
    
    -- Test Environment
    INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
    VALUES ('test-env-server', '192.168.1.30', 'testadmin', 'Test#789Pass', admin_id)
    RETURNING id INTO vm3_id;
    
    -- Development Server
    INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
    VALUES ('dev-server', '192.168.1.40', 'devuser', 'Dev$ecure321', admin_id)
    RETURNING id INTO vm4_id;
    
    -- Management Server
    INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
    VALUES ('mgmt-server', '192.168.1.50', 'mgmtadmin', 'Mgmt!Pass987', admin_id)
    RETURNING id INTO vm5_id;
    
    -- Insert services for Production DB Server
    INSERT INTO services (vm_id, name, properties)
    VALUES (
      vm1_id, 
      'Oracle Database', 
      '{
        "dbType": "Oracle",
        "version": "19c",
        "port": 1521,
        "sid": "PRODDB",
        "dataFilePath": "/u01/app/oracle/oradata"
      }'::jsonb
    );
    
    -- Insert services for Application Server
    INSERT INTO services (vm_id, name, properties)
    VALUES (
      vm2_id, 
      'IFS Cloud', 
      '{
        "version": "22R2",
        "port": 8080,
        "deploymentPath": "/opt/ifs/cloud",
        "jvmMemory": "8GB"
      }'::jsonb
    );
    
    INSERT INTO services (vm_id, name, properties)
    VALUES (
      vm2_id, 
      'Web Server', 
      '{
        "type": "Apache",
        "version": "2.4.41",
        "port": 80,
        "configPath": "/etc/apache2"
      }'::jsonb
    );
    
    -- Insert services for Test Environment
    INSERT INTO services (vm_id, name, properties)
    VALUES (
      vm3_id, 
      'Test DB', 
      '{
        "dbType": "Oracle",
        "version": "19c",
        "port": 1521,
        "sid": "TESTDB",
        "dataFilePath": "/u01/app/oracle/oradata/test"
      }'::jsonb
    );
    
    INSERT INTO services (vm_id, name, properties)
    VALUES (
      vm3_id, 
      'IFS Cloud Test', 
      '{
        "version": "22R2",
        "port": 8080,
        "deploymentPath": "/opt/ifs/cloud-test",
        "jvmMemory": "4GB"
      }'::jsonb
    );
    
    -- Insert services for Development Server
    INSERT INTO services (vm_id, name, properties)
    VALUES (
      vm4_id, 
      'Dev DB', 
      '{
        "dbType": "PostgreSQL",
        "version": "14.5",
        "port": 5432,
        "sid": "devdb",
        "dataFilePath": "/var/lib/postgresql/data"
      }'::jsonb
    );
    
    -- Insert services for Management Server
    INSERT INTO services (vm_id, name, properties)
    VALUES (
      vm5_id, 
      'IFS Management Server', 
      '{
        "version": "10.5.0",
        "port": 8443,
        "configPath": "/opt/ifs/mgmt"
      }'::jsonb
    );
    
    INSERT INTO services (vm_id, name, properties)
    VALUES (
      vm5_id, 
      'KaiMig', 
      '{
        "version": "3.2.1",
        "configPath": "/opt/kaimig/config",
        "logPath": "/var/log/kaimig",
        "scheduledJobs": ["daily-backup", "weekly-cleanup"]
      }'::jsonb
    );
    
    RAISE NOTICE 'Test data inserted successfully';
  ELSE
    RAISE EXCEPTION 'No admin user found. Please create an admin user first.';
  END IF;
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS get_admin_id();

-- Query to verify the data
-- SELECT v.hostname, v.ip_address, s.name as service_name 
-- FROM vms v 
-- LEFT JOIN services s ON v.id = s.vm_id 
-- ORDER BY v.hostname, s.name;
