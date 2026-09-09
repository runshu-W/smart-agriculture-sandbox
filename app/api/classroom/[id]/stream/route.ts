import { AsyncResource } from "node:async_hooks";
import { classroomHub } from "@/lib/server/classroom-notifications";
import { classroomHttpError, classroomSnapshot } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = new URL(request.url).searchParams.get("view");
  if (view !== "teacher" && view !== "student" && view !== "screen") return Response.json({ error: "无效视图" }, { status: 400 });
  try {
    const initial = await classroomSnapshot(id, view);
    const encoder = new TextEncoder();
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cleanup = () => {};
    const stream = new ReadableStream({
      start(controller) {
        let busy = false, queued = false;
        let invalidate = () => {};
        const close = () => { if (stopped) return; stopped = true; clearTimeout(timer); classroomHub.off(id, invalidate); request.signal.removeEventListener("abort", close); try { controller.close(); } catch {} };
        cleanup = close;
        request.signal.addEventListener("abort", close, { once: true });
        const startedAt = Date.now();
        controller.enqueue(encoder.encode(`retry: 1000\ndata: ${JSON.stringify(initial)}\n\n`));
        const send = async () => {
          if (stopped) return;
          if (busy) { queued = true; return; }
          busy = true; clearTimeout(timer);
          try {
            const snapshot = await classroomSnapshot(id, view);
            if (stopped) return;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`));
            if (Date.now() - startedAt > 25_000) { close(); return; }
          } catch { close(); return; }
          finally { busy = false; }
          const immediate = queued; queued = false;
          timer = setTimeout(send, immediate ? 0 : 1000);
        };
        // Bind the original request context so another student’s notification cannot change cookies/auth.
        invalidate = AsyncResource.bind(() => { void send(); });
        classroomHub.on(id, invalidate);
        if (request.signal.aborted) close(); else timer = setTimeout(send, 1000);
      },
      cancel() { cleanup(); },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no", Connection: "keep-alive" } });
  } catch (error) { return classroomHttpError(error); }
}
