'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  status: 'uploading' | 'extracting' | 'done' | 'error'
  error?: string
}

interface DocumentUploaderProps {
  teamId: string
  onDone?: () => void
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'text/markdown': ['.md'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

export function DocumentUploader({ teamId, onDone }: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const updateFile = (id: string, update: Partial<UploadedFile>) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...update } : f)))

  const processFile = useCallback(
    async (file: File) => {
      const id = crypto.randomUUID()
      setFiles((prev) => [...prev, { id, name: file.name, status: 'uploading' }])

      try {
        // Upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('teamId', teamId)
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''))

        const uploadRes = await fetch('/api/documents/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) throw new Error((await uploadRes.json()).error)
        const { documentId } = await uploadRes.json()

        // Extract
        updateFile(id, { status: 'extracting' })
        const extractRes = await fetch(`/api/documents/${documentId}/extract`, { method: 'POST' })
        if (!extractRes.ok) throw new Error((await extractRes.json()).error)

        updateFile(id, { status: 'done' })
        onDone?.()
      } catch (err) {
        updateFile(id, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed' })
      }
    },
    [teamId, onDone]
  )

  const onDrop = useCallback(
    (accepted: File[]) => accepted.forEach(processFile),
    [processFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 50 * 1024 * 1024,
    multiple: true,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF, Word, Excel, CSV, Markdown, images — up to 50MB each
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
              {f.status === 'uploading' && <Loader2 className="h-4 w-4 text-indigo-500 animate-spin shrink-0" />}
              {f.status === 'extracting' && <Loader2 className="h-4 w-4 text-amber-500 animate-spin shrink-0" />}
              {f.status === 'done' && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
              {f.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                {f.status === 'uploading' && <p className="text-xs text-gray-400">Uploading...</p>}
                {f.status === 'extracting' && <p className="text-xs text-amber-600">AI extracting knowledge...</p>}
                {f.status === 'done' && <p className="text-xs text-green-600">Done</p>}
                {f.status === 'error' && <p className="text-xs text-red-600">{f.error}</p>}
              </div>
              <button
                onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                className="text-gray-300 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
