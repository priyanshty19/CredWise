"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface ThemeProviderProps extends React.PropsWithChildren {}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem={true} {...props}>
      {children}
    </NextThemesProvider>
  )
}
