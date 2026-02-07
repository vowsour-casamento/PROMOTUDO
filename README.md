# Promotudo - Comparador de Preços e Produtos

Sistema web completo de comparação de preços e produtos para uso privado, com arquitetura profissional e escalável.

## 🎯 Objetivo

Comparador de produtos e preços semelhante a Zoom/Promobit, porém:
- Uso pessoal e privado
- Sem monetização
- Acessado via site responsivo (com PWA)
- Backend centralizado
- Dados armazenados no Supabase

## 🏗️ Arquitetura

```
promotudo/
├── frontend/                 # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── services/       # Serviços de API
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilitários
│   ├── public/
│   └── package.json
├── backend/                  # Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/    # Controladores de API
│   │   ├── services/       # Lógica de negócio
│   │   ├── adapters/       # Adapters de APIs externas
│   │   ├── models/         # Modelos de dados
│   │   ├── jobs/           # Jobs agendados
│   │   └── utils/          # Utilitários
│   ├── package.json
│   └── tsconfig.json
├── database/                # Schema Supabase
│   ├── migrations/
│   └── seed.sql
└── docs/                   # Documentação
```

## 🚀 Funcionalidades Principais

### 1. Busca de Produtos
- Campo de busca por termos genéricos
- Filtros dinâmicos (categoria, marca, preço, loja, desconto)
- Ordenação por preço e desconto
- Busca indireta via backend

### 2. Histórico de Preços
- Registro contínuo de preços
- Visualização de menor preço histórico
- Gráficos de variação de preço
- Dados nunca apagados automaticamente

### 3. Sistema de Alertas
- Alertas por preço mínimo
- Notificação de novos mínimos históricos
- Alertas de promoções
- Notificações via e-mail e PWA

### 4. Comparador A x B
- Comparação lado a lado de produtos
- Especificações técnicas detalhadas
- Destaque automático de diferenças
- Categorias: Celular, Micro-ondas, Geladeira

### 5. Enriquecimento Automático
- Busca de especificações técnicas
- Sistema de jobs em background
- Cache permanente
- Normalização de dados

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **React Query** para cache de dados
- **React Router** para navegação
- **Zustand** para estado global
- **PWA** com service worker

### Backend
- **Node.js** com TypeScript
- **Express.js** framework
- **Supabase** como banco de dados
- **node-cron** para jobs agendados
- **Axios** para requisições HTTP
- **Winston** para logging

### Banco de Dados
- **PostgreSQL** via Supabase
- **Row Level Security**
- **Auth** integrado
- **Realtime subscriptions**

## 📋 Tabelas do Banco

```sql
-- Usuários
users (id, email, created_at)

-- Produtos
products (id, external_id, store, name, category, brand, url, image, created_at)

-- Preços
prices (id, product_id, current_price, old_price, discount_percent, recorded_at)

-- Favoritos
favorites (id, user_id, product_id, created_at)

-- Alertas
alerts (id, user_id, product_id, price_threshold, alert_type, active, created_at)

-- Categorias
categories (id, name, slug, description)

-- Atributos
attributes (id, category_id, name, type, required)

-- Atributos dos Produtos
product_attributes (id, product_id, attribute_id, value, source)

-- Jobs de Enriquecimento
spec_fetch_jobs (id, product_id, status, attempts, last_attempt, created_at)
```

## 🔧 Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Chaves de APIs das lojas

### Instalação
```bash
# Clonar repositório
git clone <repositório>
cd promotudo

# Instalar dependências
npm run install:all

# Configurar variáveis de ambiente
cp .env.example .env

# Configurar banco de dados
npm run db:setup

# Iniciar desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# APIs Externas
AMERICANAS_API_KEY=your_key
MAGAZINE_LUIZA_API_KEY=your_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 📱 PWA

O sistema está preparado para funcionar como Progressive Web App:
- Manifest.json configurado
- Service worker para cache
- Design responsivo mobile-first
- Notificações push

## 🔒 Segurança

- Nenhuma API externa chamada diretamente pelo frontend
- Chaves de API protegidas no backend
- Row Level Security no Supabase
- Rate limiting nas requisições
- Validação de entrada de dados

## 📊 Performance

- Cache intensivo de dados
- Jobs em background
- Lazy loading de componentes
- Otimização de imagens
- Bundle splitting

## 🚨 Limitações

- Uso estritamente pessoal
- Sem scraping pesado
- Baixa frequência de requisições
- Sem monetização
- Não publicado em lojas de apps

## 📝 Licença

Uso privado e pessoal.

---

**Desenvolvido com ❤️ para uso pessoal**
