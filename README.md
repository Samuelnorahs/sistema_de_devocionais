# Deus Proverá — Plataforma de Devocionais Semanais ICDP

Sistema web que transforma a pregação de domingo (áudio) em 6 devocionais diários (segunda a sábado), usando transcrição automática e IA generativa, com revisão humana antes da publicação.

**Cultura:** Domingo recebemos a Palavra · Segunda a sábado vivemos a Palavra

## Stack

- **Next.js 15** (App Router) — frontend + backend
- **TypeScript** + **Tailwind CSS**
- **PostgreSQL** + **Prisma ORM**
- **NextAuth** — autenticação admin
- **OpenAI** — Whisper (transcrição) + GPT (análise e geração)
- Pipeline assíncrono com fila baseada em banco de dados

## Pré-requisitos

- Node.js 20+
- Docker (para PostgreSQL local)

## Configuração

```bash
# 1. Instalar dependências
npm install

# 2. Subir o banco de dados
docker compose up -d

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Rodar migrations e seed
npm run db:push
npm run db:seed

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse:
- **Site público:** http://localhost:3000
- **Painel admin:** http://localhost:3000/admin/login

### Credenciais padrão (seed)

- Email: `admin@icdp.org`
- Senha: `admin123`

## Modo de desenvolvimento sem OpenAI

Se `OPENAI_API_KEY` não estiver configurada, o sistema usa dados simulados (mock) para transcrição, análise e geração de devocionais. Isso permite testar todo o fluxo sem custo de API.

## Fluxo de uso

1. **Equipe de mídia** faz upload do áudio no painel admin
2. O pipeline processa automaticamente: transcrição → análise → geração dos 6 devocionais
3. **Pastor/revisor** edita e aprova cada devocional
4. Após aprovação, a "Palavra da Semana" fica pública no site
5. **Membros** acessam o devocional do dia (mobile-first)

## Papéis de acesso

| Papel | Permissões |
|---|---|
| Equipe | Upload de áudio, acompanhar processamento |
| Pastor | Editar e aprovar devocionais |
| Admin | Todas as permissões + gestão de usuários |

## Estrutura do projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx            # Home pública
│   ├── palavra-da-semana/  # Palavra da semana
│   ├── devocional/         # Devocional por dia
│   ├── historico/          # Histórico público
│   └── admin/              # Painel administrativo
├── actions/                # Server Actions
├── components/             # Componentes React
└── lib/                    # Utilitários, auth, pipeline, OpenAI
prisma/
└── schema.prisma           # Modelagem de dados
```

## Deploy

Recomendado: **Vercel** (frontend/backend) + **Neon/Supabase** (PostgreSQL) + **Cloudflare R2** (storage de áudio).

Configure as variáveis de ambiente de produção conforme `.env.example`.

## Licença

Projeto privado — Igreja Cristã Deus Proverá (ICDP).
