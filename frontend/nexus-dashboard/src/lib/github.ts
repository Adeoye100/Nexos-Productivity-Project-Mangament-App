import { decrypt } from "@/lib/encryption";

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  labels: { name: string; color: string }[];
  updated_at: string;
  pull_request?: any;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      date: string;
      name: string;
    };
    message: string;
  };
}

export interface ParsedGitHubRef {
  owner: string;
  repo: string;
  number: number;
  raw: string;
}

export type GitHubRefStatus = "open" | "closed" | "merged";

/** Loose format: owner/repo#number */
export const GITHUB_REF_PATTERN = /^[\w.-]+\/[\w.-]+#\d+$/;

export function isValidGitHubRef(ref: string): boolean {
  return GITHUB_REF_PATTERN.test(ref.trim());
}

export function parseGitHubRef(ref: string): ParsedGitHubRef | null {
  const trimmed = ref.trim();
  if (!isValidGitHubRef(trimmed)) return null;
  const [ownerRepo, num] = trimmed.split("#");
  const [owner, repo] = ownerRepo.split("/");
  return {
    owner,
    repo,
    number: Number(num),
    raw: trimmed,
  };
}

/** Short label for badges, e.g. "repo#42" */
export function formatGitHubRefShort(ref: string): string {
  const parsed = parseGitHubRef(ref);
  if (!parsed) return ref;
  return `${parsed.repo}#${parsed.number}`;
}

export const GITHUB_LABEL_MAPPING: Record<string, { category: string; icon?: string }> = {
  bug: { category: "Work", icon: "bug" },
  enhancement: { category: "Feature", icon: "zap" },
  documentation: { category: "Docs", icon: "book" },
  question: { category: "Help", icon: "help-circle" },
  "good first issue": { category: "Work", icon: "star" },
};

export async function fetchGitHubIssues(token: string, repo: string): Promise<GitHubIssue[]> {
  const response = await fetch(`https://api.github.com/repos/${repo}/issues?state=open&sort=updated&per_page=100`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchGitHubCommits(token: string, repo: string): Promise<GitHubCommit[]> {
  const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=30`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check whether a PR/issue ref is still open, closed, or merged.
 * Reuses the same PAT from getGitHubConfig() — no separate auth path.
 * Safe to call from polling, a manual button, or (later) a webhook trigger.
 */
export async function checkPRStatus(ref: string): Promise<GitHubRefStatus> {
  const parsed = parseGitHubRef(ref);
  if (!parsed) {
    throw new Error("Invalid GitHub ref format (expected owner/repo#number)");
  }

  const config = getGitHubConfig();
  if (!config?.token) {
    throw new Error("GitHub is not connected. Add a token in Settings.");
  }

  const headers = {
    Authorization: `token ${config.token}`,
    Accept: "application/vnd.github.v3+json",
  };

  // Prefer the pulls endpoint so we can distinguish merged vs closed-without-merge
  const prRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`,
    { headers },
  );

  if (prRes.ok) {
    const pr = (await prRes.json()) as { state: string; merged: boolean };
    if (pr.merged) return "merged";
    if (pr.state === "closed") return "closed";
    return "open";
  }

  if (prRes.status !== 404) {
    throw new Error(`GitHub API error: ${prRes.statusText}`);
  }

  // Not a PR — treat as an issue
  const issueRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues/${parsed.number}`,
    { headers },
  );

  if (!issueRes.ok) {
    throw new Error(
      issueRes.status === 404
        ? `GitHub ref not found: ${parsed.raw}`
        : `GitHub API error: ${issueRes.statusText}`,
    );
  }

  const issue = (await issueRes.json()) as { state: string };
  return issue.state === "closed" ? "closed" : "open";
}

export function getGitHubConfig() {
  const encryptedToken = localStorage.getItem("github_token");
  const repo = localStorage.getItem("github_repo");
  
  if (!encryptedToken || !repo) return null;
  
  return {
    token: decrypt(encryptedToken),
    repo,
  };
}
