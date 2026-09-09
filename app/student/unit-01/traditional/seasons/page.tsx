import { SeasonsExperience } from "@/components/seasons-experience";
import { redirect } from "next/navigation";
import { hasEnteredUnitOne } from "@/lib/server/unit-one";
import { ManagedQuestionsProvider } from "@/components/managed-questions-provider";

export const dynamic = "force-dynamic";

export default async function SeasonsPage() { if (!await hasEnteredUnitOne()) redirect("/student/unit-01/entry"); return <ManagedQuestionsProvider interactionId="u01-trad-03-seasons"><SeasonsExperience /></ManagedQuestionsProvider>; }
