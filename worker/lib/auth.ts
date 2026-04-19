import type { Env, UserSettings, SessionData } from '../types';
import { errorResponse } from './security';

function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function parseSessionCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? match[1] : null;
}

export function sessionCookieHeader(sessionId: string, maxAge = 86400 * 30): string {
  return `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearSessionCookieHeader(): string {
  return 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}

function userKey(owner: string, repo: string): string {
  return `user:${owner}/${repo}`;
}

export async function getUserSettings(owner: string, repo: string, env: Env): Promise<UserSettings | null> {
  const raw = await env.SESSIONS.get(userKey(owner, repo));
  return raw ? JSON.parse(raw) as UserSettings : null;
}

export async function putUserSettings(settings: UserSettings, env: Env): Promise<void> {
  await env.SESSIONS.put(userKey(settings.owner, settings.repo), JSON.stringify(settings));
}

export async function getSessionData(request: Request, env: Env): Promise<SessionData | null> {
  const sessionId = parseSessionCookie(request);
  if (!sessionId) return null;
  const raw = await env.SESSIONS.get(`session:${sessionId}`);
  return raw ? JSON.parse(raw) as SessionData : null;
}

export async function createSession(owner: string, repo: string, env: Env): Promise<string> {
  const sessionId = generateSessionId();
  const data: SessionData = { owner, repo };
  await env.SESSIONS.put(`session:${sessionId}`, JSON.stringify(data), { expirationTtl: 86400 * 30 });
  return sessionId;
}

export async function deleteSession(request: Request, env: Env): Promise<void> {
  const sessionId = parseSessionCookie(request);
  if (sessionId) await env.SESSIONS.delete(`session:${sessionId}`);
}

export async function requireAuth(
  request: Request,
  env: Env
): Promise<{ session: SessionData; settings: UserSettings } | Response> {
  const session = await getSessionData(request, env);
  if (!session) return errorResponse('Not authenticated', 401);

  const settings = await getUserSettings(session.owner, session.repo, env);
  if (!settings) return errorResponse('Not configured', 403);

  return { session, settings };
}
