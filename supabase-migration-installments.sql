-- ============================================
-- MIGRATION: Add installment support to transactions
-- Run this AFTER the initial supabase-schema.sql
-- ============================================

-- Add installment columns to transactions table
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS installment_group_id UUID,
  ADD COLUMN IF NOT EXISTS installment_number INTEGER,
  ADD COLUMN IF NOT EXISTS total_installments INTEGER;

-- Index for querying installments by group
CREATE INDEX IF NOT EXISTS idx_transactions_installment_group
  ON transactions(installment_group_id);
