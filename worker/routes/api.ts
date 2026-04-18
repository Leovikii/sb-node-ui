import type { Env, UserSettings, StateData, Profile } from '../types';
import { getIdentity, getUserSettings, requireAuth } from '../lib/auth';
import { fetchUser, fetchFileContent, putFileContent, type RepoSession } from '../lib/github';
import { buildAllProfiles, buildProfile } from '../lib/builder';
import { jsonResponse, errorResponse } from '../lib/security';

const RULES_PATH = 'sing-sub/rules.json';

export async function handleGetIdentity(request: Request): Promise<Response> {
  const identity = getIdentity(request);
  if (!identity) return errorResponse('Not authenticated', 401);
  return jsonResponse({ email: identity.email });
}

export async function handleGetSettings(request: Request, env: Env): Promise<Response> {
  const identity = getIdentity(request);
  if (!identity) return errorResponse('Not authenticated', 401);

  const settings = await getUserSettings(identity.email, env);
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
  const identity = getIdentity(request);
  if (!identity) return errorResponse('Not authenticated', 401);

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

  const existing = await getUserSettings(identity.email, env);
  if (!existing || existing.subToken !== subToken) {
    const taken = await env.SESSIONS.get(`sub:${subToken}`);
    if (taken) {
      const takenData = JSON.parse(taken) as { email: string };
      if (takenData.email !== identity.email) {
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

  await env.SESSIONS.put(`user:${identity.email}`, JSON.stringify(settings));
  await env.SESSIONS.put(`sub:${subToken}`, JSON.stringify({ email: identity.email }));

  return jsonResponse({
    owner: settings.owner,
    repo: settings.repo,
    subToken: settings.subToken,
    userLogin: settings.userLogin,
    userAvatar: settings.userAvatar,
  });
}

export async function handleDeleteSettings(request: Request, env: Env): Promise<Response> {
  const identity = getIdentity(request);
  if (!identity) return errorResponse('Not authenticated', 401);

  const settings = await getUserSettings(identity.email, env);
  if (settings) {
    await env.SESSIONS.delete(`sub:${settings.subToken}`);
    const list = await env.SESSIONS.list({ prefix: `config:${settings.subToken}:` });
    await Promise.all(list.keys.map(k => env.SESSIONS.delete(k.name)));
  }
  await env.SESSIONS.delete(`user:${identity.email}`);

  return jsonResponse({ ok: true });
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

  await buildAllProfiles(state.profiles, session, auth.settings.subToken, env);

  return jsonResponse({ sha: result.sha });
}

export async function handlePreview(request: Request, env: Env, name: string): Promise<Response> {
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
  const profile = state.profiles.find((p: Profile) => p.name === name);
  if (!profile) return errorResponse('Profile not found', 404);

  const config = await buildProfile(profile, session);
  return jsonResponse({ content: config });
}
