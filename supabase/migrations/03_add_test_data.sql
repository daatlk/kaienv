-- Create a test VM group
INSERT INTO vm_groups (id, name, description, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Web Servers', 'Servers hosting web applications', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Database Servers', 'Servers hosting database instances', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Development', 'Development and testing environments', NOW());

-- Update existing VMs to assign them to groups
-- Assuming there are existing VMs in the database
UPDATE vms 
SET 
  name = hostname || ' (Web)',
  group_id = '11111111-1111-1111-1111-111111111111'
WHERE id IN (
  SELECT id FROM vms ORDER BY created_at LIMIT 1
);

UPDATE vms 
SET 
  name = hostname || ' (DB)',
  group_id = '22222222-2222-2222-2222-222222222222'
WHERE id IN (
  SELECT id FROM vms ORDER BY created_at OFFSET 1 LIMIT 1
);

UPDATE vms 
SET 
  name = hostname || ' (Dev)',
  group_id = '33333333-3333-3333-3333-333333333333'
WHERE id IN (
  SELECT id FROM vms ORDER BY created_at OFFSET 2 LIMIT 1
);
