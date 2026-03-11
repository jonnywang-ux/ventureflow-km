import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckSquare, Circle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-gray-500 bg-gray-100',
}

export default async function TasksPage({
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

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('team_id', team.id)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  const open = tasks?.filter((t) => t.status !== 'done') ?? []
  const done = tasks?.filter((t) => t.status === 'done') ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <p className="text-sm text-gray-500 mt-1">{open.length} open • {done.length} completed</p>
      </div>

      {(!tasks || tasks.length === 0) ? (
        <div className="text-center py-20 text-gray-400">
          <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tasks yet</p>
          <p className="text-sm mt-1">Tasks are auto-extracted from uploaded documents</p>
        </div>
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Open ({open.length})</h3>
              <div className="space-y-2">
                {open.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                    <Circle className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{task.title}</p>
                      {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className="text-xs text-gray-400">{formatDate(task.due_date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Completed ({done.length})</h3>
              <div className="space-y-2 opacity-60">
                {done.map((task) => (
                  <div key={task.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-start gap-3">
                    <CheckSquare className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-500 line-through">{task.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
