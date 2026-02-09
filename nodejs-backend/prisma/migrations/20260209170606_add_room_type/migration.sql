-- ensure enum has required values
ALTER TYPE "type_enum" ADD VALUE IF NOT EXISTS 'SINGLE';
ALTER TYPE "type_enum" ADD VALUE IF NOT EXISTS 'COMBINED';

-- add column to room
ALTER TABLE "room"
  ADD COLUMN IF NOT EXISTS "type" "type_enum" NOT NULL DEFAULT 'SINGLE';
