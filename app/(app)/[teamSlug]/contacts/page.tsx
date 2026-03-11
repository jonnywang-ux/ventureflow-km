import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Mail, Building } from 'lucide-react'

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ teamSlug: string }>
}) {
  const { teamSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: team } = await supabase.from('teams').select('id').eq('slug', teamSlug).single()
  if (!team) redirect('/onboarding')

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('team_id', team.id)
    .order('name')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
        <p className="text-sm text-gray-500 mt-1">
          {contacts?.length ?? 0} contacts — auto-extracted from documents + manually added
        </p>
      </div>

      {!contacts || contacts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No contacts yet</p>
          <p className="text-sm mt-1">Upload documents to auto-extract contacts</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700 shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{contact.name}</p>
                  {contact.title && <p className="text-xs text-gray-500 truncate">{contact.title}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                {contact.company && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Building className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
              </div>
              {contact.notes && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{contact.notes}</p>
              )}
              {contact.source_document_id && (
                <Link
                  href={`/${teamSlug}/documents/${contact.source_document_id}`}
                  className="text-xs text-indigo-500 hover:underline mt-2 block"
                >
                  View source document →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
