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
    
    if (!topicDoc.exists) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 })
    }

    const topic = topicDoc.data()
    if (topic?.userId !== user.uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const structure = topic.structure || {}

    const prompt = `
Analise a coerência desta estrutura científica:

1. PROBLEMA: "${structure.problema || 'Não definido'}"
2. TESE: "${structure.tese || 'Não definida'}"
3. OBJETIVO GERAL: "${structure.objetivo || 'Não definido'}"

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
        "HTTP-Referer": `http://localhost:3000`,
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
    
    if (!aiResult?.choices?.[0]?.message?.content) {
      console.error("OpenRouter Error:", aiResult)
      return NextResponse.json({ error: 'Falha na resposta da IA. Verifique sua chave.' }, { status: 500 })
    }

    const content = aiResult.choices[0].message.content
    // ... rest of logic for parsing and .docx generation
  } catch (error: any) {
    console.error("Verificar Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
  // Parsing the custom format
  const statusMatch = content.match(/\[STATUS\]:\s*(.*)/i)
  const analiseMatch = content.match(/\[ANÁLISE\]:\s*([\s\S]*?)(?=\[SUGESTÃO\]|$)/i)
  const sugestaoMatch = content.match(/\[SUGESTÃO\]:\s*([\s\S]*?)$/i)

  const status = statusMatch ? statusMatch[1].trim() : "Indefinido"
  const analise = analiseMatch ? analiseMatch[1].trim() : content
  const sugestao = sugestaoMatch ? sugestaoMatch[1].trim() : ""

  // Geração do Documento Word (docx)
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Relatório de Verificação Acadêmica",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Projeto: ${topic.title}`, bold: true }),
          ],
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Status: ", bold: true }),
            new TextRun({ 
              text: status.toUpperCase(), 
              color: status.toLowerCase().includes('aprovado') ? "00B050" : "FF0000" 
            }),
          ],
        }),
        new Paragraph({ text: "Análise Técnica", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
        new Paragraph({
          text: analise,
          spacing: { after: 200 },
        }),
        new Paragraph({ text: "Sugestões de Rigor", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
        new Paragraph({
          text: sugestao || "Nenhuma sugestão adicional detectada.",
        }),
        new Paragraph({
          text: "\nGerado automaticamente pelo Sistema Ciência Pedagogia",
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
      'Content-Disposition': `attachment; filename="Relatorio_${topicId}.docx"`,
    },
  });
}
