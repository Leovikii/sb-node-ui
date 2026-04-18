import type { Env, UserIdentity, UserSettings } from '../types';
import { errorResponse } from './security';

export function getIdentity(request: Request): UserIdentity | null {
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return null;

  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload));
    if (!decoded.email) return null;
    return { email: decoded.email };
  } catch {
    return null;
  }
}

export async function getUserSettings(email: string, env: Env): Promise<UserSettings | null> {
  const raw = await env.SESSIONS.get(`user:${email}`);
  return raw ? JSON.parse(raw) as UserSettings : null;
}

export async function requireAuth(
  request: Request,
  env: Env
): Promise<{ identity: UserIdentity; settings: UserSettings } | Response> {
  const identity = getIdentity(request);
  if (!identity) return errorResponse('Not authenticated', 401);

  const settings = await getUserSettings(identity.email, env);
  if (!settings) return errorResponse('Not configured', 403);

  return { identity, settings };
}
