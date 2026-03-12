'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/ventureflow.html')
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '36px', color: '#1a1814', margin: 0, fontWeight: 400 }}>
            VentureFlow
          </h1>
          <p style={{ fontFamily: 'var(--font-syne)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a857d', marginTop: '8px' }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#ffffff', border: '1px solid #ddd9d0', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px', fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: '#dc2626' }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-syne)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a4640', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-syne)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a4640', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '4px' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: '#8a857d', marginTop: '20px' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: '#b8960a', textDecoration: 'none', fontWeight: 400 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
