export type AppLocale = 'zh-CN' | 'en-US';

export function resolveInitialLocale(saved: string | null, browserLanguage: string): AppLocale {
  if (saved === 'zh-CN' || saved === 'en-US') return saved;
  return browserLanguage.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
}
