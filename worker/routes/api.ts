import type { Env, SessionData } from '../types';
import { getSessionId, getSession, createSession, deleteSession } from '../lib/session';
import { repoFetch, gistFetch, fetchUser } from '../lib/github';
import { jsonResponse, errorResponse } from '../lib/security';

function decodeGithubContent(content: string): string {
  const cleaned = content.replace(/\n/g, '');
  const binary = atob(cleaned);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

async function requireSession(request: Request, env: Env): Promise<SessionData | Response> {
  const sid = getSessionId(request, env.COOKIE_NAME);
  if (!sid) return errorResponse('Not authenticated', 401);
  const session = await getSession(sid, env);
  if (!session) return errorResponse('Session expired', 401);
  return session;
}

export async function handleConnect(request: Request, env: Env): Promise<Response> {
  const { owner, repo, pat, gistId: providedGistId } = await request.json() as {
    owner: string; repo: string; pat: string; gistId?: string;
  };

  if (!owner || !repo || !pat) {
    return errorResponse('Missing required fields', 400);
  }

  const gistId = providedGistId || (await env.SESSIONS.get(`gist:${owner}/${repo}`)) || '';

  const tempSession = { owner, repo, pat, gistId, userLogin: '', userAvatar: '', createdAt: 0 };
  const ghRes = await repoFetch('contents/rules.json', tempSession);
  if (!ghRes.ok) {
    return errorResponse('GitHub authentication failed', 401);
  }

  const ghData = await ghRes.json() as { sha: string; content: string };
  const stateData = JSON.parse(decodeGithubContent(ghData.content));

  const userRes = await fetchUser(pat);
  let userLogin = owner;
  let userAvatar = '';
  if (userRes.ok) {
    const userData = await userRes.json() as { login: string; avatar_url: string };
    userLogin = userData.login;
    userAvatar = userData.avatar_url;
  }

  const { cookie } = await createSession(env, {
    owner, repo, pat, gistId, userLogin, userAvatar,
  });

  if (gistId) {
    await env.SESSIONS.put(`sub:${gistId}`, JSON.stringify({ owner, pat, gistId }));
    await env.SESSIONS.put(`gist:${owner}/${repo}`, gistId);
  }

  return jsonResponse(
    {
      user: { login: userLogin, avatar_url: userAvatar },
      state: stateData,
      sha: ghData.sha,
      gistId,
    },
    200,
    { 'Set-Cookie': cookie }
  );
}

export async function handleDisconnect(request: Request, env: Env): Promise<Response> {
  const sid = getSessionId(request, env.COOKIE_NAME);
  if (sid) {
    const cookie = await deleteSession(sid, env);
    return jsonResponse({ ok: true }, 200, { 'Set-Cookie': cookie });
  }
  return jsonResponse({ ok: true });
}

export async function handleGetState(request: Request, env: Env): Promise<Response> {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const ghRes = await repoFetch('contents/rules.json', session);
  if (!ghRes.ok) return errorResponse('Failed to fetch state', ghRes.status);

  const ghData = await ghRes.json() as { sha: string; content: string };
  const stateData = JSON.parse(decodeGithubContent(ghData.content));

  return jsonResponse({
    state: stateData,
    sha: ghData.sha,
    user: { login: session.userLogin, avatar_url: session.userAvatar },
    owner: session.owner,
    repo: session.repo,
    gistId: session.gistId,
  });
}

export async function handlePutState(request: Request, env: Env): Promise<Response> {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const { state, sha } = await request.json() as { state: unknown; sha: string };
  const encoded = encodeToBase64(JSON.stringify(state, null, 2));

  const ghRes = await repoFetch('contents/rules.json', session, {
    method: 'PUT',
    body: { message: 'Deploy: update via WebUI', content: encoded, sha },
  });

  if (!ghRes.ok) {
    const err = await ghRes.text();
    return errorResponse(`Save failed: ${err}`, ghRes.status);
  }

  const result = await ghRes.json() as { content: { sha: string } };
  return jsonResponse({ sha: result.content.sha });
}

export async function handleRefresh(request: Request, env: Env): Promise<Response> {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const repoRes = await repoFetch('', session);
  if (!repoRes.ok) return errorResponse('Failed to fetch repo info', repoRes.status);
  const repoInfo = await repoRes.json() as { default_branch: string };

  const dispatchRes = await repoFetch('actions/workflows/build.yml/dispatches', session, {
    method: 'POST',
    body: { ref: repoInfo.default_branch || 'main' },
  });

  if (!dispatchRes.ok && dispatchRes.status !== 204) {
    return errorResponse('Failed to trigger refresh', dispatchRes.status);
  }

  return jsonResponse({ ok: true });
}

export async function handleGetRuns(request: Request, env: Env): Promise<Response> {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const perPage = url.searchParams.get('per_page') || '5';

  const ghRes = await repoFetch(`actions/runs?per_page=${perPage}`, session);
  if (!ghRes.ok) return errorResponse('Failed to fetch runs', ghRes.status);

  const data = await ghRes.json();
  return jsonResponse(data);
}

export async function handleGetGist(request: Request, env: Env, name: string): Promise<Response> {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  if (!session.gistId) return errorResponse('No Gist ID configured', 400);

  const ghRes = await gistFetch(session.gistId, session.pat);
  if (!ghRes.ok) return errorResponse('Failed to fetch Gist', ghRes.status);

  const data = await ghRes.json() as { files: Record<string, { content: string }> };
  const file = data.files[`${name}.json`];

  if (!file) return errorResponse('File not found in Gist', 404);
  return jsonResponse({ content: file.content });
}
