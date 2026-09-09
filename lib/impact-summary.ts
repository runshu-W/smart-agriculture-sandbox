import { IMPACT_REGIONS, type ImpactObservation, type ImpactRegion } from "./classroom-impact";
export type ImpactPerson = { id: string; name: string; synced: boolean; entryMs: number; observations: ImpactObservation[] };
export type ImpactDetail = { id: string; name: string; synced: boolean; sample: boolean; emotion: number | null; waitSeconds: number | null; waiting: boolean; lowerBound: boolean; repeatClicks: number; switches: number; order: ImpactRegion[]; dwell: Record<ImpactRegion, number>; concerns: ImpactRegion[] };
export type ImpactSummary = { closed: boolean; total: number; uploaded: number; missing: number; samples: number; average: number | null; waitRate: number | null; waiting: number; top: Array<{ region: ImpactRegion; label: string; count: number; percent: number }>; details?: ImpactDetail[]; cutoffMs: number };
const regions = Object.keys(IMPACT_REGIONS) as ImpactRegion[];
function unionLength(intervals: Array<[number, number]>) {
  let total = 0, end = 0;
  for (const [start, stop] of intervals.sort((a, b) => a[0] - b[0])) { total += Math.max(0, stop - Math.max(start, end)); end = Math.max(end, stop); }
  return total;
}
export function summarizeImpact(people: ImpactPerson[], cutoffMs: number, closed: boolean, includeDetails: boolean): ImpactSummary {
  const details = people.map(person => {
    const observations = person.observations.filter(item => regions.includes(item.region) && item.atMs >= person.entryMs && item.atMs <= cutoffMs && item.durationMs >= 0);
    const views = observations.filter(item => item.kind === "view").sort((a, b) => a.atMs - b.atMs);
    const start = Math.max(26000, person.entryMs);
    const first = views.find(item => item.atMs >= start);
    const windowMs = Math.max(0, cutoffMs - start);
    const sample = closed && person.synced && (first !== undefined || windowMs > 5000);
    const wait = first ? first.atMs - start : windowMs;
    const repeatClicks = views.reduce((n, item, i) => n + (i > 0 && item.region === views[i - 1].region && item.atMs - views[i - 1].atMs <= 1000 ? 1 : 0), 0);
    const switches = views.reduce((n, item, i) => n + (i > 0 && item.region !== views[i - 1].region ? 1 : 0), 0);
    const dwell = Object.fromEntries(regions.map(region => [region, unionLength(observations.filter(item => item.kind === "dwell" && item.region === region).map(item => [Math.max(person.entryMs, item.atMs - item.durationMs), item.atMs])) / 1000])) as Record<ImpactRegion, number>;
    const concerns = regions.filter(region => views.some(item => item.region === region) || dwell[region] > 0);
    return { id: person.id, name: person.name, synced: person.synced, sample, emotion: sample ? Math.round(Math.min(10, 1 + Math.min(3, repeatClicks * .5) + Math.min(3, switches * .3) + Math.min(3, wait / 5000)) * 10) / 10 : null,
      waitSeconds: sample ? wait / 1000 : null, waiting: sample && wait > 5000, lowerBound: !first, repeatClicks, switches, order: views.map(item => item.region), dwell, concerns };
  });
  const uploaded = details.filter(item => item.synced), samples = details.filter(item => item.sample), waiting = samples.filter(item => item.waiting).length;
  return { closed, total: people.length, uploaded: uploaded.length, missing: people.length - uploaded.length, samples: samples.length,
    average: samples.length ? Math.round(samples.reduce((sum, item) => sum + item.emotion!, 0) / samples.length * 10) / 10 : null,
    waitRate: samples.length ? Math.round(waiting / samples.length * 100) : null, waiting,
    top: regions.map(region => { const count = uploaded.filter(item => item.concerns.includes(region)).length; return { region, label: IMPACT_REGIONS[region], count, percent: uploaded.length ? Math.round(count / uploaded.length * 100) : 0 }; }).sort((a, b) => b.count - a.count).slice(0, 3),
    cutoffMs, ...(includeDetails ? { details } : {}) };
}
