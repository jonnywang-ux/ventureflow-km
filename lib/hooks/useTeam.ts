'use client'

import { createContext, useContext } from 'react'
import type { Team, TeamMember, Profile, UserRole } from '@/lib/types/database'

export interface TeamContextValue {
  team: Team
  member: TeamMember
  profile: Profile
  role: UserRole
}

export const TeamContext = createContext<TeamContextValue | null>(null)

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within TeamProvider')
  return ctx
}
