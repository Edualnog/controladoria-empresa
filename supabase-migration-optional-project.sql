-- Make project_id optional in transactions table
ALTER TABLE transactions ALTER COLUMN project_id DROP NOT NULL;
