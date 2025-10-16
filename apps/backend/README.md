# EdClub Backend BFF

Este projeto fornece uma camada BFF (Backend for Frontend) construída com Next.js para unificar o acesso da web e do mobile ao Supabase.

## Configuração

Crie um arquivo `.env.local` dentro de `apps/backend` (ou defina as variáveis de ambiente equivalentes) com os seguintes valores do seu projeto Supabase:

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Scripts

```bash
npm run dev --workspace backend    # inicia o servidor Next.js em modo desenvolvimento
npm run build --workspace backend  # gera a build de produção
npm run start --workspace backend  # inicia a build de produção
```

## Endpoints principais

- `POST /api/auth/login` — autentica usuários via Supabase e devolve os tokens de sessão.
- `GET /api/auth/profile` — retorna perfil básico e estatísticas agregadas do Supabase para o usuário autenticado.
- `GET /api/events` — lista eventos cadastrados.
- `GET /api/attendance` — retorna presenças do usuário; aceita `eventId` opcional.
- `POST /api/attendance` — marca/atualiza presença para um evento.
- `GET /api/badges` — lista badges disponíveis e, se houver, quando foram conquistadas.
- `POST /api/badges` — concede uma badge (restrito a usuários com papel `teacher`).
- `GET /api/posts` — recupera posts da comunidade.
- `POST /api/posts` — cria um post em nome do usuário autenticado.

Todas as rotas (exceto `health` e `auth/login`) exigem um header `Authorization: Bearer <token>` com o `access_token` do Supabase retornado pelo endpoint de login.
