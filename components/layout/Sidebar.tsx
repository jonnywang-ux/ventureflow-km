'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Lightbulb,
  CheckSquare,
  Search,
  Settings,
} from 'lucide-react'
import { useTeam } from '@/lib/hooks/useTeam'

const navItems = [
  { label: 'Dashboard', href: '', icon: LayoutDashboard },
  { label: 'Articles', href: '/articles', icon: FileText },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Ideas', href: '/ideas', icon: Lightbulb },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Search', href: '/search', icon: Search },
]

const linkStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 12px',
  borderRadius: '6px',
  fontFamily: 'var(--font-syne)',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  textDecoration: 'none',
  color: active ? '#f5f2ec' : '#8a857d',
  background: active ? 'rgba(184,150,10,0.18)' : 'transparent',
  borderLeft: active ? '2px solid #b8960a' : '2px solid transparent',
  transition: 'all 0.15s',
})

export function Sidebar() {
  const pathname = usePathname()
  const { team } = useTeam()
  const base = `/${team.slug}`

  return (
    <aside style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#1a1814', borderRight: '1px solid #2a2620' }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #2a2620' }}>
        <h1 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '20px', color: '#f5f2ec', margin: 0, lineHeight: 1.2 }}>
          VentureFlow
        </h1>
        <p style={{ fontFamily: 'var(--font-syne)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b8960a', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {team.name}
        </p>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const to = base + href
          const active = pathname === to || (href !== '' && pathname.startsWith(to))
          return (
            <Link key={label} href={to} style={linkStyle(active)}>
              <Icon size={13} style={{ color: active ? '#b8960a' : '#8a857d', flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '10px', borderTop: '1px solid #2a2620' }}>
        <Link href={`${base}/settings`} style={linkStyle(pathname.startsWith(`${base}/settings`))}>
          <Settings size={13} style={{ color: pathname.startsWith(`${base}/settings`) ? '#b8960a' : '#8a857d', flexShrink: 0 }} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
