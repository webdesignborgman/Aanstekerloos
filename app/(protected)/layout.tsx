"use client";
import { RequireAuth } from '@/components/auth/RequireAuth';
import type { ReactNode } from 'react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
