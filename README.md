# SplitBuddy (MERN)

SplitBuddy is a full-stack expense splitting app built with:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB

## Features

- Landing page (Home)
- User signup/login
- Create groups
- Add members to groups
- Add expenses with equal split
- Add expenses with custom split
- View simplified "who owes whom" balances
- Record settlements
- Maintain full transaction history

## Project Structure

```text
splitBuddy/
  backend/
    package.json
    .env.example
    src/
      config/db.js
      controllers/
      models/
      routes/
      utils/
      server.js
  frontend/
    package.json
    vite.config.js
    index.html
    src/
      App.jsx
      api.js
      main.jsx
      styles.css
```

## Backend Setup

1. Go to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example` and update MongoDB URI.
4. Ensure `JWT_SECRET` is set in `.env`.
4. Start backend:
   ```bash
   node src/server.js
   ```

Backend runs on `http://localhost:5000`.

## Frontend Setup

1. Open new terminal and go to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:5173` and proxies API calls to backend.

## Routes

- `/` Home page
- `/signup` Signup page
- `/login` Login page
- `/dashboard` Protected app dashboard
