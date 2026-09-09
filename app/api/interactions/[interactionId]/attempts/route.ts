import { NextResponse } from "next/server";
import { startSimpleInteraction } from "@/lib/server/simple-interaction";

export async function POST(request: Request, { params }: { params: Promise<{ interactionId: string }> }) {
  const { interactionId } = await params;
  const entry = new URL(request.url).searchParams.get("entry") ?? "unit-map";
  try {
    return NextResponse.json(await startSimpleInteraction(interactionId, entry), { status: 201 });
  } catch {
    return NextResponse.json({ error: "互动点不可用" }, { status: 404 });
  }
}
