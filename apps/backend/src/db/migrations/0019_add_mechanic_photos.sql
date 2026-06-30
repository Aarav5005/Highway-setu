-- Migration: Add photos column to mechanic_profiles table

ALTER TABLE mechanic_profiles 
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';
