import type { Env, UserSettings, StateData, Profile } from '../types';
import {
  getSessionData, getUserSettings, putUserSettings,
  createSession, deleteSession, requireAuth,
  sessionCookieHeader, clearSessionCookieHeader,
} from '../lib/auth';
import { fetchUser, fetchFileContent, putFileContent, type RepoSession } from '../lib/github';
import { buildAllProfiles, buildProfile } from '../lib/builder';
import { jsonResponse, errorResponse } from '../lib/security';

const RULES_PATH = 'sing-sub/rules.json';

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const { owner, repo, pat, subToken } = await request.json() as {
    owner: string; repo: string; pat: string; subToken: string;
  };

  if (!owner || !repo || !pat || !subToken) {
    return errorResponse('Missing required fields', 400);
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(subToken)) {
    return errorResponse('subToken can only contain letters, numbers, hyphens and underscores', 400);
  }

  const userRes = await fetchUser(pat);
  if (!userRes.ok) return errorResponse('Invalid PAT', 401);
  const userData = await userRes.json() as { login: string; avatar_url: string };

  const existing = await getUserSettings(owner, repo, env);

  if (!existing || existing.subToken !== subToken) {
    const taken = await env.SESSIONS.get(`sub:${subToken}`);
    if (taken) {
      const takenData = JSON.parse(taken) as { owner: string; repo: string };
      if (takenData.owner !== owner || takenData.repo !== repo) {
        return errorResponse('subToken already taken', 409);
      }
    }
  }

  if (existing && existing.subToken && existing.subToken !== subToken) {
    await env.SESSIONS.delete(`sub:${existing.subToken}`);
  }

  const settings: UserSettings = {
    pat,
    owner,
    repo,
    subToken,
    userLogin: userData.login,
    userAvatar: userData.avatar_url,
  };

  await putUserSettings(settings, env);
  await env.SESSIONS.put(`sub:${subToken}`, JSON.stringify({ owner, repo }));

  const sessionId = await createSession(owner, repo, env);

  return jsonResponse(
    { owner, repo, subToken, userLogin: settings.userLogin, userAvatar: settings.userAvatar },
    200,
    { 'Set-Cookie': sessionCookieHeader(sessionId) },
  );
}

export async function handleLogout(request: Request, env: Env): Promise<Response> {
  await deleteSession(request, env);
  return jsonResponse({ ok: true }, 200, { 'Set-Cookie': clearSessionCookieHeader() });
}

export async function handleGetSettings(request: Request, env: Env): Promise<Response> {
  const session = await getSessionData(request, env);
  if (!session) return errorResponse('Not authenticated', 401);

  const settings = await getUserSettings(session.owner, session.repo, env);
  if (!settings) return jsonResponse(null);

  return jsonResponse({
    owner: settings.owner,
    repo: settings.repo,
    subToken: settings.subToken,
    userLogin: settings.userLogin,
    userAvatar: settings.userAvatar,
  });
}

export async function handlePutSettings(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;

  const { owner, repo, pat, subToken } = await request.json() as {
    owner: string; repo: string; pat: string; subToken: string;
  };

  if (!owner || !repo || !subToken) {
    return errorResponse('Missing required fields', 400);
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(subToken)) {
    return errorResponse('subToken can only contain letters, numbers, hyphens and underscores', 400);
  }

  const effectivePat = pat || auth.settings.pat;

  const userRes = await fetchUser(effectivePat);
  if (!userRes.ok) return errorResponse('Invalid PAT', 401);
  const userData = await userRes.json() as { login: string; avatar_url: string };

  if (auth.settings.subToken !== subToken) {
    const taken = await env.SESSIONS.get(`sub:${subToken}`);
    if (taken) {
      const takenData = JSON.parse(taken) as { owner: string; repo: string };
      if (takenData.owner !== auth.session.owner || takenData.repo !== auth.session.repo) {
        return errorResponse('subToken already taken', 409);
      }
    }
    await env.SESSIONS.delete(`sub:${auth.settings.subToken}`);
  }

  const isRepoChange = owner !== auth.session.owner || repo !== auth.session.repo;

  const settings: UserSettings = {
    pat: effectivePat,
    owner,
    repo,
    subToken,
    userLogin: userData.login,
    userAvatar: userData.avatar_url,
  };

  if (isRepoChange) {
    const oldKey = `user:${auth.session.owner}/${auth.session.repo}`;
    await env.SESSIONS.delete(oldKey);
  }

  await putUserSettings(settings, env);
  await env.SESSIONS.put(`sub:${subToken}`, JSON.stringify({ owner, repo }));

  let cookieHeader: string | undefined;
  if (isRepoChange) {
    await deleteSession(request, env);
    const newSessionId = await createSession(owner, repo, env);
    cookieHeader = sessionCookieHeader(newSessionId);
  }

  const resp = jsonResponse(
    { owner, repo, subToken, userLogin: settings.userLogin, userAvatar: settings.userAvatar },
    200,
    cookieHeader ? { 'Set-Cookie': cookieHeader } : undefined,
  );
  return resp;
}

export async function handleDeleteSettings(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;

  await env.SESSIONS.delete(`sub:${auth.settings.subToken}`);
  const list = await env.SESSIONS.list({ prefix: `config:${auth.settings.subToken}:` });
  await Promise.all(list.keys.map(k => env.SESSIONS.delete(k.name)));
  await env.SESSIONS.delete(`user:${auth.session.owner}/${auth.session.repo}`);
  await deleteSession(request, env);

  return jsonResponse({ ok: true }, 200, { 'Set-Cookie': clearSessionCookieHeader() });
}

export async function handleGetState(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;

  const session: RepoSession = {
    owner: auth.settings.owner,
    repo: auth.settings.repo,
    pat: auth.settings.pat,
  };

  const file = await fetchFileContent(RULES_PATH, session);
  if (!file) {
    return jsonResponse({ state: { profiles: [] }, sha: null });
  }

  const state = JSON.parse(file.content) as StateData;
  return jsonResponse({ state, sha: file.sha });
}

export async function handleRebuild(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;

  const session: RepoSession = {
    owner: auth.settings.owner,
    repo: auth.settings.repo,
    pat: auth.settings.pat,
  };

  const file = await fetchFileContent(RULES_PATH, session);
  if (!file) return errorResponse('No rules found', 404);

  const state = JSON.parse(file.content) as StateData;

  try {
    await buildAllProfiles(state.profiles, session, auth.settings.subToken, env);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Build failed';
    return jsonResponse({ state, sha: file.sha, warning: msg });
  }

  return jsonResponse({ state, sha: file.sha });
}

export async function handlePutState(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;

  const { state, sha } = await request.json() as { state: StateData; sha: string | null };

  const session: RepoSession = {
    owner: auth.settings.owner,
    repo: auth.settings.repo,
    pat: auth.settings.pat,
  };

  const content = JSON.stringify(state, null, 2);
  const result = await putFileContent(RULES_PATH, session, content, sha, 'Update rules via Sing-Sub');

  try {
    await buildAllProfiles(state.profiles, session, auth.settings.subToken, env);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Build failed';
    return jsonResponse({ sha: result.sha, warning: msg });
  }

  return jsonResponse({ sha: result.sha });
}

export async function handlePreview(request: Request, env: Env, name: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;

  const cached = await env.SESSIONS.get(`config:${auth.settings.subToken}:${name}`);
  if (!cached) return errorResponse('该配置尚未构建，请先保存或刷新', 404);

  return jsonResponse({ content: cached });
}
