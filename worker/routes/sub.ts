import type { Env, StateData, Profile } from '../types';
import { getUserSettings } from '../lib/auth';
import { buildProfile } from '../lib/builder';
import { fetchFileContent, type RepoSession } from '../lib/github';
import { errorResponse } from '../lib/security';

const ALLOWED_UA_PATTERNS = ['sing-box', 'SFI', 'SFA', 'SFM', 'SFT'];
const RULES_PATH = 'sing-sub/rules.json';

export async function handleSubscription(
  request: Request,
  env: Env,
  token: string,
  name: string
): Promise<Response> {
  const ua = request.headers.get('User-Agent') || '';
  if (!ALLOWED_UA_PATTERNS.some(p => ua.includes(p))) {
    return errorResponse('Forbidden', 403);
  }

  const raw = await env.SESSIONS.get(`sub:${token}`);
  if (!raw) return errorResponse('Invalid subscription link', 404);

  const { owner, repo } = JSON.parse(raw) as { owner: string; repo: string };
  const settings = await getUserSettings(owner, repo, env);
  if (!settings) return errorResponse('User not configured', 404);

  const cached = await env.SESSIONS.get(`config:${token}:${name}`);
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Profile-Update-Interval': '3600',
      },
    });
  }

  const session: RepoSession = { owner: settings.owner, repo: settings.repo, pat: settings.pat };
  const file = await fetchFileContent(RULES_PATH, session);
  if (!file) return errorResponse('Rules not found', 404);

  const state = JSON.parse(file.content) as StateData;
  const profile = state.profiles.find((p: Profile) => p.name === name);
  if (!profile) return errorResponse('Profile not found', 404);

  const config = await buildProfile(profile, session);
  await env.SESSIONS.put(`config:${token}:${name}`, config);

  return new Response(config, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Profile-Update-Interval': '3600',
    },
  });
}
