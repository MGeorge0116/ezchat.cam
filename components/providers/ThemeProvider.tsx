'use client';

import { ThemeProvider as NextThemes } from 'next-themes';
import React from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"           // adds 'class="dark"' to <html> when dark
      defaultTheme="system"       // system by default
      enableSystem
      disableTransitionOnChange   // avoids flicker
    >
      {children}
    </NextThemes>
  );
}
