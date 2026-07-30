import { describe, expect, it } from 'vitest';
import { theme } from '../../src-react/theme/theme';

describe('React theme', () => {
  it('honors the operating system reduced-motion preference', () => {
    expect(theme.respectReducedMotion).toBe(true);
  });
});
