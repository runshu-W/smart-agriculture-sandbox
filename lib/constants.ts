export const DEMO = {
  studentId: process.env.DEMO_STUDENT_ID ?? "demo-student",
  teacherId: process.env.DEMO_TEACHER_ID ?? "demo-teacher",
  classId: "class-2026-a",
  unitId: "unit-01",
  taskId: "u01-task-traditional-hall",
  interactionId: "u01-trad-02-thresher",
} as const;

export const THRESHER_TARGET_MS = 10_000;
export const THRESHER_CORRECT_ANSWER = "B";
