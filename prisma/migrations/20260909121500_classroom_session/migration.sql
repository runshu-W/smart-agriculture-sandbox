-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('WAITING', 'RUNNING', 'PAUSED', 'ENDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'CLASSROOM_JOINED';
ALTER TYPE "EventType" ADD VALUE 'CLASSROOM_READY';

-- AlterTable
ALTER TABLE "LearningEvent" ADD COLUMN     "liveLessonId" TEXT;

-- CreateTable
CREATE TABLE "LiveLesson" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "rehearsal" BOOLEAN NOT NULL DEFAULT true,
    "status" "LessonStatus" NOT NULL DEFAULT 'WAITING',
    "stage" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 420000,
    "remainingMs" INTEGER NOT NULL DEFAULT 420000,
    "deadline" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "LiveLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPresence" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "learningSessionId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readyAt" TIMESTAMP(3),

    CONSTRAINT "LessonPresence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiveLesson_classId_createdAt_idx" ON "LiveLesson"("classId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LessonPresence_learningSessionId_key" ON "LessonPresence"("learningSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonPresence_lessonId_studentId_key" ON "LessonPresence"("lessonId", "studentId");

-- AddForeignKey
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_liveLessonId_fkey" FOREIGN KEY ("liveLessonId") REFERENCES "LiveLesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveLesson" ADD CONSTRAINT "LiveLesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveLesson" ADD CONSTRAINT "LiveLesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPresence" ADD CONSTRAINT "LessonPresence_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LiveLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPresence" ADD CONSTRAINT "LessonPresence_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPresence" ADD CONSTRAINT "LessonPresence_learningSessionId_fkey" FOREIGN KEY ("learningSessionId") REFERENCES "LearningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "LiveLesson_one_open_per_class" ON "LiveLesson"("classId") WHERE "endedAt" IS NULL;
