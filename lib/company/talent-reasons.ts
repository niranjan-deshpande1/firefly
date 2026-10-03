// Public-fact reasons for the talent pool (manual 12.2: "public-fact reasons and no score"). Pure.

const MAX_TOOLS = 5;

export function talentReasons(facts: {
  hackathons: string[];
  verifiedCount: number;
  skills: string[];
  builtWith: string[];
  location: string | null;
}): string[] {
  const reasons: string[] = [];
  const hackathons = [...new Set(facts.hackathons)];
  if (hackathons.length) reasons.push(`finished ${hackathons.join(", ")}`);
  if (facts.verifiedCount > 0) reasons.push(facts.verifiedCount === 1 ? "1 verified project" : `${facts.verifiedCount} verified projects`);
  const tools = [...new Set([...facts.builtWith, ...facts.skills])].slice(0, MAX_TOOLS);
  if (tools.length) reasons.push(`built with ${tools.join(", ")}`);
  if (facts.location) reasons.push(`based in ${facts.location}`);
  return reasons;
}
