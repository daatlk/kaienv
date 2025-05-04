-- Add name field to vms table
ALTER TABLE vms ADD COLUMN name TEXT;

-- Update existing VMs to have a name that matches the hostname
UPDATE vms SET name = hostname WHERE name IS NULL;

-- Make name field required for future entries
ALTER TABLE vms ALTER COLUMN name SET NOT NULL;

-- Create vm_groups table
CREATE TABLE vm_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add group_id to vms table
ALTER TABLE vms ADD COLUMN group_id UUID REFERENCES vm_groups(id) ON DELETE SET NULL;

-- Create index for faster group lookups
CREATE INDEX idx_vms_group_id ON vms(group_id);
