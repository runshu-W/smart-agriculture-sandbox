ALTER TYPE "EventType" ADD VALUE 'DECISION_RECORDED';
ALTER TABLE "LiveLesson"
  ADD COLUMN "decisionStartedAt" TIMESTAMP(3),
  ADD COLUMN "decisionRunningSince" TIMESTAMP(3),
  ADD COLUMN "decisionElapsedMs" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "decisionClosedAt" TIMESTAMP(3),
  ADD COLUMN "decisionCloseReason" TEXT;
ALTER TABLE "LessonPresence"
  ADD COLUMN "decisionEnteredAt" TIMESTAMP(3),
  ADD COLUMN "decisionChoice" TEXT,
  ADD COLUMN "decisionSubmittedAt" TIMESTAMP(3),
  ADD COLUMN "decisionElapsedMs" INTEGER,
  ADD COLUMN "decisionReason" TEXT,
  ADD COLUMN "decisionTrace" JSONB;
