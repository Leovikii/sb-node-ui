import type { Env } from '../types';
import { gistFetch } from '../lib/github';
import { errorResponse } from '../lib/security';

interface SubConfig {
  owner: string;
  pat: string;
  gistId: string;
}

const ALLOWED_UA_PATTERNS = ['sing-box', 'SFI', 'SFA', 'SFM', 'SFT'];

export async function handleSubscription(
  request: Request,
  env: Env,
  token: string,
  name: string
): Promise<Response> {
  const ua = request.headers.get('User-Agent') || '';
  const allowed = ALLOWED_UA_PATTERNS.some(pattern => ua.includes(pattern));
  if (!allowed) {
    return errorResponse('Forbidden', 403);
  }

  const raw = await env.SESSIONS.get(`sub:${token}`);
  if (!raw) {
    return errorResponse('Invalid subscription link', 404);
  }

  const subConfig: SubConfig = JSON.parse(raw);

  const ghRes = await gistFetch(subConfig.gistId, subConfig.pat);
  if (!ghRes.ok) {
    return errorResponse('Failed to fetch subscription data', 502);
  }

  const data = await ghRes.json() as { files: Record<string, { content: string }> };
  const file = data.files[`${name}.json`];

  if (!file) {
    return errorResponse('Profile not found', 404);
  }

  return new Response(file.content, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Profile-Update-Interval': '3600',
    },
  });
}
