// The defense interview script (docs/research/verification.md section 3.1).
// Pure data: shared by the server pages and the client room.
import type { InterviewSection } from "@/lib/db/enums";

export type ScriptSection = {
  section: InterviewSection;
  title: string;
  /** Planned length in minutes, shown as text. */
  plannedMin: number;
  tests: string;
  prompts: string[];
  /** Anchor text for scores 1 to 4, lowest first. */
  anchors: [string, string, string, string];
};

export const SCRIPT: ScriptSection[] = [
  {
    section: "WALKTHROUGH",
    title: "walkthrough",
    plannedMin: 12,
    tests: "ownership and product thinking",
    prompts: [
      "ask for a short demo of the running app.",
      "ask the candidate to tour the part of the code they know best.",
      "pick 2 entries from DECISIONS.md and ask what they considered and why they chose it.",
      "ask what the AI suggested and what they kept or changed.",
    ],
    anchors: [
      "could not explain how the main parts fit together.",
      "explained some parts, with gaps or prompting.",
      "explained the code and the 2 decisions clearly.",
      "explained clearly, named the tradeoffs and what they would change.",
    ],
  },
  {
    section: "WHAT_BREAKS_IF",
    title: "what breaks if",
    plannedMin: 10,
    tests: "real understanding of their own design",
    prompts: [
      "what breaks if the API returns an empty list?",
      "what breaks if two users save at once?",
      "what breaks if this table has a million rows?",
      "ask one of your own about a part of their design that looks fragile. answers are verbal only.",
    ],
    anchors: [
      "could not predict what their code would do.",
      "predicted the obvious cases, missed the rest.",
      "traced each case through their code correctly.",
      "traced each case and proposed a sound fix without prompting.",
    ],
  },
  {
    section: "LIVE_CHANGE",
    title: "live change",
    plannedMin: 15,
    tests: "building and AI judgment under observation",
    prompts: [
      "give the company's small feature request, in the candidate's codebase.",
      "AI is allowed. watch how they prompt and how they check the output.",
      "ask them to explain the change before they run it.",
    ],
    anchors: [
      "did not reach a working change.",
      "reached a partial change or accepted output without checking it.",
      "made a working change and checked it.",
      "made a clean working change, checked it, and explained each step.",
    ],
  },
  {
    section: "PLANTED_BUG",
    title: "planted bug",
    plannedMin: 15,
    tests: "debugging and reading code",
    prompts: [
      "report the symptom from the prep notes, never the cause.",
      "let them find and fix it. AI is allowed.",
      "ask them to explain the cause. score the explanation and the reasoning path.",
    ],
    anchors: [
      "did not find the bug.",
      "found it with heavy hints or could not explain the cause.",
      "found, fixed and explained the cause.",
      "found it quickly by reasoning, fixed it, and named how to prevent it.",
    ],
  },
  {
    section: "PRODUCT",
    title: "product questions",
    plannedMin: 13,
    tests: "product judgment and skill transfer",
    prompts: [
      "who is this for, and which problem did they choose to solve?",
      "what would they build next, and what would they cut?",
      "how would they know it works for real people?",
      "keep the last 5 minutes for the candidate's own questions.",
    ],
    anchors: [
      "could not say who it is for or why.",
      "named a user, with a vague problem or next step.",
      "named a clear user, problem and next step.",
      "clear user and problem, with a concrete way to test it with real people.",
    ],
  },
];

export const MODEL_LABELS = { WE_RUN: "we run it", JOINT: "joint", COMPANY_RUN: "company runs it" } as const;
export const MODE_LABELS = { IN_PERSON: "in person", VIDEO: "video" } as const;
export const STATUS_LABELS = { SCHEDULED: "scheduled", IN_PROGRESS: "in progress", COMPLETED: "completed", CANCELLED: "cancelled" } as const;
export const OUTCOME_LABELS = { PASS: "defense passed", FAIL: "defense not passed" } as const;
export const REQUEST_STATUS_LABELS = { PENDING: "waiting", SCHEDULED: "scheduled", DECLINED: "declined" } as const;
