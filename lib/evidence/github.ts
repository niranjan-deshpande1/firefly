// Repo evidence from the public GitHub API. Candidate code is never cloned or run; only metadata and commit lists are read.

export const REFRESH_COOLDOWN_MS = 10 * 60 * 1000;
const COMMIT_PAGE = 100;
const DETAIL_LIMIT = 20; // ponytail: per-commit stats cost one request each; 20 keeps an unauthenticated refresh under the 60/hour limit.
const NAME = /^[A-Za-z0-9_.-]{1,100}$/;

/** Accepts https://github.com/owner/name (optionally .git or a trailing path); anything else is null. */
export function parseRepoUrl(url: string | null | undefined): { owner: string; name: string } | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || !["github.com", "www.github.com"].includes(parsed.hostname)) return null;
  const [owner, rawName] = parsed.pathname.split("/").filter(Boolean);
  const name = rawName?.replace(/\.git$/, "");
  if (!owner || !name || !NAME.test(owner) || !NAME.test(name) || name === "." || name === "..") return null;
  return { owner, name };
}

/** A refresh is refused within the cooldown of the last live fetch. */
export function canRefresh(lastFetchedAt: Date | null | undefined, now = new Date()): boolean {
  return !lastFetchedAt || now.getTime() - lastFetchedAt.getTime() >= REFRESH_COOLDOWN_MS;
}

export type FetchedCommit = {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string | null;
  committedAt: Date;
  additions: number;
  deletions: number;
  filesChanged: number;
  url: string;
};

export type FetchedRepo = { defaultBranch: string; headSha: string | null; commits: FetchedCommit[] };

/** Reads public repo metadata and recent commits. Throws on any API failure; the caller keeps existing data. */
export async function fetchRepo(owner: string, name: string): Promise<FetchedRepo> {
  const { Octokit } = await import("@octokit/rest");
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined, request: { timeout: 10_000 } });
  const { data: repo } = await octokit.rest.repos.get({ owner, repo: name });
  const { data: list } = await octokit.rest.repos.listCommits({ owner, repo: name, sha: repo.default_branch, per_page: COMMIT_PAGE });
  const details = await Promise.all(
    list.slice(0, DETAIL_LIMIT).map((c) =>
      octokit.rest.repos
        .getCommit({ owner, repo: name, ref: c.sha })
        .then((r) => r.data)
        .catch(() => null),
    ),
  );
  const commits = list.map((c, i): FetchedCommit => {
    const detail = details[i];
    return {
      sha: c.sha,
      message: c.commit.message.slice(0, 2000),
      authorName: (c.commit.author?.name ?? c.author?.login ?? "unknown").slice(0, 200),
      authorEmail: c.commit.author?.email ?? null,
      committedAt: new Date(c.commit.author?.date ?? c.commit.committer?.date ?? Date.now()),
      additions: detail?.stats?.additions ?? 0,
      deletions: detail?.stats?.deletions ?? 0,
      filesChanged: detail?.files?.length ?? 0,
      url: c.html_url,
    };
  });
  return { defaultBranch: repo.default_branch, headSha: list[0]?.sha ?? null, commits };
}
