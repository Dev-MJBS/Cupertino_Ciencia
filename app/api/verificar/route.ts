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
Analise a coerência desta estrutura científica:

1. PROBLEMA: "${structure.problema}"
2. TESE: "${structure.tese}"
3. OBJETIVO GERAL: "${structure.objetivo}"

Sua resposta deve ser dividida em:
- [STATUS]: (Aprovado / Alerta / Inconsistente)
- [ANÁLISE]: Explique de forma técnica se a Tese resolve o Problema.
- [SUGESTÃO]: Aponte onde o autor deve ajustar a linguagem para manter o rigor.

IMPORTANTE: Não reescreva o texto. Apenas critique a lógica.
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": `http://localhost:3000`, // Use your site URL here
      "X-Title": "Ciência Pedagogia"
    },
    body: JSON.stringify({
      "model": "google/gemini-2.0-flash-001", 
      "messages": [
        { "role": "system", "content": "Você é um validador acadêmico rigoroso." },
        { "role": "user", "content": prompt }
      ]
    })
  })

  const aiResult = await response.json()
  const content = aiResult.choices[0].message.content

  // Parsing the custom format
  const statusMatch = content.match(/\[STATUS\]:\s*(.*)/i)
  const analiseMatch = content.match(/\[ANÁLISE\]:\s*([\s\S]*?)(?=\[SUGESTÃO\]|$)/i)
  const sugestaoMatch = content.match(/\[SUGESTÃO\]:\s*([\s\S]*?)$/i)

  const status = statusMatch ? statusMatch[1].trim() : "Indefinido"
  const analise = analiseMatch ? analiseMatch[1].trim() : content
  const sugestao = sugestaoMatch ? sugestaoMatch[1].trim() : ""

  const htmlResult = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Verificação Formal - Ciência Pedagogia</title>
      </head>
      <body class="bg-[#0a0a0a] text-white p-12 min-h-screen">
        <div class="max-w-3xl mx-auto bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.05] blur-3xl pointer-events-none"></div>
          
          <div class="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
            <h1 class="text-3xl font-black tracking-tighter">Relatório de Verificação</h1>
            <a href="/topic/${topicId}" class="text-sm text-gray-400 hover:text-white transition-colors">← Voltar para o Tema</a>
          </div>

          <div class="mb-10 p-6 rounded-2xl ${status.toLowerCase().includes('aprovado') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}">
            <span class="text-sm font-bold uppercase tracking-widest block mb-1">Status da Estrutura</span>
            <span class="text-2xl font-black uppercase">${status}</span>
          </div>

          <div class="space-y-8">
            <div class="p-8 bg-white/[0.03] border border-white/10 rounded-2xl">
              <h2 class="text-blue-500 font-black text-xs uppercase tracking-widest mb-4">Análise Técnica</h2>
              <div class="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">${analise}</div>
            </div>

            ${sugestao ? `
              <div class="p-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <h2 class="text-blue-400 font-black text-xs uppercase tracking-widest mb-4">Sugestão de Rigor</h2>
                <div class="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">${sugestao}</div>
              </div>
            ` : ''}
          </div>

          <div class="mt-12 pt-8 border-t border-white/10 text-xs text-center text-gray-600 font-bold tracking-widest uppercase">
            Sistema de Validação Acadêmica Ciência Pedagogia
          </div>
        </div>
      </body>
    </html>
  `

  return new NextResponse(htmlResult, {
    headers: { 'Content-Type': 'text/html' }
  })
}
