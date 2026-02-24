import { adminDb } from '@/lib/firebase/server'
import { getSession } from '@/app/auth/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateStructure, createTask, deleteTask } from './actions'
import { ArrowLeft, Plus, FileText, CheckCircle2, Combine, Trash2 } from 'lucide-react'

export default async function TopicPage({ params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user) return redirect('/login')

  const topicId = params.id

  const topicDoc = await adminDb.collection('topics').doc(topicId).get()
  if (!topicDoc.exists) return redirect('/dashboard')

  const topicData = topicDoc.data()
  if (topicData?.userId !== user.uid) return redirect('/dashboard')

  const tasksSnapshot = await adminDb
    .collection('topics')
    .doc(topicId)
    .collection('tasks')
    .orderBy('createdAt', 'asc')
    .get()

  const tasks = tasksSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[]

  const structure = topicData.structure || {}

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto py-12 px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-10 group transition-colors"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Voltar para Projetos
        </Link>

        <div className="flex flex-col lg:flex-row justify-between items-start mb-14 gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight">{topicData.title}</h1>
            <p className="text-blue-400 font-semibold tracking-wider text-xs uppercase">Arquitetura de Artigo Científico</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <form action="/api/verificar" method="POST">
               <input type="hidden" name="topicId" value={topicId} />
               <button className="flex items-center gap-2 py-3 px-6 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all font-bold">
                 <CheckCircle2 size={20} className="text-blue-500" /> Verificar Estrutura
               </button>
            </form>
            <form action="/api/consolidar" method="POST">
               <input type="hidden" name="topicId" value={topicId} />
               <button className="flex items-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all font-bold shadow-lg shadow-blue-500/20">
                 <Combine size={20} /> Consolidar Artigo
               </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Lado Esquerdo: Estrutura */}
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white/5 border border-white/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <FileText size={24} className="text-blue-500" /> Estrutura Formal
              </h2>
              <form action={updateStructure.bind(null, topicId)} className="space-y-8">
                {[
                  { name: 'problema', label: 'Problema de Pesquisa', desc: 'A pergunta central...' },
                  { name: 'delimitacao', label: 'Delimitação', desc: 'Recorte espacial/temporal...' },
                  { name: 'justificativa', label: 'Justificativa Acadêmica', desc: 'A relevância técnica...' },
                  { name: 'objetivo', label: 'Objetivo Geral', desc: 'A meta principal...' },
                  { name: 'tese', label: 'Tese / Argumento Central', desc: 'A afirmação principal...' },
                  { name: 'conclusao_provisoria', label: 'Conclusão Provisória', desc: 'Resultados esperados...' },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label htmlFor={field.name} className="block text-sm font-bold text-gray-400 uppercase tracking-widest">
                      {field.label}
                    </label>
                    <textarea
                      id={field.name}
                      name={field.name}
                      defaultValue={structure?.[field.name as keyof typeof structure] || ''}
                      placeholder={field.desc}
                      rows={3}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 leading-relaxed"
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-white text-black font-black py-3 px-10 rounded-xl hover:bg-gray-200 transition-colors uppercase text-sm tracking-widest"
                  >
                    Salvar Estrutura
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Lado Direito: Tasks Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl sticky top-8">
              <h2 className="text-xl font-black mb-6 border-b border-white/10 pb-4 flex justify-between items-center">
                 Conteúdo Autoral
                 <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md">{tasks?.length || 0}</span>
              </h2>
              <div className="space-y-3">
                {tasks?.map((task) => (
                  <div key={task.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                    <Link
                      href={`/topic/${topicId}/task/${task.id}`}
                      className="flex-1 text-sm font-bold text-gray-400 group-hover:text-blue-400 transition-colors truncate mr-4"
                    >
                      {task.title}
                    </Link>
                    <form action={deleteTask.bind(null, task.id, topicId)}>
                      <button className="text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                ))}

                <form action={createTask.bind(null, topicId)} className="mt-8 pt-6 border-t border-white/10 space-y-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Título da nova task..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all"
                    required
                  />
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all uppercase text-xs tracking-widest">
                    <Plus size={16} /> Adicionar Task
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
