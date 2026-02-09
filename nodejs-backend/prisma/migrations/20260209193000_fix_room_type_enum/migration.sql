-- Ensure enum has required values
ALTER TYPE "type_enum" ADD VALUE IF NOT EXISTS 'SINGLE';
ALTER TYPE "type_enum" ADD VALUE IF NOT EXISTS 'COMBINED';

-- Convert room.type from room_type_enum to type_enum
ALTER TABLE "room"
  ALTER COLUMN "type" TYPE "type_enum"
  USING "type"::text::"type_enum";
