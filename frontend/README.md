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

## Componenti Frontend

1. **Navbar (Navbar.jsx)**

Fornisce la navigazione tra le pagine principali dell'applicazione.
Link per Home e Creazione Post.

2. **Home Page (Home.jsx)**

Visualizza una griglia di tutti i post del blog.
Ogni post è rappresentato da una card cliccabile con immagine, titolo e autore.
Utilizza getPosts da api.js per recuperare i dati.

3. **Pagina di Dettaglio Post (PostDetail.jsx)**

Mostra i dettagli completi di un singolo post.
Include titolo, immagine di copertina, contenuto, categoria, autore e tempo di lettura.
Utilizza getPost da api.js per recuperare i dati del post specifico.

4. **Pagina di Creazione Post (CreatePost.jsx)**

Form per la creazione di un nuovo post.
Include campi per titolo, categoria, contenuto, URL immagine di copertina, tempo di lettura e autore.
Utilizza createPost da api.js per inviare i dati al backend.

5. **Servizio API (api.js)**

Centralizza tutte le chiamate API.
Definisce l'URL base dell'API.
Fornisce funzioni per operazioni CRUD: getPosts, getPost, createPost, ecc.

## Backend

1. **Server (server.js)**

Configura l'applicazione Express.
Definisce le connessioni al database MongoDB.
Imposta le route per autori e post del blog.

2. **Modelli (Author.js, BlogPost.js)**

Definiscono la struttura dei dati per autori e post del blog.
Utilizzano Mongoose per l'interfaccia con MongoDB.

3. **Route (authorRoutes.js, blogPostRoutes.js)**

Definiscono gli endpoint API per le operazioni CRUD su autori e post.

## Flusso dell'Applicazione

- L'utente accede alla home page, che carica e visualizza tutti i post.
- L'utente può cliccare su un post per visualizzarne i dettagli.
- Dalla navbar, l'utente può navigare alla pagina di creazione di un nuovo post.
- Dopo la creazione di un post, l'utente viene reindirizzato alla home page.

## Setup/Installazione

- Clona questa repository.
- Installa le dipendenze per frontend e backend:

```bash
cd frontend && npm install
cd ../backend && npm install
```

- Configura il file .env nel backend con l'URL del tuo database MongoDB.
- Avvia il backend: cd backend && npm start
- Avvia il frontend: cd frontend && npm run dev
