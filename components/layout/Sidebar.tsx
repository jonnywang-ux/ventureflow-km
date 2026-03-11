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
import { cn } from '@/lib/utils'
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

export function Sidebar() {
  const pathname = usePathname()
  const { team } = useTeam()
  const base = `/${team.slug}`

  return (
    <aside className="w-60 bg-gray-900 text-gray-100 flex flex-col min-h-screen shrink-0">
      <div className="px-4 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">VentureFlow</h1>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{team.name}</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const to = base + href
          const active = pathname === to || (href !== '' && pathname.startsWith(to))
          return (
            <Link
              key={label}
              href={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-gray-700">
        <Link
          href={`${base}/settings`}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            pathname.startsWith(`${base}/settings`)
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
