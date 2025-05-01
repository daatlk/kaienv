-- Simple Test Data for VM Dashboard
-- Run this script in the Supabase SQL Editor to populate your database with test data

-- Clear existing data (uncomment if you want to reset data)
-- DELETE FROM services;
-- DELETE FROM vms;

-- Insert test VMs
-- Note: Replace 'your-admin-id-here' with your actual admin user ID from the profiles table
-- You can find this by running: SELECT id FROM profiles WHERE role = 'admin' LIMIT 1;

-- Production Database Server
INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
VALUES ('prod-db-server', '192.168.1.10', 'dbadmin', 'securePass123!', 'your-admin-id-here');

-- Application Server
INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
VALUES ('app-server-01', '192.168.1.20', 'appadmin', 'AppP@ss456!', 'your-admin-id-here');

-- Test Environment
INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
VALUES ('test-env-server', '192.168.1.30', 'testadmin', 'Test#789Pass', 'your-admin-id-here');

-- Development Server
INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
VALUES ('dev-server', '192.168.1.40', 'devuser', 'Dev$ecure321', 'your-admin-id-here');

-- Management Server
INSERT INTO vms (hostname, ip_address, admin_user, admin_password, created_by)
VALUES ('mgmt-server', '192.168.1.50', 'mgmtadmin', 'Mgmt!Pass987', 'your-admin-id-here');

-- Get the IDs of the inserted VMs
DO $$
DECLARE
  prod_db_id UUID;
  app_server_id UUID;
  test_env_id UUID;
  dev_server_id UUID;
  mgmt_server_id UUID;
BEGIN
  -- Get the IDs of the inserted VMs
  SELECT id INTO prod_db_id FROM vms WHERE hostname = 'prod-db-server';
  SELECT id INTO app_server_id FROM vms WHERE hostname = 'app-server-01';
  SELECT id INTO test_env_id FROM vms WHERE hostname = 'test-env-server';
  SELECT id INTO dev_server_id FROM vms WHERE hostname = 'dev-server';
  SELECT id INTO mgmt_server_id FROM vms WHERE hostname = 'mgmt-server';

  -- Insert services for Production DB Server
  INSERT INTO services (vm_id, name, properties)
  VALUES (
    prod_db_id, 
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
    app_server_id, 
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
    app_server_id, 
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
    test_env_id, 
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
    test_env_id, 
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
    dev_server_id, 
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
    mgmt_server_id, 
    'IFS Management Server', 
    '{
      "version": "10.5.0",
      "port": 8443,
      "configPath": "/opt/ifs/mgmt"
    }'::jsonb
  );
  
  INSERT INTO services (vm_id, name, properties)
  VALUES (
    mgmt_server_id, 
    'KaiMig', 
    '{
      "version": "3.2.1",
      "configPath": "/opt/kaimig/config",
      "logPath": "/var/log/kaimig",
      "scheduledJobs": ["daily-backup", "weekly-cleanup"]
    }'::jsonb
  );
END $$;
