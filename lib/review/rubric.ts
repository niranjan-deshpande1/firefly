// Rubric v0 from docs/research/evaluation.md section 3. The seed writes these rows into RubricDimension;
// the app always reads dimensions from the database.
export type RubricSeed = {
  key: string;
  name: string;
  description: string;
  anchors: { level: number; text: string }[];
  isGate: boolean;
  sortOrder: number;
};

const a = (...texts: string[]) => texts.map((text, i) => ({ level: i + 1, text }));

export const RUBRIC_V0: RubricSeed[] = [
  {
    key: "A",
    name: "comprehension and ownership",
    description: "sources: defense walkthrough, prediction questions.",
    anchors: a(
      "cannot say what the main request handler does; reads code aloud without explaining it.",
      "explains the happy path; stalls on \"what if the input is empty\" and says \"the AI handled that\".",
      "explains the main flow and two edge cases; correctly predicts one of two change outcomes.",
      "explains flow, edge cases and why the AI's first version was changed; predicts both outcomes and names a side effect we did not ask about.",
    ),
    isGate: false,
    sortOrder: 1,
  },
  {
    key: "B",
    name: "verification and handling AI errors",
    description: "sources: AI transcript, decision log, tests, commits, defense follow-up.",
    anchors: a(
      "no tests; accepts every AI suggestion; cannot name any time the AI was wrong.",
      "some AI-generated tests that only check happy paths; names an AI error only in general terms.",
      "tests cover the riskiest logic; decision log names one AI error with a specific reason, and they can show it in the code.",
      "shows a habit: asks the AI for tests first or checks output against a spec; names several caught errors, including a subtle one.",
    ),
    isGate: false,
    sortOrder: 2,
  },
  {
    key: "C",
    name: "debugging",
    description: "source: planted bug in the defense (AI allowed).",
    anchors: a(
      "does not find the bug in 10 minutes even with a hint.",
      "finds it by pasting errors into the AI repeatedly; cannot explain the cause after the fix.",
      "reproduces the bug, narrows it to the right file, fixes it, and explains the cause.",
      "forms a guess before touching the AI, confirms it, fixes it, and adds a test or names how to stop it from coming back.",
    ),
    isGate: false,
    sortOrder: 3,
  },
  {
    key: "D",
    name: "technical decisions and tradeoffs",
    description: "sources: decision log, defense questions.",
    anchors: a(
      "cannot say why they chose the stack or data model beyond \"the AI picked it\".",
      "gives a reason for one choice; cannot name a downside or an alternative.",
      "for two decisions, names the alternative, the reason, and a downside they accepted.",
      "as level 3, plus says what would make them reverse a decision.",
    ),
    isGate: false,
    sortOrder: 4,
  },
  {
    key: "E",
    name: "problem framing and product judgment",
    description: "sources: day-3 plan, README, demo video, defense.",
    anchors: a(
      "builds features with no link to the user in the brief; cannot say who it is for.",
      "names the user; scope is a feature list with no cuts.",
      "names the user and their main problem; cut at least one feature on purpose and can say why.",
      "as level 3, plus changed direction mid-build based on something learned and can say what they would measure next.",
    ),
    isGate: false,
    sortOrder: 5,
  },
  {
    key: "F",
    name: "working output",
    description: "sources: repo, README, demo video. a gate: 2 or higher to reach the defense.",
    anchors: a(
      "does not run from the README.",
      "runs; core flow works with visible bugs.",
      "core flow works; brief requirements met.",
      "works, handles bad input, and a reviewer could extend it without asking questions.",
    ),
    isGate: true,
    sortOrder: 6,
  },
];

/** Level meanings shared by all dimensions; used for role and judging criteria, which have no anchors of their own. */
export const GENERIC_ANCHORS = [
  "absent or wrong.",
  "partial or needs heavy prompting.",
  "solid for an early-career hire.",
  "would stand out among early-career hires.",
];
