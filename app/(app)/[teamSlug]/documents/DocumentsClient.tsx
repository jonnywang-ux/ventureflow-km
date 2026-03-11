'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DocumentUploader } from '@/components/documents/DocumentUploader'
import { FileText, FileSpreadsheet, Image, File, Clock, CheckCircle, Loader2, AlertCircle, Plus, X } from 'lucide-react'
import { formatRelative } from '@/lib/utils'
import type { Document } from '@/lib/types/database'

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  excel: <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  word: <FileText className="h-5 w-5 text-blue-500" />,
  markdown: <FileText className="h-5 w-5 text-gray-500" />,
  image: <Image className="h-5 w-5 text-purple-500" />,
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-gray-400" />,
  processing: <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />,
  ready: <CheckCircle className="h-4 w-4 text-green-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
}

export function DocumentsClient({
  teamId,
  teamSlug,
  initialDocs,
}: {
  teamId: string
  teamSlug: string
  initialDocs: Document[]
}) {
  const [docs, setDocs] = useState(initialDocs)
  const [showUploader, setShowUploader] = useState(false)

  async function refreshDocs() {
    const res = await fetch(`/api/documents?teamId=${teamId}`)
    // Re-fetch via page refresh for simplicity
    window.location.reload()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-sm text-gray-500 mt-1">Upload files — AI will extract knowledge automatically</p>
        </div>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {showUploader ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showUploader ? 'Close' : 'Upload'}
        </button>
      </div>

      {showUploader && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <DocumentUploader teamId={teamId} onDone={() => { setShowUploader(false); refreshDocs() }} />
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <File className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No documents yet</p>
          <p className="text-sm mt-1">Upload a PDF, Word, Excel, or image to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/${teamSlug}/documents/${doc.id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {FILE_ICONS[doc.file_type] ?? <File className="h-5 w-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                    {doc.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{doc.file_name}</p>
                  {doc.ai_summary && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{doc.ai_summary}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {STATUS_ICONS[doc.status]}
                    <span className="text-xs text-gray-400 capitalize">{doc.status}</span>
                    <span className="text-xs text-gray-300 ml-auto">{formatRelative(doc.created_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
