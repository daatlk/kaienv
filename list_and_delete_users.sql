-- List all users in auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;

-- List all profiles
SELECT id, name, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- Check for users in auth.users that don't have profiles
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;
