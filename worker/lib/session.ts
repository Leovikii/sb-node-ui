import type { Env, SessionData } from '../types';

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

export async function createSession(
  env: Env,
  data: Omit<SessionData, 'createdAt'>
): Promise<{ sessionId: string; cookie: string }> {
  const sessionId = generateSessionId();
  const session: SessionData = { ...data, createdAt: Date.now() };

  await env.SESSIONS.put(sessionId, JSON.stringify(session));

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

export async function deleteSession(sessionId: string, env: Env): Promise<string> {
  await env.SESSIONS.delete(sessionId);
  return `${env.COOKIE_NAME}=deleted; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
