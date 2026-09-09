-- Extend the shared learning-event vocabulary for full Unit 1 workflows.
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'TASK_COMPLETED';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'UNIT_COMPLETED';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'CONTENT_SUBMITTED';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'MEDIA_PROGRESSED';

-- Keep student-authored content out of event payloads while retaining it on the attempt.
ALTER TABLE "Attempt" ADD COLUMN IF NOT EXISTS "privateContent" JSONB;
