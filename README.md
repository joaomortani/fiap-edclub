# EdClub Monorepo
- apps/web: Next.js 14 (App Router + Tailwind)
- apps/mobile: Expo + React Native
- packages/shared: tipos e utilidades

## Dev
nvm use
npm i
npm run dev:web
npm run dev:mobile
npm run dev:backend

### Variáveis de ambiente

Configure os aplicativos web e mobile com a URL do backend BFF (Next.js) através das seguintes variáveis:

- `NEXT_PUBLIC_BACKEND_URL` no app web (ex.: `http://localhost:4000`).
- `EXPO_PUBLIC_BACKEND_URL` no app mobile.

Certifique-se de iniciar o backend (`npm run dev:backend`) e apontar essas variáveis para o endereço correto.
