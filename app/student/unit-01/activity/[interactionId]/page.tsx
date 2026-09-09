import { notFound, redirect } from "next/navigation";
import { UnitOneActivity } from "@/components/unit-one-activity";
import { getUnitOneInteraction, UNIT_ONE_INTERACTIONS } from "@/lib/curriculum";
import { getUnitOneEvidence } from "@/lib/server/unit-one";
import { getConfiguredUnitInteractions } from "@/lib/server/program";
import { ACTIVITY_CONTENT } from "@/lib/unit-one-content";

export const dynamic = "force-dynamic";

export default async function UnitOneActivityPage({ params }: { params: Promise<{ interactionId: string }> }) {
  const { interactionId } = await params;
  const staticInteraction = getUnitOneInteraction(interactionId);
  const configured = await getConfiguredUnitInteractions("unit-01", UNIT_ONE_INTERACTIONS);
  const interaction = configured.find((item) => item.id === staticInteraction?.id);
  const content = ACTIVITY_CONTENT[interactionId];
  if (!interaction || !content) notFound();
  const evidence = await getUnitOneEvidence();
  const completed = new Set(evidence.completedInteractionIds);
  const sequence = configured.filter((item) => item.main === interaction.main && (item.main || item.section === interaction.section));
  const index = sequence.findIndex((item) => item.id === interaction.id);
  if (interaction.main) {
    const sectionStart = sequence.findIndex((item) => item.section === interaction.section);
    const prerequisites = sequence.slice(0, sectionStart);
    if (!prerequisites.every((item) => completed.has(item.id))) redirect("/student/unit-01");
  } else {
    const prerequisites = sequence.slice(0, index);
    const mainRequired = interaction.id === "u01-impression-03-compare" && !configured.filter((item) => item.main).every((item) => completed.has(item.id));
    if (mainRequired || !prerequisites.every((item) => completed.has(item.id))) redirect("/student/unit-01");
  }
  const nextRoute = sequence[index + 1]?.route ?? "/student/unit-01";
  return <UnitOneActivity content={content} evidence={evidence} interaction={interaction} nextRoute={nextRoute} />;
}
