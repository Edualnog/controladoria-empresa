# Controladoria de Obras - Gestão Financeira

Sistema de gestão financeira para obras e construções. Controle receitas, despesas e lucros por projeto.

## Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Auth, Postgres, RLS)
- **Recharts** (gráficos)
- **Lucide React** (ícones)
- **date-fns** (datas)

## Funcionalidades

- ✅ Autenticação (login/cadastro) via Supabase
- ✅ Cadastro de empresas (criada junto com o registro)
- ✅ Usuários vinculados a empresa
- ✅ CRUD de Obras (projetos)
- ✅ CRUD de Categorias (INCOME | EXPENSE)
- ✅ Lançamento de receitas e despesas por obra
- ✅ Dashboard com:
  - Receita total, Despesa total, Lucro total
  - Lucro por obra (tabela)
  - Gráfico mensal Receitas vs Despesas
  - Gráfico de Lucro mensal
- ✅ RLS (Row Level Security) — cada usuário só vê dados da sua empresa
- ✅ Interface responsiva com tema escuro premium

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com) (para deploy)

## Setup Local

### 1. Clone o repositório

```bash
git clone <repo-url>
cd controladoria-empresa
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://app.supabase.com)
2. Copie a **URL** e **anon key** do projeto (Settings > API)
3. Crie o arquivo `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Preencha com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 4. Execute o SQL no Supabase

1. Abra o **SQL Editor** no painel do Supabase
2. Cole o conteúdo do arquivo `supabase-schema.sql`
3. Execute o script

Isso criará todas as tabelas, indexes, triggers e políticas de RLS.

### 5. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

1. Faça push do código para o GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/login & register     # Autenticação
│   ├── (dashboard)/                 # Páginas protegidas
│   │   ├── page.tsx                 # Dashboard
│   │   ├── projects/                # Obras
│   │   ├── categories/              # Categorias
│   │   └── transactions/            # Lançamentos
│   ├── actions.ts                   # Server Actions
│   └── auth/callback/               # Auth callback
├── components/
│   ├── charts/                      # Recharts wrappers
│   ├── layout/                      # Sidebar
│   └── ui/                          # Modal, ConfirmDialog
├── lib/
│   ├── supabase/                    # Client, Server, Middleware
│   ├── services/                    # CRUD services
│   └── utils.ts                     # Formatação, cálculos
├── types/                           # TypeScript interfaces
└── middleware.ts                    # Auth middleware
```

## Modelo de Dados

| Tabela | Descrição |
|---|---|
| `companies` | Empresas |
| `users` | Usuários (vinculados a auth.users e company) |
| `projects` | Obras/projetos |
| `categories` | Categorias (INCOME/EXPENSE) |
| `transactions` | Lançamentos financeiros |

Todas as tabelas possuem **Row Level Security** ativada, onde cada usuário só acessa dados da sua empresa.
