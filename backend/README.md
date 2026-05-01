# Backend (Express + Firebase)

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your Firebase service account values.
3. Install dependencies:
   - `npm install`
4. Run in development:
   - `npm run dev`

## Endpoints

- `GET /api/health`
- `POST /api/auth/google` (verify Firebase ID token)
- `GET /api/auth/me` (requires bearer token)
- `GET /api/tasks` (requires bearer token)
- `POST /api/tasks` (requires bearer token)
- `PATCH /api/tasks/:id` (requires bearer token)
- `DELETE /api/tasks/:id` (requires bearer token)

## Authentication flow

1. Frontend signs in user with Google using Firebase Auth SDK.
2. Frontend gets ID token via `await user.getIdToken()`.
3. Frontend sends header:
   - `Authorization: Bearer <id_token>`
4. Backend verifies token using Firebase Admin.

## Example request bodies

For `POST /api/auth/google`:

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6I..."
}
```

For `POST /api/tasks`:

```json
{
  "title": "Sample task",
  "completed": false
}
```
