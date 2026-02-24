import { getSession, signOut } from '@/app/auth/actions'
import { adminDb } from '@/lib/firebase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createTopic, deleteTopic } from './actions'
import { Plus, BookOpen, Trash2, LogOut, FolderOpen } from 'lucide-react'

export default async function Dashboard() {
  const user = await getSession()

  if (!user) {
    return redirect('/login')
  }

  const snapshot = await adminDb
    .collection('topics')
    .where('userId', '==', user.uid)
    .get()

  const topics = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)) as any[]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto py-12 px-6">
        <header className="flex justify-between items-center mb-12 pb-6 border-b border-white/10">
          <h1 className="text-3xl font-black tracking-tight text-blue-500 flex items-center gap-3">
            <BookOpen size={32} /> Ciência Pedagogia
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-400 hidden sm:inline">{user.email}</span>
            <form action={signOut}>
              <button className="flex items-center gap-2 py-2 px-4 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all font-medium">
                <LogOut size={18} /> Sair
              </button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
          {/* Card de Novo Tema */}
          <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-8 flex flex-col justify-center items-center h-64 hover:bg-white/10 transition group">
            <h2 className="text-xl font-bold mb-6 text-gray-300 group-hover:text-white transition-colors">Novo Projeto</h2>
            <form action={createTopic} className="w-full space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Título da pesquisa..."
                className="w-full text-center bg-transparent border-b border-white/20 focus:border-blue-500 focus:outline-none text-lg font-medium p-2 transition-colors"
                required
              />
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] transition font-bold">
                <Plus size={20} /> Criar Tema
              </button>
            </form>
          </div>

          {/* Listagem de Temas */}
          {topics?.map((topic) => (
            <div key={topic.id} className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col justify-between h-64 hover:border-blue-500/50 hover:bg-white/10 transition-all shadow-xl">
              <div>
                <h2 className="text-2xl font-bold mb-3 line-clamp-2 h-16">{topic.title}</h2>
                <p className="text-sm text-gray-500 font-medium italic">
                  Iniciado em {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
                <Link
                  href={`/topic/${topic.id}`}
                  className="flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition"
                >
                  <FolderOpen size={20} /> Abrir
                </Link>
                <form action={deleteTopic.bind(null, topic.id)}>
                  <button className="text-gray-500 hover:text-red-500 transition-colors bg-white/5 p-2 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
