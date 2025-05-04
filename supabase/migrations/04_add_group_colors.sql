-- Add color column to vm_groups table
ALTER TABLE vm_groups ADD COLUMN color VARCHAR(20);

-- Update existing groups with default colors
UPDATE vm_groups SET color = '#3498db' WHERE id = '11111111-1111-1111-1111-111111111111'; -- Web Servers (Blue)
UPDATE vm_groups SET color = '#e74c3c' WHERE id = '22222222-2222-2222-2222-222222222222'; -- Database Servers (Red)
UPDATE vm_groups SET color = '#2ecc71' WHERE id = '33333333-3333-3333-3333-333333333333'; -- Development (Green)

-- Add a default color for new groups
ALTER TABLE vm_groups ALTER COLUMN color SET DEFAULT '#6c757d'; -- Default gray
