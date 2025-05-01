-- Add OS field to VMs table
ALTER TABLE vms ADD COLUMN os TEXT;

-- Update existing VMs with a default OS value
UPDATE vms SET os = 'Linux' WHERE os IS NULL;
