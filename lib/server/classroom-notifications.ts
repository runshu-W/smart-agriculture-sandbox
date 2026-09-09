import "server-only";
import { EventEmitter } from "node:events";
const globalHub = globalThis as unknown as { classroomHub?: EventEmitter };
export const classroomHub = globalHub.classroomHub ??= new EventEmitter().setMaxListeners(200);
// Only a lesson identifier is broadcast. Each connection rebuilds its authorized view.
export function notifyClassroom(id: string) { classroomHub.emit(id); }
