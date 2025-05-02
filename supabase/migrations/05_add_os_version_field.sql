-- Add OS version field to VMs table
ALTER TABLE vms ADD COLUMN os_version TEXT;

-- Update existing VMs with a default OS version value
UPDATE vms SET os_version = 'Unknown' WHERE os_version IS NULL;
