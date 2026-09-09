import { ThresherExperience } from "@/components/thresher-experience";
import { redirect } from "next/navigation";
import { hasEnteredUnitOne } from "@/lib/server/unit-one";
import { ManagedQuestionsProvider } from "@/components/managed-questions-provider";

export const dynamic = "force-dynamic";

export default async function ThresherPage() {
  if (!await hasEnteredUnitOne()) redirect("/student/unit-01/entry");
  return <ManagedQuestionsProvider interactionId="u01-trad-02-thresher"><ThresherExperience /></ManagedQuestionsProvider>;
}
