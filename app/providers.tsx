// app/providers.tsx
'use client'

import {HeroUIProvider, ToastProvider} from '@heroui/react'
import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider placement='top-center'/>
      <AuthProvider>
        {children}
      </AuthProvider>
    </HeroUIProvider>
  )
}