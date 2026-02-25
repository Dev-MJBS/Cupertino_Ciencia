import { adminDb } from '@/lib/firebase/server'
import { getSession } from '@/app/auth/actions'
import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx'

// Função auxiliar para remover Markdown e formatar negritos no docx
function parseMarkdownToTextRuns(text: string): TextRun[] {
  // 1. Remover hashtags de cabeçalho no início da linha (ex: ### Título)
  let cleanLine = text.replace(/^#+\s+/g, '');
  
  // 2. Dividir por negritos (**texto**)
  const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
  
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remover os asteriscos e aplicar bold
      return new TextRun({
        text: part.slice(2, -2).replace(/[\*#]/g, ''), 
        bold: true,
      });
    }
    // Para partes não-negritas, apenas removemos caracteres markdown residuais
    return new TextRun(part.replace(/[*#]/g, ''));
  });
}

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
    Você é um Pesquisador Sênior em Pedagogia e Redator Acadêmico renomado, especialista em Análise Crítica de Instituições de Ensino. 
    Sua missão é consolidar os dados brutos das 'Tasks' em um Artigo Científico de alto nível acadêmico (entre 2.500 a 3.000 palavras), com linguagem densa e crítica social profunda.

    DADOS DA ESTRUTURA BASE:
    Título: ${topic.title}
    Tema: ${structure.problema || 'Pesquisa Pedagógica em Jataí'}
    Tese Central: ${structure.tese || 'A disparidade no acesso ao conhecimento técnico entre instituições públicas e privadas.'}
    
    TASKS (CONTEÚDO BRUTO PARA EXPANSÃO):
    ${tasks?.map(t => `===== Task [${t.title}] =====\n${t.content}`).join('\n\n')}
    
    DIRETRIZES DE REDAÇÃO SÊNIOR:
    1. EXPANSÃO E DENSIDADE: Para cada observação de campo em Jataí, escreva no mínimo 3 parágrafos robustos. Não resuma; disserte. Explore as nuances de cada detalhe encontrado.
    2. INTERTEXTUALIDADE OBRIGATÓRIA: Conecte os achados (ex: a predominância de livros espíritas na Municipal vs. Psicologia técnica no SESC) com teóricos da Pedagogia. 
       - Cite Paulo Freire ao falar da "democratização do saber" e "educação como prática da liberdade".
       - Utilize Lev Vygotsky para discutir a "mediação" e as ferramentas culturais de acesso ao conhecimento.
       - Aplique Bourdieu para tratar de "capital cultural" e reprodução social através das bibliotecas.
    3. DETALHAMENTO CRÍTICO: Descreva minuciosamente a barreira física e burocrática encontrada na Biblioteca Municipal de Jataí. Disserte sobre como essa barreira impacta negativamente na formação contínua do professor da rede pública e no desenvolvimento intelectual da comunidade local.
    4. TONALIDADE: Seja "prolixo no bom sentido acadêmico". Utilize um vocabulário rico, técnico e crítico. Evite frases curtas e simples; prefira o encadeamento lógico de argumentos complexos.

    ESTRUTURA OBRIGATÓRIA DO ARTIGO:
    - Título (Impactante e Acadêmico)
    - Resumo (Contexto, Objetivo, Metodologia e Conclusão)
       - [INSERIR QUEBRA DE PÁGINA]
    - Introdução (Problematização do acesso à informação em Jataí)
       - [INSERIR QUEBRA DE PÁGINA]
    - Referencial Teórico (Diálogo entre Freire, Vygotsky e a realidade das bibliotecas)
       - [INSERIR QUEBRA DE PÁGINA]
    - Metodologia (Estudo de Caso Comparativo em Jataí: Biblioteca Municipal vs. Biblioteca do SESC)
       - [INSERIR QUEBRA DE PÁGINA]
    - Resultados e Discussão (O contraste institucional, a curadoria de acervo e a segregação do conhecimento)
       - [INSERIR QUEBRA DE PÁGINA]
    - Conclusão (Reiteração da tese e sugestões de políticas públicas educacionais)
       - [INSERIR QUEBRA DE PÁGINA]
    - Referências (Listar autores citados conforme ABNT)

    REGRAS DO FORMATO: Retorne apenas o texto do artigo consolidado, pronto para ser transformado em .docx. Não adicione comentários externos.
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
    const docChildren: any[] = [
      new Paragraph({
         text: topic.title.toUpperCase(),
         heading: HeadingLevel.HEADING_1,
         alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: "Relatório de Consolidação Final",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    ];

    // Processar o texto e adicionar quebras de página em seções chave
    const lines = consolidatedText.split('\n');
    const sectionKeywords = ['RESUMO', 'INTRODUÇÃO', 'REFERENCIAL TEÓRICO', 'METODOLOGIA', 'RESULTADOS E DISCUSSÃO', 'CONCLUSÃO', 'REFERÊNCIAS'];

    lines.forEach((line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Verificar se a linha é um título de seção para inserir quebra de página
      const isHeader = sectionKeywords.some(kw => trimmed.toUpperCase().includes(kw) && trimmed.length < 40);
      
      if (isHeader) {
        if (docChildren.length > 3) { // Evita quebra de página no primeiro título
          docChildren.push(new Paragraph({ children: [new PageBreak()] }));
        }
        docChildren.push(new Paragraph({
          children: parseMarkdownToTextRuns(trimmed.toUpperCase()),
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.LEFT,
          spacing: { before: 400, after: 200 }
        }));
      } else {
        docChildren.push(new Paragraph({
          children: parseMarkdownToTextRuns(line),
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFY,
        }));
      }
    });

    docChildren.push(new Paragraph({
      text: "\nEste documento é uma consolidação técnica via Ciência Pedagogia.",
      alignment: AlignmentType.CENTER,
      spacing: { before: 1000 },
    }));

    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren,
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Artigo_Consolidado_${topicId}.docx"`,
      },
    });

  } catch (error: any) {
    console.error("Consolidar Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
