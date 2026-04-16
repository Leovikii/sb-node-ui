import type { Env } from './types';
import {
  handleConnect, handleDisconnect, handleGetState,
  handlePutState, handleRefresh, handleGetRuns, handleGetGist
} from './routes/api';
import { handleSubscription } from './routes/sub';
import { addSecurityHeaders, errorResponse } from './lib/security';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    let response: Response;

    try {
      if (path === '/api/connect' && method === 'POST') {
        response = await handleConnect(request, env);
      } else if (path === '/api/disconnect' && method === 'POST') {
        response = await handleDisconnect(request, env);
      } else if (path === '/api/state' && method === 'GET') {
        response = await handleGetState(request, env);
      } else if (path === '/api/state' && method === 'PUT') {
        response = await handlePutState(request, env);
      } else if (path === '/api/refresh' && method === 'POST') {
        response = await handleRefresh(request, env);
      } else if (path === '/api/runs' && method === 'GET') {
        response = await handleGetRuns(request, env);
      } else if (path.startsWith('/api/gist/') && method === 'GET') {
        const name = path.slice(10).replace(/\.json$/, '');
        response = await handleGetGist(request, env, name);
      } else if (path.startsWith('/sub/') && path.endsWith('.json') && method === 'GET') {
        // /sub/{gistId}/{name}.json
        const parts = path.slice(5, -5).split('/');
        if (parts.length === 2) {
          response = await handleSubscription(request, env, parts[0], parts[1]);
        } else {
          response = errorResponse('Invalid subscription URL', 400);
        }
      } else if (path.startsWith('/api/') || path.startsWith('/sub/')) {
        response = errorResponse('Not found', 404);
      } else {
        // Static assets handled by Cloudflare assets binding (SPA fallback)
        return new Response(null, { status: 404 });
      }
    } catch {
      response = errorResponse('Internal server error', 500);
    }

    return addSecurityHeaders(response);
  },
} satisfies ExportedHandler<Env>;
