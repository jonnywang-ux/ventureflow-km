'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
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
    <header style={{ height: '52px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', flexShrink: 0, gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1814', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-syne)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', color: '#b8960a', textTransform: 'uppercase' }}>
            {profile.full_name ? getInitials(profile.full_name) : '?'}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: 'var(--ink-2)', fontWeight: 300 }}>
          {profile.full_name ?? profile.email}
        </span>
      </div>
      <button
        onClick={handleSignOut}
        title="Sign out"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer', transition: 'all 0.15s' }}
        onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--ink)'; (e.target as HTMLElement).style.color = 'var(--ink)' }}
        onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--ink-3)' }}
      >
        <LogOut size={13} />
      </button>
    </header>
  )
}
