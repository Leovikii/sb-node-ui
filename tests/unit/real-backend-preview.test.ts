import { describe, expect, it } from 'vitest';
// @ts-expect-error The executable development script intentionally ships without declaration output.
import { isAllowedRealBackendRequest } from '../../scripts/run-real-backend-preview.mjs';

describe('real backend preview safety policy', () => {
  it('allows authentication and read-only API requests', () => {
    expect(isAllowedRealBackendRequest('GET', '/api/bootstrap')).toBe(true);
    expect(isAllowedRealBackendRequest('HEAD', '/api/assets')).toBe(true);
    expect(isAllowedRealBackendRequest('OPTIONS', '/api/settings')).toBe(true);
    expect(isAllowedRealBackendRequest('POST', '/api/login')).toBe(true);
    expect(isAllowedRealBackendRequest('POST', '/api/logout')).toBe(true);
  });

  it('blocks persistent and operational writes', () => {
    expect(isAllowedRealBackendRequest('PUT', '/api/settings')).toBe(false);
    expect(isAllowedRealBackendRequest('PUT', '/api/file')).toBe(false);
    expect(isAllowedRealBackendRequest('DELETE', '/api/file?path=sing-sub/nodes/a.json')).toBe(false);
    expect(isAllowedRealBackendRequest('POST', '/api/github-sync/push')).toBe(false);
    expect(isAllowedRealBackendRequest('POST', '/api/rulesets/example/build')).toBe(false);
  });
});
