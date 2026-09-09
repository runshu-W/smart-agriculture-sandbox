import { notFound, redirect } from "next/navigation";
import { UnitFiveActivity } from "@/components/unit-five-activity";
import { getUnitFiveInteraction, UNIT_FIVE_INTERACTIONS } from "@/lib/curriculum";
import { getUnitFiveEvidence } from "@/lib/server/unit-five";
import { getConfiguredUnitInteractions } from "@/lib/server/program";
import { UNIT_FIVE_CONTENT } from "@/lib/unit-five-content";

export const dynamic = "force-dynamic";

export default async function UnitFiveActivityPage({ params }: { params: Promise<{ interactionId: string }> }) {
  const { interactionId } = await params; const staticInteraction = getUnitFiveInteraction(interactionId); const configured = await getConfiguredUnitInteractions("unit-05", UNIT_FIVE_INTERACTIONS); const interaction = configured.find((item) => item.id === staticInteraction?.id); const content = UNIT_FIVE_CONTENT[interactionId]; if (!interaction || !content) notFound();
  const evidence = await getUnitFiveEvidence(); const completed = new Set(evidence.completedInteractionIds); const sequence = configured.filter((item) => item.main === interaction.main && (item.main || item.section === interaction.section)); const index = sequence.findIndex((item) => item.id === interaction.id);
  if (!sequence.slice(0, index).every((item) => completed.has(item.id))) redirect("/student/unit-05");
  return <UnitFiveActivity content={content} evidence={evidence} interaction={interaction} nextRoute={sequence[index + 1]?.route ?? "/student/unit-05"} />;
}
