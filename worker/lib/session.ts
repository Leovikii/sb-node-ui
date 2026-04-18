import type { Env, SessionData, UserIndex, ResolvedSession } from '../types';

export function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function getSessionId(request: Request, cookieName: string): string | null {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
  return match ? match[1] : null;
}

async function getSessionData(sessionId: string, env: Env): Promise<SessionData | null> {
  const raw = await env.SESSIONS.get(sessionId);
  return raw ? JSON.parse(raw) as SessionData : null;
}

function userKey(owner: string, repo: string): string {
  return `user:${owner}/${repo}`;
}

async function getUserIndex(owner: string, repo: string, env: Env): Promise<UserIndex | null> {
  const raw = await env.SESSIONS.get(userKey(owner, repo));
  return raw ? JSON.parse(raw) as UserIndex : null;
}

export async function resolveSession(sessionId: string, env: Env): Promise<ResolvedSession | null> {
  const session = await getSessionData(sessionId, env);
  if (!session) return null;
  const index = await getUserIndex(session.owner, session.repo, env);
  if (!index) return null;
  return {
    owner: session.owner,
    repo: session.repo,
    pat: index.pat,
    gistId: index.gistId,
    userLogin: index.userLogin,
    userAvatar: index.userAvatar,
  };
}

function makeCookie(env: Env, sessionId: string): string {
  return [
    `${env.COOKIE_NAME}=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=31536000',
  ].join('; ');
}

export async function createOrUpdateSession(
  env: Env,
  existingSessionId: string | null,
  data: { owner: string; repo: string; pat: string; gistId: string; userLogin: string; userAvatar: string }
): Promise<{ sessionId: string; cookie: string; gistId: string }> {
  const existing = await getUserIndex(data.owner, data.repo, env);
  const gistId = data.gistId || existing?.gistId || '';

  let sessionId: string;
  if (existingSessionId && await getSessionData(existingSessionId, env)) {
    sessionId = existingSessionId;
  } else {
    sessionId = generateSessionId();
  }

  const session: SessionData = { owner: data.owner, repo: data.repo, createdAt: Date.now() };
  await env.SESSIONS.put(sessionId, JSON.stringify(session));

  let sessionIds: string[];
  if (existing) {
    const checks = await Promise.all(
      existing.sessionIds.map(async id => ({ id, alive: !!(await env.SESSIONS.get(id)) }))
    );
    sessionIds = checks.filter(c => c.alive).map(c => c.id);
    if (!sessionIds.includes(sessionId)) sessionIds.push(sessionId);
  } else {
    sessionIds = [sessionId];
  }

  const index: UserIndex = {
    sessionIds,
    pat: data.pat,
    gistId,
    userLogin: data.userLogin,
    userAvatar: data.userAvatar,
  };
  await env.SESSIONS.put(userKey(data.owner, data.repo), JSON.stringify(index));

  if (gistId) {
    await env.SESSIONS.put(`sub:${gistId}`, JSON.stringify({ owner: data.owner, pat: data.pat, gistId }));
  }

  return { sessionId, cookie: makeCookie(env, sessionId), gistId };
}

export async function deleteAllUserData(sessionId: string, env: Env): Promise<string> {
  const session = await getSessionData(sessionId, env);
  if (session) {
    const index = await getUserIndex(session.owner, session.repo, env);
    if (index) {
      await Promise.all(index.sessionIds.map(id => env.SESSIONS.delete(id)));
      if (index.gistId) {
        await env.SESSIONS.delete(`sub:${index.gistId}`);
      }
      await env.SESSIONS.delete(userKey(session.owner, session.repo));
    }
  }
  await env.SESSIONS.delete(sessionId);
  return `${env.COOKIE_NAME}=deleted; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
