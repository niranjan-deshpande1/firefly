import { z } from "zod";

// Allowed values for String-typed enum columns in prisma/schema.prisma.
export const USER_ROLES = ["CANDIDATE", "COMPANY", "ORGANIZER", "REVIEWER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const zUserRole = z.enum(USER_ROLES);

export const EXPERIENCE_LEVELS = ["STUDENT", "NEW_GRAD", "JUNIOR", "MID", "SENIOR"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const PROFILE_VISIBILITY = ["PUBLIC", "PLATFORM", "PRIVATE"] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITY)[number];

export const REMOTE_POLICIES = ["ONSITE", "HYBRID", "REMOTE"] as const;
export const ROLE_STATUSES = ["OPEN", "PAUSED", "FILLED", "CLOSED"] as const;

export const HACKATHON_TYPES = ["OPEN", "HIRING_COHORT"] as const;
export type HackathonType = (typeof HACKATHON_TYPES)[number];
export const HACKATHON_STATUSES = ["DRAFT", "UPCOMING", "OPEN", "JUDGING", "DEFENSE", "COMPLETED"] as const;
export type HackathonStatus = (typeof HACKATHON_STATUSES)[number];
export const EVENT_FORMATS = ["ONLINE", "IN_PERSON", "HYBRID"] as const;
export const TEAM_POLICIES = ["SOLO", "TEAMS_ALLOWED"] as const;
export const SCHEDULE_KINDS = ["MILESTONE", "KICKOFF", "CHECK_IN", "OFFICE_HOURS", "DEADLINE", "DEFENSE", "RESULTS", "EVENT"] as const;

export const REGISTRATION_STATUSES = ["REGISTERED", "WITHDRAWN", "SUBMITTED", "FINISHED"] as const;
export const INVITE_STATUSES = ["PENDING", "ACCEPTED", "DECLINED"] as const;
export const PROJECT_STATUSES = ["DRAFT", "SUBMITTED"] as const;
export const EVIDENCE_SOURCES = ["GITHUB", "SEED"] as const;

export const REVIEW_KINDS = ["RUBRIC", "JUDGING"] as const;
export type ReviewKind = (typeof REVIEW_KINDS)[number];
export const REVIEW_STATUSES = ["DRAFT", "SUBMITTED"] as const;
export const DECISION_OUTCOMES = ["ADVANCE", "HOLD", "REJECT"] as const;
export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

export const INTERVIEW_MODELS = ["WE_RUN", "JOINT", "COMPANY_RUN"] as const;
export const INTERVIEW_MODES = ["IN_PERSON", "VIDEO"] as const;
export const INTERVIEW_STATUSES = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export const INTERVIEW_OUTCOMES = ["PASS", "FAIL"] as const;
// Defense script sections, in order (docs/research/verification.md section 3.1).
export const INTERVIEW_SECTIONS = ["WALKTHROUGH", "WHAT_BREAKS_IF", "LIVE_CHANGE", "PLANTED_BUG", "PRODUCT", ] as const;
export type InterviewSection = (typeof INTERVIEW_SECTIONS)[number];

export const SHORTLIST_STATUSES = ["ACTIVE", "WITHDRAWN", "HIRED"] as const;
export const INTERVIEW_REQUEST_STATUSES = ["PENDING", "SCHEDULED", "DECLINED"] as const;
export const HIRE_STATUSES = ["REPORTED", "CONFIRMED", "LEFT"] as const;

export const INVOICE_TYPES = ["FLAT_FEE", "HIRE_FEE"] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];
export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const DATA_REQUEST_KINDS = ["EXPORT", "DELETE"] as const;
export const DATA_REQUEST_STATUSES = ["OPEN", "COMPLETED", "REJECTED"] as const;

export const FILE_KINDS = ["IMAGE", "TRANSCRIPT"] as const;
export type FileKind = (typeof FILE_KINDS)[number];

export const AUDIT_ACTIONS = [
  "REPORT_VIEW",
  "EVIDENCE_VIEW",
  "TRANSCRIPT_VIEW",
  "IDENTITY_REVEAL",
  "DECISION_MADE",
  "REVIEW_SUBMITTED",
  "INTERVIEW_COMPLETED",
  "HIRE_REPORTED",
  "INVOICE_CREATED",
  "INVOICE_SENT",
  "INVOICE_PAID",
  "ENROLLMENT_CREATED",
  "DATA_EXPORT",
  "DATA_REQUEST_CREATED",
  "DATA_REQUEST_RESOLVED",
  "SETTINGS_CHANGED",
  "COMMENT_HIDDEN",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
