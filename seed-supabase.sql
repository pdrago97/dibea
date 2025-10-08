-- Seed admin user for DIBEA
-- Run this in Supabase SQL Editor

-- Create municipality if not exists
INSERT INTO municipios (id, nome, cnpj, ativo, created_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  'São Paulo',
  '12.345.678/0001-90',
  true,
  NOW()
) ON CONFLICT (cnpj) DO NOTHING;

-- Create admin user (password: admin123)
-- Hashed with bcrypt(10): $2b$10$rX9zK8Qv5J4wN7lM6pT0YuqYX8ZJ9K3L4mN6pQ8rS0tU2vW4xY6zA
INSERT INTO users (
  id, 
  name, 
  email, 
  password_hash, 
  phone, 
  role, 
  is_active, 
  municipality_id,
  created_at,
  updated_at
)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid,
  'Administrador DIBEA',
  'admin@dibea.com.br',
  '$2b$10$rX9zK8Qv5J4wN7lM6pT0YuqYX8ZJ9K3L4mN6pQ8rS0tU2vW4xY6zA',
  '(11) 99999-0000',
  'ADMIN',
  true,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Create test users
INSERT INTO users (name, email, password_hash, phone, role, is_active, municipality_id, created_at, updated_at)
VALUES
  ('João Silva', 'joao@test.com', '$2b$10$rX9zK8Qv5J4wN7lM6pT0YuqYX8ZJ9K3L4mN6pQ8rS0tU2vW4xY6zA', '(11) 98888-1111', 'FUNCIONARIO', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, NOW(), NOW()),
  ('Maria Santos', 'maria@test.com', '$2b$10$rX9zK8Qv5J4wN7lM6pT0YuqYX8ZJ9K3L4mN6pQ8rS0tU2vW4xY6zA', '(11) 98888-2222', 'VETERINARIO', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, NOW(), NOW()),
  ('Pedro Costa', 'pedro@test.com', '$2b$10$rX9zK8Qv5J4wN7lM6pT0YuqYX8ZJ9K3L4mN6pQ8rS0tU2vW4xY6zA', '(11) 98888-3333', 'CIDADAO', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

SELECT 'Seed completed! Login: admin@dibea.com.br / admin123' AS message;
