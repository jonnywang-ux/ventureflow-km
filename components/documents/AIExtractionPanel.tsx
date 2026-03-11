import { Users, Lightbulb, CheckSquare, Tag } from 'lucide-react'
import type { ExtractionResult } from '@/lib/types/extraction'

interface Props {
  data: ExtractionResult
  teamSlug: string
}

export function AIExtractionPanel({ data }: Props) {
  return (
    <div className="space-y-4">
      {data.keyPoints && data.keyPoints.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-500" /> Key Points
          </h3>
          <ul className="space-y-1.5">
            {data.keyPoints.map((point, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-indigo-400 shrink-0">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.contacts && data.contacts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" /> Extracted Contacts ({data.contacts.length})
          </h3>
          <div className="space-y-3">
            {data.contacts.map((c, i) => (
              <div key={i} className="text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <p className="font-medium text-gray-800">{c.name}</p>
                {c.title && <p className="text-gray-500">{c.title}{c.company ? ` @ ${c.company}` : ''}</p>}
                {c.email && <p className="text-gray-400 text-xs">{c.email}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.ideas && data.ideas.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Extracted Ideas ({data.ideas.length})
          </h3>
          <div className="space-y-3">
            {data.ideas.map((idea, i) => (
              <div key={i} className="text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <p className="font-medium text-gray-800">{idea.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{idea.description}</p>
                {idea.category && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">{idea.category}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.actions && data.actions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-rose-500" /> Extracted Actions ({data.actions.length})
          </h3>
          <div className="space-y-2">
            {data.actions.map((action, i) => (
              <div key={i} className="text-sm flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${action.priority === 'high' ? 'bg-red-100 text-red-700' : action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                  {action.priority ?? 'medium'}
                </span>
                <div>
                  <p className="font-medium text-gray-800">{action.title}</p>
                  {action.description && <p className="text-gray-400 text-xs">{action.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
