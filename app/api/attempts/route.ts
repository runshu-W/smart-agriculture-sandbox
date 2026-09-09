import { NextResponse } from "next/server";
import { startThresherAttempt } from "@/lib/server/learning";

export async function POST() {
  return NextResponse.json(await startThresherAttempt(), { status: 201 });
}
