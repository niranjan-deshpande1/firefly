// Rubric v0 from docs/research/evaluation.md section 3: six dimensions, anchored 1 to 4.
import { json, prisma } from "./util";

export const RUBRIC_KEYS = ["A", "B", "C", "D", "E", "F"] as const;
export type RubricKey = (typeof RUBRIC_KEYS)[number];
export const dimensionId = (key: RubricKey) => `dim-${key}`;

const DIMENSIONS: { key: RubricKey; name: string; description: string; anchors: string[]; isGate?: boolean }[] = [
  {
    key: "A",
    name: "comprehension and ownership",
    description: "Understands and can explain the code they shipped. Sources: defense walkthrough, prediction questions.",
    anchors: [
      "Cannot say what the main request handler does; reads code aloud without explaining it.",
      "Explains the happy path; stalls on \"what if the input is empty\" and says \"the AI handled that\".",
      "Explains the main flow and two edge cases; correctly predicts one of two change outcomes.",
      "Explains flow, edge cases and why the AI's first version was changed; predicts both outcomes and names a side effect we did not ask about.",
    ],
  },
  {
    key: "B",
    name: "verification and handling AI errors",
    description: "Checks AI output and catches its mistakes. Sources: AI transcript, decision log, tests, commits, defense follow-up.",
    anchors: [
      "No tests; accepts every AI suggestion; cannot name any time the AI was wrong.",
      "Some AI-generated tests that only check happy paths; names an AI error only in general terms.",
      "Tests cover the riskiest logic; decision log names one AI error with a specific reason, and they can show it in the code.",
      "Shows a habit: asks the AI for tests first or checks output against a spec; names several caught errors, including a subtle one.",
    ],
  },
  {
    key: "C",
    name: "debugging",
    description: "Finds and fixes a planted bug with AI allowed. Source: planted bug in the defense.",
    anchors: [
      "Does not find the bug in 10 minutes even with a hint.",
      "Finds it by pasting errors into the AI repeatedly; cannot explain the cause after the fix.",
      "Reproduces the bug, narrows it to the right file, fixes it, and explains the cause.",
      "Forms a guess before touching the AI, confirms it, fixes it, and adds a test or names how to stop it from coming back.",
    ],
  },
  {
    key: "D",
    name: "technical decisions and tradeoffs",
    description: "Names alternatives, reasons and accepted downsides. Sources: decision log, defense questions.",
    anchors: [
      "Cannot say why they chose the stack or data model beyond \"the AI picked it\".",
      "Gives a reason for one choice; cannot name a downside or an alternative.",
      "For two decisions, names the alternative, the reason, and a downside they accepted.",
      "As level 3, plus says what would make them reverse a decision.",
    ],
  },
  {
    key: "E",
    name: "problem framing and product judgment",
    description: "Connects the build to a user and cuts scope on purpose. Sources: day-3 plan, README, demo video, defense.",
    anchors: [
      "Builds features with no link to the user in the brief; cannot say who it is for.",
      "Names the user; scope is a feature list with no cuts.",
      "Names the user and their main problem; cut at least one feature on purpose and can say why.",
      "As level 3, plus changed direction mid-build based on something learned and can say what they would measure next.",
    ],
  },
  {
    key: "F",
    name: "working output",
    description: "Runs from the README and meets the brief. A gate: 2 or higher to reach the defense. Sources: repo, README, demo video.",
    anchors: [
      "Does not run from the README.",
      "Runs; core flow works with visible bugs.",
      "Core flow works; brief requirements met.",
      "Works, handles bad input, and a reviewer could extend it without asking questions.",
    ],
    isGate: true,
  },
];

export async function seedRubric() {
  for (const [i, d] of DIMENSIONS.entries()) {
    await prisma.rubricDimension.create({
      data: {
        id: dimensionId(d.key),
        key: d.key,
        name: d.name,
        description: d.description,
        anchors: json(d.anchors.map((text, level) => ({ level: level + 1, text }))),
        universal: true,
        isGate: d.isGate ?? false,
        sortOrder: i,
      },
    });
  }
}
