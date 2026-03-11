'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const slug = teamName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName, slug }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to create team')
      setLoading(false)
      return
    }

    router.push(`/${data.slug}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '36px', color: '#1a1814', margin: 0, fontWeight: 400 }}>
            Create your team
          </h1>
          <p style={{ fontFamily: 'var(--font-syne)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a857d', marginTop: '8px' }}>
            Set up your workspace to get started
          </p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #ddd9d0', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px', fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: '#dc2626' }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-syne)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a4640', marginBottom: '6px' }}>
                Team name
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Gunung Capital"
                className="input"
              />
            </div>
            <button type="submit" disabled={loading || !teamName.trim()} className="btn-primary" style={{ marginTop: '4px' }}>
              {loading ? 'Creating...' : 'Create team'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
