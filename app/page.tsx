import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const actor = await getCurrentActor();
  if (!actor) redirect("/student-login");
  redirect(actor.role === "TEACHER" ? "/teacher/dashboard" : "/student");
}
