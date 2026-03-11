'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTeam } from '@/lib/hooks/useTeam'
import { getInitials } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '' },
  { label: 'Articles', href: '/articles' },
  { label: 'Documents', href: '/documents' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Ideas', href: '/ideas' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Search', href: '/search' },
  { label: 'Settings', href: '/settings' },
]

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { team, profile } = useTeam()
  const base = `/${team.slug}`

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header style={{ background: '#1a1814', borderBottom: '1px solid #2a2620', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 28px', gap: '0', height: '52px' }}>
        {/* Logo */}
        <div style={{ flexShrink: 0, marginRight: '32px' }}>
          <span style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '18px', color: '#f5f2ec', letterSpacing: '0.01em' }}>
            Venture
          </span>
          <span style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '18px', color: '#b8960a', letterSpacing: '0.01em' }}>
            Flow
          </span>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: 'flex', alignItems: 'stretch', flex: 1, height: '100%', gap: '0' }}>
          {navItems.map(({ label, href }) => {
            const to = base + href
            const active = pathname === to || (href !== '' && pathname.startsWith(to))
            return (
              <Link
                key={label}
                href={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 14px',
                  fontFamily: 'var(--font-syne)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  color: active ? '#f5f2ec' : '#8a857d',
                  borderBottom: active ? '2px solid #b8960a' : '2px solid transparent',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2a2620', border: '1px solid #3a3630', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-syne)', fontSize: '9px', fontWeight: 700, color: '#b8960a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {profile.full_name ? getInitials(profile.full_name) : '?'}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            style={{ fontFamily: 'var(--font-syne)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a857d', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f5f2ec')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8a857d')}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
