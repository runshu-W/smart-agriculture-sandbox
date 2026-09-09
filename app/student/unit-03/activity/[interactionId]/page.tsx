import { notFound, redirect } from "next/navigation";
import { UnitThreeActivity } from "@/components/unit-three-activity";
import { getUnitThreeInteraction, UNIT_THREE_INTERACTIONS } from "@/lib/curriculum";
import { getUnitThreeEvidence } from "@/lib/server/unit-three";
import { getConfiguredUnitInteractions } from "@/lib/server/program";
import { UNIT_THREE_CONTENT } from "@/lib/unit-three-content";

export const dynamic = "force-dynamic";

export default async function UnitThreeActivityPage({ params }: { params: Promise<{ interactionId: string }> }) {
  const { interactionId } = await params;
  const staticInteraction = getUnitThreeInteraction(interactionId);
  const configured = await getConfiguredUnitInteractions("unit-03", UNIT_THREE_INTERACTIONS);
  const interaction = configured.find((item) => item.id === staticInteraction?.id);
  const content = UNIT_THREE_CONTENT[interactionId];
  if (!interaction || !content) notFound();
  const evidence = await getUnitThreeEvidence();
  const completed = new Set(evidence.completedInteractionIds);
  const sequence = configured.filter((item) => item.main === interaction.main && (item.main || item.section === interaction.section));
  const index = sequence.findIndex((item) => item.id === interaction.id);
  if (!sequence.slice(0, index).every((item) => completed.has(item.id))) redirect("/student/unit-03");
  const nextRoute = sequence[index + 1]?.route ?? "/student/unit-03";
  return <UnitThreeActivity content={content} evidence={evidence} interaction={interaction} nextRoute={nextRoute} />;
}
