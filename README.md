# 🧪 Ciência Pedagogia — Escrita Acadêmica Autoral

Uma plataforma moderna para a construção estruturada de artigos científicos, onde a **Inteligência Artificial (IA)** atua como um validador de rigor formal e organizador de linguagem, **sem nunca criar conteúdo novo ou fictício**.

O foco do projeto é a **Escrita Autoral**: o pesquisador fornece o conhecimento e a estrutura, enquanto o sistema garante a coesão lógica entre o Problema, a Tese e a Conclusão.

---

## ✨ Funcionalidades Principais

- **🛡️ Autenticação Segura:** Acesso simplificado via **Google OAuth** com sessões persistentes via cookies HTTP-only.
- **🏗️ Gestão de Estrutura:** Interface dedicada para definir o "esqueleto" científico (Problema de Pesquisa, Delimitação, Objetivo, Justificativa, Tese e Resolução).
- **✍️ Tasks de Escrita:** Divisão do artigo em blocos manejáveis (Tasks) para desenvolvimento orgânico do texto.
- **🔍 Verificador de Coerência (IA):** Análise via **Google Gemini 2.5/2.0** para apontar inconsistências lógicas na estrutura (ex: Tese que não responde ao Problema).
- **📄 Consolidação de Manuscrito (IA):** Transforma blocos de texto bruto em um manuscrito acadêmico fluído, mantendo estritamente a autoria original do pesquisador.
- **🌑 Interface Neon Dark:** Design focado em produtividade e redução de fadiga ocular durante longas sessões de escrita.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Backend/Auth:** [Firebase](https://firebase.google.com/) (Firestore NoSQL & Admin SDK)
- **IA Engine:** [OpenRouter](https://openrouter.ai/) (Modelos Gemini 2.5 Flash / Pro)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 🚀 Como Iniciar o Projeto

### 1. Pré-requisitos
- Node.js 18.x ou superior.
- Um projeto no [Firebase Console](https://console.firebase.google.com/).
- Uma chave de API do [OpenRouter](https://openrouter.ai/).

### 2. Configuração do Firebase
1. Ative o **Authentication** e habilite o provedor **Google**.
2. Ative o **Cloud Firestore** em modo produção.
3. Gere uma **Nova Chave Privada** em *Configurações do Projeto > Contas de Serviço* e salve o JSON para configurar as variáveis de ambiente.

### 3. Variáveis de Ambiente (`.env.local`)
Crie um arquivo `.env.local` na raiz com as seguintes chaves:

```dotenv
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...SUA_CHAVE...\n-----END PRIVATE KEY-----\n"

# IA Engine
OPENROUTER_API_KEY=your_openrouter_key
```

### 4. Execução
```bash
# Instalar dependências
npm install

# Iniciar ambiente de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver o resultado.

---

## 🧠 Filosofia do Projeto: "IA Não Criativa"

Diferente de ferramentas que geram texto artificialmente, o **Ciência Pedagogia** utiliza a IA apenas para:
1. **Validar:** Checar se os caminhos lógicos da pesquisa fazem sentido acadêmico.
2. **Organizar:** Melhorar a conexão entre parágrafos (coesão e coerência) sem alterar o significado ou injetar ideias externas.

O objetivo final é um artigo **100% autoral**, com auxílio tecnológico para garantir o rigor do método científico.

---

## 📄 Licença
Este projeto foi desenvolvido para fins pedagógicos e de incentivo à escrita acadêmica ética. Verifique os termos de uso dos modelos de IA antes de publicar textos consolidados em revistas científicas.

---
*Desenvolvido com foco no rigor acadêmico e na ética da pesquisa científica.*

