# Mahavir Farsan Mart Web

Vite, React, and TypeScript app for the public site and admin. This project is its own repository. The API lives in a separate repository.

## Setup

```powershell
npm ci
copy .env.example .env
```

`.env` sets `VITE_API_URL`. The default is `http://localhost:8000`.

## Run

```powershell
npm run dev
```

Open http://localhost:5173. The status page calls the API health check.

## Tests

```powershell
npx tsc --noEmit
npm test
```
