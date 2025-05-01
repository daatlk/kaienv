-- Seed service types
INSERT INTO service_types (name, property_fields) VALUES
('DB', '[
  {"name": "dbType", "label": "Database Type", "type": "text"},
  {"name": "version", "label": "Version", "type": "text"},
  {"name": "port", "label": "Port", "type": "number"},
  {"name": "sid", "label": "SID/Database Name", "type": "text"},
  {"name": "dataFilePath", "label": "Data File Path", "type": "text"}
]'::jsonb),
('IFS Cloud', '[
  {"name": "version", "label": "Version", "type": "text"},
  {"name": "port", "label": "Port", "type": "number"},
  {"name": "deploymentPath", "label": "Deployment Path", "type": "text"},
  {"name": "jvmMemory", "label": "JVM Memory", "type": "text"}
]'::jsonb),
('IFS Management Server', '[
  {"name": "version", "label": "Version", "type": "text"},
  {"name": "port", "label": "Port", "type": "number"},
  {"name": "configPath", "label": "Configuration Path", "type": "text"}
]'::jsonb),
('KaiMig', '[
  {"name": "version", "label": "Version", "type": "text"},
  {"name": "configPath", "label": "Configuration Path", "type": "text"},
  {"name": "logPath", "label": "Log Path", "type": "text"},
  {"name": "scheduledJobs", "label": "Scheduled Jobs", "type": "array"}
]'::jsonb);

-- Note: User data will be created through the application's signup process
