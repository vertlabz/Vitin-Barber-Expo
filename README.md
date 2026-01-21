# Vitin-Barber-Expo

## Visão geral

Este projeto Expo roda no Android/iOS e Web usando o mesmo código-base, com
responsividade para telas mobile e desktop.

## Rodando localmente

No diretório `mobile/`:

```bash
npm install
```

```bash
npm run start
```

### Android/iOS

```bash
npm run android
```

```bash
npm run ios
```

### Web

```bash
npm run web
```

## Variáveis de ambiente

Crie um `.env` seguindo o exemplo em `mobile/.env.example`:

```
EXPO_PUBLIC_API_BASE_URL=https://beck-pied.vercel.app
```

## Deploy Web (Vercel)

Configure a Vercel apontando para o diretório `mobile/`.

- **Build command:** `npx expo export --platform web`
- **Output directory:** `dist`
- **Env var:** `EXPO_PUBLIC_API_BASE_URL=https://beck-pied.vercel.app`

O arquivo `mobile/vercel.json` já inclui rewrite para SPA.

## EAS Build (Android)

Os perfis estão definidos em `mobile/eas.json`:

```bash
eas build -p android --profile preview
```

```bash
eas build -p android --profile production
```
