import { PlowExperience } from "@/components/plow-experience";
import { redirect } from "next/navigation";
import { hasEnteredUnitOne } from "@/lib/server/unit-one";
import { ManagedQuestionsProvider } from "@/components/managed-questions-provider";

export const dynamic = "force-dynamic";

export default async function PlowPage() { if (!await hasEnteredUnitOne()) redirect("/student/unit-01/entry"); return <ManagedQuestionsProvider interactionId="u01-trad-01-plow"><PlowExperience /></ManagedQuestionsProvider>; }
