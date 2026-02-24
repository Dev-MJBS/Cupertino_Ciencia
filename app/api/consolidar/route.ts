import { adminDb } from '@/lib/firebase/server'
import { getSession } from '@/app/auth/actions'
import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

export async function POST(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const topicId = formData.get('topicId') as string

  try {
    const topicDoc = await adminDb.collection('topics').doc(topicId).get()
    const tasksSnapshot = await adminDb.collection('topics').doc(topicId).collection('tasks').orderBy('createdAt', 'asc').get()

    if (!topicDoc.exists) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 })
    }

    const topic = topicDoc.data()
    if (topic?.userId !== user.uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const structure = topic.structure || {}
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))

    if (tasks.length === 0) {
      return NextResponse.json({ error: 'Adicione pelo menos uma Task antes de consolidar o artigo.' }, { status: 400 })
    }

    const prompt = `
    Você é um editor acadêmico sênior. Consolide o material fornecido em um texto científico fluído e organizado, sem criar conteúdo original.
    
    DADOS DA ESTRUTURA:
    Título: ${topic.title}
    Problema: ${structure.problema || 'Não definido'}
    Delimitação: ${structure.delimitacao || 'Não definida'}
    Justificativa: ${structure.justificativa || 'Não definida'}
    Objetivo: ${structure.objetivo || 'Não definido'}
    Tese: ${structure.tese || 'Não definida'}
    Conclusão Provisória: ${structure.conclusao_provisoria || 'Não definida'}
    
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
        "model": "google/gemini-2.0-flash-001", 
        "messages": [
          { "role": "system", "content": "Você é um formatador acadêmico rigoroso." },
          { "role": "user", "content": prompt }
        ]
      })
    })

    const aiResult = await response.json()
    
    if (!aiResult?.choices?.[0]?.message?.content) {
      console.error("OpenRouter Error:", aiResult)
      return NextResponse.json({ error: 'Falha na resposta da IA. Verifique seu saldo ou chave do OpenRouter.' }, { status: 500 })
    }

    const consolidatedText = aiResult.choices[0].message.content

    // Criar Documento Word do Artigo Consolidado
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
             text: topic.title,
             heading: HeadingLevel.HEADING_1,
             alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Artigo Consolidado via Ciência Pedagogia",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          // Dividir o texto consolidado em parágrafos para o Word
          ...consolidatedText.split('\n').map(line => {
            if (line.trim() === "") return new Paragraph({ text: "" });
            return new Paragraph({
              children: [new TextRun(line)],
              spacing: { after: 200 },
              alignment: AlignmentType.JUSTIFY,
            });
          }),
          new Paragraph({
            text: "\nEste documento é uma consolidação técnica dos rascunhos originais do autor.",
            alignment: AlignmentType.CENTER,
            spacing: { before: 1000 },
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Artigo_${topicId}.docx"`,
      },
    });

  } catch (error: any) {
    console.error("Consolidar Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
