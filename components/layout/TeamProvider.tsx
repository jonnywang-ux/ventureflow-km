'use client'

import { TeamContext } from '@/lib/hooks/useTeam'
import type { TeamContextValue } from '@/lib/hooks/useTeam'

export function TeamProvider({
  value,
  children,
}: {
  value: TeamContextValue
  children: React.ReactNode
}) {
  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}
