import type { SessionData } from '../types';

const GITHUB_API = 'https://api.github.com';

interface GithubRequestOptions {
  method?: string;
  body?: unknown;
}

export async function githubFetch(
  path: string,
  pat: string,
  options: GithubRequestOptions = {}
): Promise<Response> {
  const { method = 'GET', body } = options;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${pat}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'sb-node-ui-worker',
  };

  const init: RequestInit = { method, headers };
  if (body) init.body = JSON.stringify(body);

  return fetch(`${GITHUB_API}${path}`, init);
}

export function repoFetch(
  endpoint: string,
  session: SessionData,
  options: GithubRequestOptions = {}
): Promise<Response> {
  const path = `/repos/${session.owner}/${session.repo}${endpoint ? '/' + endpoint : ''}`;
  return githubFetch(path, session.pat, options);
}

export function gistFetch(gistId: string, pat: string): Promise<Response> {
  return githubFetch(`/gists/${gistId}`, pat);
}

export function fetchUser(owner: string): Promise<Response> {
  return fetch(`${GITHUB_API}/users/${owner}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'sb-node-ui-worker',
    },
  });
}
