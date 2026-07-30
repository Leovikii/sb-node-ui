import { createTheme, localStorageColorSchemeManager } from '@mantine/core';

export const colorSchemeManager = localStorageColorSchemeManager({
  key: 'sing-sub.appearance',
});

export const theme = createTheme({
  primaryColor: 'pink',
  defaultRadius: 'md',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  cursorType: 'pointer',
  respectReducedMotion: true,
});
