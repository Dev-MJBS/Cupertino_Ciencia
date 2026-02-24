import Link from 'next/link'
import { getSession } from '@/app/auth/actions'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getSession()

  if (user) {
    return redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#0a0a0a] text-white">
      <div className="max-w-3xl text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-7xl font-black tracking-tighter text-blue-500 animate-in fade-in slide-in-from-bottom duration-1000">
            Ciência Pedagogia
          </h1>
          <p className="text-2xl text-gray-400 font-medium tracking-tight animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            Construção estruturada e autoral de artigos científicos.
          </p>
        </div>
        
        <div className="flex gap-6 justify-center animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
          >
            Começar Agora
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            className="bg-white/5 border border-white/10 text-gray-300 px-10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            Metodologia
          </a>
        </div>

        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-in fade-in delay-500">
          <div className="space-y-2 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="font-bold text-blue-400">01. Estrutura</h3>
            <p className="text-gray-400 text-sm">Foque nos pilares científicos (Problema, Tese, Objetivos) antes de escrever.</p>
          </div>
          <div className="space-y-2 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="font-bold text-blue-400">02. Escrita Autoral</h3>
            <p className="text-gray-400 text-sm">Organize suas ideias em tasks modulares para facilitar a consolidação.</p>
          </div>
          <div className="space-y-2 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="font-bold text-blue-400">03. Validação IA</h3>
            <p className="text-gray-400 text-sm">Nossa IA aponta falhas formais sem alterar sua voz científica.</p>
          </div>
        </div>
      </div>
    </main>
  );
}


