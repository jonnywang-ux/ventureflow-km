'use client'

import { useTeam } from './useTeam'

export function usePermissions() {
  const { role } = useTeam()
  return {
    canEdit: role === 'admin' || role === 'editor',
    canAdmin: role === 'admin',
    canView: true,
    role,
  }
}
