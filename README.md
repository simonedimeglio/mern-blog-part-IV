# MERN-APP: Fullstack Mern web app

Stack: MongoDB - Express.js - React (Vite) - Node.js

Questa applicazione è un blog completo che utilizza React per il frontend e Node.js con Express per il backend.

Permette agli utenti di visualizzare, creare e interagire con i post del blog.

## Struttura del progetto

```
blog-app/
│
├── backend/
│   ├── middlewares/
│   │   ├── controlloMail.js
│   │   └── errorHandlers.js
│   │
│   ├── models/
│   │   ├── Author.js
│   │   └── BlogPost.js
│   │
│   ├── node_modules/
│   │
│   ├── routes/
│   │   ├── authorRoutes.js
│   │   └── blogPostRoutes.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── MIDDLEWARES.md
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── node_modules/
    │
    ├── public/
    │   └── vite.svg
    │
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── Navbar.css
    │   │
    │   ├── pages/
    │   │   ├── CreatePost.css
    │   │   ├── CreatePost.jsx
    │   │   ├── Home.css
    │   │   ├── Home.jsx
    │   │   ├── PostDetail.css
    │   │   └── PostDetail.jsx
    │   │
    │   ├── services/
    │   │   └── api.js
    │   │
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    │
    ├──  .eslintrc.cjs
    ├──  .gitignore
    ├──  index.html
    ├──  package-lock.json
    ├──  package.json
    ├──  README.md
    └──  vite.config.js
```
