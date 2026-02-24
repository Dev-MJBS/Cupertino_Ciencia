import { adminDb } from '@/lib/firebase/server'
import { getSession } from '@/app/auth/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateTask } from './actions'
import { ArrowLeft, Save } from 'lucide-react'

export default async function TaskPage({
  params
}: {
  params: { id: string, taskId: string }
}) {
  const user = await getSession()
  if (!user) return redirect('/login')

  const { id: topicId, taskId } = params

  const taskDoc = await adminDb
    .collection('topics')
    .doc(topicId)
    .collection('tasks')
    .doc(taskId)
    .get()

  if (!taskDoc.exists) return redirect(`/topic/${topicId}`)

  const task = { id: taskDoc.id, ...taskDoc.data() } as any

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto py-12 px-6">
        <Link
          href={`/topic/${topicId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-10 group transition-colors"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Voltar para o Projeto
        </Link>

        <form action={updateTask.bind(null, taskId, topicId)} className="space-y-10 flex flex-col min-h-[80vh]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <input
              name="title"
              defaultValue={task.title}
              className="text-5xl font-black bg-transparent border-none focus:outline-none focus:ring-0 w-full p-0 tracking-tighter placeholder:text-white/10"
              placeholder="Título da Task"
              required
            />
            <button className="flex items-center gap-3 py-3 px-10 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all font-bold shadow-lg shadow-blue-500/20 whitespace-nowrap">
               <Save size={20} /> Salvar Conteúdo
            </button>
          </div>

          <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-3xl p-10 focus-within:border-blue-500/50 transition-all shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.02] blur-3xl pointer-events-none"></div>
            <textarea
              name="content"
              defaultValue={task.content || ''}
              className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 text-xl leading-relaxed resize-none font-serif placeholder:text-gray-700"
              placeholder="Descreva seu argumento científico aqui... A IA usará este texto na consolidação final."
            />
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest px-2">
            <span>Escrita Autoral Mode</span>
            <span>Salvo em nuvem</span>
          </div>
        </form>
      </div>
    </div>
  )
}
