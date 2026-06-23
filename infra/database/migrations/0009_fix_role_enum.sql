CREATE TYPE user_role AS ENUM ('driver', 'dhaba_owner', 'mechanic', 'admin');

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

UPDATE users SET role = 'mechanic' WHERE role = 'mechanic_owner';

ALTER TABLE users 
  ALTER COLUMN role TYPE user_role 
  USING role::user_role;
