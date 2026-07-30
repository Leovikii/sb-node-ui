import { describe, expect, it } from 'vitest';
import { resolveInitialLocale } from '../../src-react/i18n/preferences';

describe('React locale preferences', () => {
  it('uses a saved supported locale before browser language', () => {
    expect(resolveInitialLocale('en-US', 'zh-CN')).toBe('en-US');
    expect(resolveInitialLocale('zh-CN', 'en-US')).toBe('zh-CN');
  });

  it('falls back to the browser language family', () => {
    expect(resolveInitialLocale(null, 'zh-HK')).toBe('zh-CN');
    expect(resolveInitialLocale(null, 'fr-FR')).toBe('en-US');
  });
});
