import { notFound, redirect } from "next/navigation";
import { UnitFourActivity } from "@/components/unit-four-activity";
import { getUnitFourInteraction, UNIT_FOUR_INTERACTIONS } from "@/lib/curriculum";
import { getUnitFourEvidence } from "@/lib/server/unit-four";
import { getConfiguredUnitInteractions } from "@/lib/server/program";
import { UNIT_FOUR_CONTENT } from "@/lib/unit-four-content";

export const dynamic = "force-dynamic";

export default async function UnitFourActivityPage({ params }: { params: Promise<{ interactionId: string }> }) {
  const { interactionId } = await params; const staticInteraction = getUnitFourInteraction(interactionId); const configured = await getConfiguredUnitInteractions("unit-04", UNIT_FOUR_INTERACTIONS); const interaction = configured.find((item) => item.id === staticInteraction?.id); const content = UNIT_FOUR_CONTENT[interactionId]; if (!interaction || !content) notFound();
  const evidence = await getUnitFourEvidence(); const completed = new Set(evidence.completedInteractionIds); const sequence = configured.filter((item) => item.main === interaction.main && (item.main || item.section === interaction.section)); const index = sequence.findIndex((item) => item.id === interaction.id);
  if (!sequence.slice(0, index).every((item) => completed.has(item.id))) redirect("/student/unit-04");
  return <UnitFourActivity content={content} evidence={evidence} interaction={interaction} nextRoute={sequence[index + 1]?.route ?? "/student/unit-04"} />;
}
