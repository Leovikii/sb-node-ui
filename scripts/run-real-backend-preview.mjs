import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { createServer, preview } from 'vite';

const REAL_BACKEND_ORIGIN = 'https://ss.vkio.org';
const LOCAL_HOST = '127.0.0.1';
const LOCAL_PORT = 8787;
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');

export function isAllowedRealBackendRequest(method, requestUrl) {
  const normalizedMethod = method?.toUpperCase() ?? 'GET';
  if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD' || normalizedMethod === 'OPTIONS') return true;

  const pathname = new URL(requestUrl ?? '/', 'http://localhost').pathname;
  return normalizedMethod === 'POST' && (
    pathname === '/api/login' || pathname === '/api/logout' || pathname === '/api/preview'
  );
}

function readOnlyGuard() {
  const installGuard = (server) => {
    server.middlewares.use((request, response, next) => {
      if (!request.url?.startsWith('/api/') || isAllowedRealBackendRequest(request.method, request.url)) {
        next();
        return;
      }

      response.statusCode = 403;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({
        error: {
          code: 'REAL_BACKEND_PREVIEW_READ_ONLY',
          details: 'This local preview blocks persistent writes to the real backend.',
        },
      }));
    });
  };

  return {
    name: 'sing-sub-real-backend-read-only-guard',
    configureServer: installGuard,
    configurePreviewServer: installGuard,
  };
}

const proxy = {
  '/api': {
    target: REAL_BACKEND_ORIGIN,
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
  },
};

export async function startRealBackendPreview({ production = false } = {}) {
  const commonConfig = {
    configFile: false,
    root: projectRoot,
    plugins: [readOnlyGuard(), react()],
  };
  const server = production
    ? await preview({
      ...commonConfig,
      preview: {
        host: LOCAL_HOST,
        port: LOCAL_PORT,
        strictPort: true,
        proxy,
      },
    })
    : await createServer({
      ...commonConfig,
      server: {
        host: LOCAL_HOST,
        port: LOCAL_PORT,
        strictPort: true,
        proxy,
      },
    });

  if (!production) await server.listen();
  server.printUrls();
  console.warn(`Real backend: ${REAL_BACKEND_ORIGIN}`);
  console.warn(`Frontend mode: ${production ? 'production build' : 'Vite development'}`);
  console.warn('Safety mode: only reads, authentication, and ephemeral POST /api/preview are forwarded.');

  const close = async () => {
    await server.close();
    process.exit(0);
  };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await startRealBackendPreview({ production: process.argv.includes('--production') });
}
