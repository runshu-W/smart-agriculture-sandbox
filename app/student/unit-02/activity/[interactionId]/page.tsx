import { notFound, redirect } from "next/navigation";
import { UnitTwoActivity } from "@/components/unit-two-activity";
import { getUnitTwoInteraction, UNIT_TWO_INTERACTIONS } from "@/lib/curriculum";
import { getUnitTwoEvidence } from "@/lib/server/unit-two";
import { getConfiguredUnitInteractions } from "@/lib/server/program";
import { UNIT_TWO_CONTENT } from "@/lib/unit-two-content";

export const dynamic = "force-dynamic";

export default async function UnitTwoActivityPage({ params }: { params: Promise<{ interactionId: string }> }) {
  const { interactionId } = await params;
  const staticInteraction = getUnitTwoInteraction(interactionId);
  const configured = await getConfiguredUnitInteractions("unit-02", UNIT_TWO_INTERACTIONS);
  const interaction = configured.find((item) => item.id === staticInteraction?.id);
  const content = UNIT_TWO_CONTENT[interactionId];
  if (!interaction || !content) notFound();
  const evidence = await getUnitTwoEvidence();
  const completed = new Set(evidence.completedInteractionIds);
  const sequence = configured.filter((item) => item.main === interaction.main && (item.main || item.section === interaction.section));
  const index = sequence.findIndex((item) => item.id === interaction.id);
  if (!sequence.slice(0, index).every((item) => completed.has(item.id))) redirect("/student/unit-02");
  const nextRoute = sequence[index + 1]?.route ?? "/student/unit-02";
  return <UnitTwoActivity content={content} evidence={evidence} interaction={interaction} nextRoute={nextRoute} />;
}
