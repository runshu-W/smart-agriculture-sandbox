import { NextResponse } from "next/server";
import { logout } from "@/lib/server/auth";

export async function POST(request: Request) {
  await logout();
  const portal = new URL(request.url).searchParams.get("portal");
  return NextResponse.redirect(new URL(portal === "teacher" ? "/teacher-login" : "/student-login", request.url), 303);
}
