import { adminDb } from '@/lib/firebase/server'
import { getSession } from '@/app/auth/actions'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const topicId = formData.get('topicId') as string

  const topicDoc = await adminDb.collection('topics').doc(topicId).get()
  const tasksSnapshot = await adminDb.collection('topics').doc(topicId).collection('tasks').orderBy('createdAt', 'asc').get()

  if (!topicDoc.exists) {
    return NextResponse.json({ error: 'Data not found' }, { status: 404 })
  }

  const topic = topicDoc.data()
  if (topic?.userId !== user.uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const structure = topic.structure
  const tasks = tasksSnapshot.docs.map(doc => doc.data())

  const prompt = `
  Você é um editor acadêmico sênior. Consolide o material fornecido em um texto científico fluído e organizado, sem criar conteúdo original.
  
  DADOS DA ESTRUTURA:
  Título: ${topic.title}
  Problema: ${structure.problema}
  Delimitação: ${structure.delimitacao}
  Justificativa: ${structure.justificativa}
  Objetivo: ${structure.objetivo}
  Tese: ${structure.tese}
  Conclusão Provisória: ${structure.conclusao_provisoria}
  
  TASKS (SEU CONTEÚDO BRUTO):
  ${tasks?.map(t => `===== Task [${t.title}] =====\n${t.content}`).join('\n\n')}
  
  REGRAS CRÍTICAS DE CONSOLIDAÇÃO: [MUITO IMPORTANTE]
  1. ESTILO ACADÊMICO: Transforme a fala coloquial em linguagem culta (ex: de "eu vejo que" para "observa-se que"). Use formas impessoais.
  2. NORMAS ABNT: Padronize as referências no corpo do texto conforme a NBR 10520 (ex: (AUTOR, 2024)).
  3. FLUIDEZ: Garanta transições suaves entre as Tasks. Use conectivos acadêmicos (destarte, outrossim, todavia).
  4. NÃO INVENTE: Mantenha apenas os fatos, autores e dados que eu escrevi. Se houver lacunas, deixe o texto marcado, mas não crie informações fictícias.
  5. RIGOR: Mantenha a estrutura: Introdução (Problema/Objetivo) -> Desenvolvimento (Argumentos das Tasks) -> Conclusão (Reiteração da Tese).
  
  O RESULTADO DEVE SER O ARTIGO CONSOLIDADO EM FORMATO TEXTO PURO, PRONTO PARA REVISÃO FINAL.
  `

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": "Ciência Pedagogia"
    },
    body: JSON.stringify({
      "model": "google/gemini-pro", // Gemini Pro or any other reliable model
      "messages": [
        { "role": "system", "content": "Você é um formatador acadêmico que não inventa conteúdo." },
        { "role": "user", "content": prompt }
      ]
    })
  })

  const aiResult = await response.json()
  const consolidatedText = aiResult.choices[0].message.content

  const htmlResult = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Artigo Consolidado - Ciência Pedagogia</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville&family=Inter:wght@400;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .serif { font-family: 'Libre Baskerville', serif; }
        </style>
      </head>
      <body class="bg-[#0a0a0a] text-white p-12 min-h-screen">
        <div class="max-w-4xl mx-auto bg-white/5 border border-white/10 p-16 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div class="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 blur-3xl pointer-events-none rounded-full"></div>
          
          <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-8 border-b border-white/20 gap-6">
             <div>
               <span class="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-3 block">Manuscrito Acadêmico</span>
               <h1 class="text-5xl font-black tracking-tighter text-white">Consolidação Final</h1>
             </div>
             <a href="/topic/${topicId}" class="flex items-center gap-2 py-3 px-8 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all font-bold text-sm tracking-tight border border-white/10">
               ← Voltar para Painel
             </a>
          </div>

          <div class="serif text-xl leading-[1.8] text-gray-200 whitespace-pre-wrap selection:bg-blue-500/30 selection:text-white mb-16">
            ${consolidatedText}
          </div>

          <div class="mt-20 pt-10 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-loose">
              Gerado via Engine IA: Google Gemini 2.0<br/>
              Ciência Pedagogia • Processo Autoral Preservado
            </div>
            <div class="flex justify-end gap-4">
               <button onclick="window.print()" class="text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors">
                 [Imprimir Relatório]
               </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  return new NextResponse(htmlResult, {
    headers: { 'Content-Type': 'text/html' }
  })
}
