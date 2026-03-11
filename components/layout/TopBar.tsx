'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTeam } from '@/lib/hooks/useTeam'
import { getInitials } from '@/lib/utils'

export function TopBar() {
  const router = useRouter()
  const { profile } = useTeam()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
            {profile.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
          </div>
          <span className="text-sm text-gray-700 font-medium">
            {profile.full_name ?? profile.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
