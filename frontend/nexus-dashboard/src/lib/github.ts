
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

export function getGitHubConfig() {
  const encryptedToken = localStorage.getItem("github_token");
  const repo = localStorage.getItem("github_repo");
  
  if (!encryptedToken || !repo) return null;
  
  return {
    token: decrypt(encryptedToken),
    repo,
  };
}
