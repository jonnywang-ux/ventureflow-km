'use client'

import { use, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, FileText, FolderOpen, Users, Lightbulb } from 'lucide-react'
import { useTeam } from '@/lib/hooks/useTeam'

interface SearchResults {
  articles: { id: string; title: string; status: string }[]
  documents: { id: string; title: string; file_type: string; status: string }[]
  contacts: { id: string; name: string; company: string | null; title: string | null }[]
  ideas: { id: string; title: string; description: string | null }[]
}

export default function SearchPage({
  params,
}: {
  params: Promise<{ teamSlug: string }>
}) {
  const { teamSlug } = use(params)
  const { team } = useTeam()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&teamId=${team.id}`)
    if (res.ok) setResults(await res.json())
    setLoading(false)
  }, [team.id])

  const totalResults = results
    ? results.articles.length + results.documents.length + results.contacts.length + results.ideas.length
    : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Search</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); doSearch(e.target.value) }}
          placeholder="Search articles, documents, contacts, ideas..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          autoFocus
        />
      </div>

      {loading && <p className="text-sm text-gray-400 text-center">Searching...</p>}

      {results && !loading && (
        <>
          <p className="text-sm text-gray-500">{totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</p>

          {results.articles.length > 0 && (
            <Section title="Articles" icon={<FileText className="h-4 w-4" />}>
              {results.articles.map((a) => (
                <Link key={a.id} href={`/${teamSlug}/articles/${a.id}`} className="block px-3 py-2 hover:bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{a.status}</p>
                </Link>
              ))}
            </Section>
          )}

          {results.documents.length > 0 && (
            <Section title="Documents" icon={<FolderOpen className="h-4 w-4" />}>
              {results.documents.map((d) => (
                <Link key={d.id} href={`/${teamSlug}/documents/${d.id}`} className="block px-3 py-2 hover:bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">{d.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{d.file_type} • {d.status}</p>
                </Link>
              ))}
            </Section>
          )}

          {results.contacts.length > 0 && (
            <Section title="Contacts" icon={<Users className="h-4 w-4" />}>
              {results.contacts.map((c) => (
                <div key={c.id} className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  {(c.title || c.company) && <p className="text-xs text-gray-400">{[c.title, c.company].filter(Boolean).join(' @ ')}</p>}
                </div>
              ))}
            </Section>
          )}

          {results.ideas.length > 0 && (
            <Section title="Ideas" icon={<Lightbulb className="h-4 w-4" />}>
              {results.ideas.map((i) => (
                <div key={i.id} className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-800">{i.title}</p>
                  {i.description && <p className="text-xs text-gray-400 line-clamp-1">{i.description}</p>}
                </div>
              ))}
            </Section>
          )}

          {totalResults === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">No results found. Try different keywords.</p>
          )}
        </>
      )}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-2">{children}</div>
    </div>
  )
}
