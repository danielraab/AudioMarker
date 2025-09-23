-- Add soft delete support to Audio model
ALTER TABLE "Audio" ADD COLUMN "deletedAt" DATETIME;