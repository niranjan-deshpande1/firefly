// Consent screen copy for builders. Product copy, plain and lowercase.
// NEEDS LAWYER REVIEW before any real cohort (brief section 9): collection list, audiences, retention, rights.
// Bump CONSENT_VERSION in lib/profiles whenever this text changes.

const COLLECTED = [
  "your profile: name, username, headline, bio, skills, links, location, school and experience level",
  "the projects you post, with their story, images, links and team",
  "the commit history of repos you connect",
  "AI transcripts you choose to upload",
  "your weekly check-ins and decision logs",
  "notes interviewers write during your project defense",
];

const AUDIENCES = [
  "reviewers and interviewers assigned to your project see your project, evidence and check-ins. reviewers see a code like candidate 7F3A, not your name, until their review is in.",
  "a company sees your report and evidence only when you are on the shortlist for one of its roles.",
  "companies browsing the talent pool see you only if you opt in. you can turn that on or off in settings.",
  "your public profile shows your posted projects, hackathons and wins. you can hide it from everyone but yourself and firefly admins.",
  "firefly admins can see everything, and every time someone other than you opens your report, evidence or transcripts, it is written to an audit log.",
];

export function ConsentCopy({ retentionMonths }: { retentionMonths: number }) {
  const rights = [
    "download everything we hold about you as a JSON file from settings.",
    "ask us to delete your account and data from settings. an admin handles each request.",
    "hide your profile or change what it shows at any time.",
    "stay out of the talent pool, which is off until you turn it on.",
  ];
  return (
    <div className="flex flex-col gap-8 measure">
      <section aria-labelledby="consent-collect" className="flex flex-col gap-3">
        <h2 id="consent-collect" className="type-display-4">what we collect</h2>
        <ul className="flex list-disc flex-col gap-2 ps-6 type-body">
          {COLLECTED.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>
      <section aria-labelledby="consent-who" className="flex flex-col gap-3">
        <h2 id="consent-who" className="type-display-4">who sees it</h2>
        <ul className="flex list-disc flex-col gap-2 ps-6 type-body">
          {AUDIENCES.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>
      <section aria-labelledby="consent-keep" className="flex flex-col gap-3">
        <h2 id="consent-keep" className="type-display-4">how long we keep it</h2>
        <p className="type-body">
          we keep the process evidence from each hackathon (commit history, AI transcripts, decision logs, check-ins and evidence summaries) for {retentionMonths} months after that hackathon ends, then delete it. if a company hires you from a project, we keep that project&apos;s evidence and your check-ins. your public profile, posted projects, reviews, interview notes and hiring decisions stay until you ask us to delete your data.
        </p>
      </section>
      <section aria-labelledby="consent-rights" className="flex flex-col gap-3">
        <h2 id="consent-rights" className="type-display-4">your rights</h2>
        <ul className="flex list-disc flex-col gap-2 ps-6 type-body">
          {rights.map((line) => <li key={line}>you can {line}</li>)}
        </ul>
        <p className="type-body text-secondary">people make every hiring decision on firefly. nothing here scores, ranks or rejects you automatically.</p>
      </section>
    </div>
  );
}
