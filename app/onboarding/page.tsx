'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const slug = teamName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({ name: teamName, slug, created_by: user.id })
      .select()
      .single()

    if (teamError) {
      setError(teamError.message)
      setLoading(false)
      return
    }

    // Add creator as admin
    await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'admin',
    })

    router.push(`/${team.slug}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your team</h1>
          <p className="mt-2 text-sm text-gray-500">
            Set up your team workspace to get started.
          </p>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
              Team name
            </label>
            <input
              id="teamName"
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Acme Ventures"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !teamName.trim()}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create team'}
          </button>
        </form>
      </div>
    </div>
  )
}
