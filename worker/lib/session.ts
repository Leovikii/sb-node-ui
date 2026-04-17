import type { Env, SessionData, UserIndex } from '../types';

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

export async function getSession(sessionId: string, env: Env): Promise<SessionData | null> {
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

export async function createSession(
  env: Env,
  data: Omit<SessionData, 'createdAt'>
): Promise<{ sessionId: string; cookie: string }> {
  const sessionId = generateSessionId();
  const session: SessionData = { ...data, createdAt: Date.now() };

  const existing = await getUserIndex(data.owner, data.repo, env);
  const gistId = data.gistId || existing?.gistId || '';
  session.gistId = gistId;

  await env.SESSIONS.put(sessionId, JSON.stringify(session));

  const sessionIds = existing ? [...existing.sessionIds, sessionId] : [sessionId];
  await env.SESSIONS.put(userKey(data.owner, data.repo), JSON.stringify({ sessionIds, gistId }));

  if (gistId) {
    await env.SESSIONS.put(`sub:${gistId}`, JSON.stringify({ owner: data.owner, pat: data.pat, gistId }));
  }

  const cookie = [
    `${env.COOKIE_NAME}=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=31536000',
  ].join('; ');

  return { sessionId, cookie };
}

export async function deleteAllUserData(sessionId: string, env: Env): Promise<string> {
  const session = await getSession(sessionId, env);
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
