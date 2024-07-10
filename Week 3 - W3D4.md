# Week 3 - W3D4 | Lezione Serale (Giovedì 10 Luglio 2024)

## BACKEND -> Implementazione dell'autenticazione basata su token JWT (JSON Web Tokens)

### Installazione di dipendenze e generazione chiave JWT_SECRET

Prima di tutto, installiamo le dipendenze necessarie:

```
npm install bcrypt jsonwebtoken
```

Adesso dobbiamo creare una chiave **JWT_SECRET**: si tratta di una stringa segreta usata per firmare e verificare i JSON Web Tokens (JWT) nel tuo progetto.

Questa chiave non è fornita da un servizio esterno come MongoDB, Cloudinary o Mailgun. La JWT_SECRET è una chiave che devi generare tu stesso per il tuo progetto.

Ci sono diversi modi per generare una chiave del genere, vi dico il mio preferito.

Ci creiamo nella cartella `backend` un file `keyGenerator.js`:

```
import crypto from 'crypto';

console.log(crypto.randomBytes(64).toString('hex'));
```

Assicurandoci di essere, da terminale, nella cartella `backend`, lanciamo il seguente comando:

```
node keyGenerator.js
```

Otterremo così una chiave che potremo inserire nel nostro file `.env` come segue:

```
MONGODB_URI = ********
PORT = 5001

CLOUDINARY_CLOUD_NAME = ********
CLOUDINARY_API_KEY = ********
CLOUDINARY_API_SECRET = ********

MAILGUN_API_KEY = ********
MAILGUN_DOMAIN = ********

JWT_SECRET = chiave_appena_generata
```

### Creazione delle utility per JWT

Creiamo un file `utils/jwt.js`.

```javascript
// Importa la libreria jsonwebtoken per gestire i JSON Web Tokens
import jwt from "jsonwebtoken";

// Funzione per generare un token JWT
export const generateJWT = (payload) => {
  // Restituisce una Promise per gestire l'operazione in modo asincrono
  return new Promise((resolve, reject) =>
    // Utilizza il metodo sign di jwt per creare un nuovo token
    jwt.sign(
      payload, // Il payload contiene i dati che vogliamo includere nel token (es. ID utente)
      process.env.JWT_SECRET, // La chiave segreta usata per firmare il token, memorizzata nelle variabili d'ambiente
      { expiresIn: "1 day" }, // Opzioni: imposta la scadenza del token a 1 giorno
      (err, token) => {
        // Callback che gestisce il risultato dell'operazione
        if (err) reject(err); // Se c'è un errore, rifiuta la Promise
        else resolve(token); // Altrimenti, risolve la Promise con il token generato
      }
    )
  );
};

// Funzione per verificare un token JWT
export const verifyJWT = (token) => {
  // Restituisce una Promise per gestire l'operazione in modo asincrono
  return new Promise((resolve, reject) =>
    // Utilizza il metodo verify di jwt per decodificare e verificare il token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      // Callback che gestisce il risultato dell'operazione
      if (err) reject(err);
      // Se c'è un errore (es. token non valido), rifiuta la Promise
      else resolve(decoded); // Altrimenti, risolve la Promise con il payload decodificato
    })
  );
};
```

### Creazione del middleware di autenticazione

Creiamo un file `middlewares/authMiddleware.js`

```javascript
import { verifyJWT } from "../utils/jwt.js";
import Author from "../models/Author.js";

// Middleware di autenticazione
export const authMiddleware = async (req, res, next) => {
  try {
    // Estrai il token dall'header Authorization
    // L'operatore ?. (optional chaining) previene errori se authorization è undefined
    // replace('Bearer ', '') rimuove il prefisso 'Bearer ' dal token
    const token = req.headers.authorization?.replace("Bearer ", "");

    // Se non c'è un token, restituisci un errore 401 (Unauthorized)
    if (!token) {
      return res.status(401).send("Token mancante");
    }

    // Verifica e decodifica il token usando la funzione verifyJWT
    // Se il token è valido, decoded conterrà il payload del token (es. { id: '123' })
    const decoded = await verifyJWT(token);

    // Usa l'ID dell'autore dal token per trovare l'autore nel database
    // .select('-password') esclude il campo password dai dati restituiti
    const author = await Author.findById(decoded.id).select("-password");

    // Se l'autore non viene trovato nel database, restituisci un errore 401
    if (!author) {
      return res.status(401).send("Autore non trovato");
    }

    // Aggiungi l'oggetto author alla richiesta
    // Questo rende i dati dell'autore disponibili per le route successive
    req.author = author;

    // Passa al prossimo middleware o alla route handler
    next();
  } catch (error) {
    // Se c'è un errore durante la verifica del token o nel trovare l'autore,
    // restituisci un errore 401
    res.status(401).send("Token non valido");
  }
};
```

### Aggiorniamo il modello Author

Aggiorniamo lo Schema di Author per includere la password criptata:

```javascript
import mongoose from "mongoose";
import bcrypt from "bcrypt"; // NEW!

const authorSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dataDiNascita: { type: String, required: true },
    avatar: { type: String },
    password: { type: String, required: true }, // NEW!
  },
  {
    timestamps: true,
    collection: "authors",
  }
);

// NEW! Metodo per confrontare le password
authorSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// NEW! Middleware per l'hashing delle password prima del salvataggio
authorSchema.pre("save", async function (next) {
  // Esegui l'hashing solo se la password è stata modificata (o è nuova)
  if (!this.isModified("password")) return next();

  try {
    // Genera un salt e hash la password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Author", authorSchema);
```

> SPIEGAZIONE:
>
> Abbiamo aggiunto il metodo comparePassword allo schema. Questo metodo utilizzerà bcrypt per confrontare una password candidata con quella hashata memorizzata nel database.
>
> Abbiamo aggiunto un middleware pre('save') che si attiva prima del salvataggio del documento. Questo middleware controlla se la password è stata modificata.
> Se è stata modificata, genera un salt e crea un hash della password, poi sostituisce la password in chiaro con quella hashata.
>
> L'uso di bcrypt.genSalt(10) indica che stiamo usando 10 round di salting, che è un buon compromesso tra sicurezza e performance.
>
> Queste modifiche assicurano che le password vengano sempre salvate in forma hashata nel database, che sia possibile confrontare una password fornita con quella hashata nel database e che l'hashing avvenga automaticamente quando un nuovo autore viene creato o quando la password viene modificata

### Modifica della POST per la creazione di un autore

Nel file `routes/authorRoutes` dobbiamo necessariamente modificare la POST per la creazione di un autore, in modo da gestire la password criptata.

```javascript
// NEW! POST /authors: crea un nuovo autore
router.post("/", async (req, res) => {
  try {
    // Crea una nuova istanza di Author con i dati dalla richiesta
    const author = new Author(req.body);

    // La password verrà automaticamente hashata grazie al middleware pre-save
    // che abbiamo aggiunto nello schema Author

    // Salva il nuovo autore nel database
    const newAuthor = await author.save();

    // Rimuovi la password dalla risposta per sicurezza
    const authorResponse = newAuthor.toObject();
    delete authorResponse.password;

    // Invia il nuovo autore creato come risposta JSON con status 201 (Created)
    res.status(201).json(authorResponse);
  } catch (err) {
    // In caso di errore (es. validazione fallita), invia una risposta di errore
    res.status(400).json({ message: err.message });
  }
});
```

Questa modifica sfrutta il middleware **pre-save** che abbiamo aggiunto allo schema `Author`, che si occuperà automaticamente di hashare la password prima del salvataggio nel db.

### Implementiamo nuove rotte

Creiamo un nuovo file `routes/authRoutes.js` ed aggiungiamo due rotte:

```javascript
import express from "express";
import Author from "../models/Author.js";
import { generateJWT } from "../utils/jwt.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /login => restituisce token di accesso
router.post("/login", async (req, res) => {
  try {
    // Estrae email e password dal corpo della richiesta
    const { email, password } = req.body;

    // Cerca l'autore nel database usando l'email
    const author = await Author.findOne({ email });
    if (!author) {
      // Se l'autore non viene trovato, restituisce un errore 401
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    // Verifica la password usando il metodo comparePassword definito nel modello Author
    const isMatch = await author.comparePassword(password);
    if (!isMatch) {
      // Se la password non corrisponde, restituisce un errore 401
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    // Se le credenziali sono corrette, genera un token JWT
    const token = await generateJWT({ id: author._id });

    // Restituisce il token e un messaggio di successo
    res.json({ token, message: "Login effettuato con successo" });
  } catch (error) {
    // Gestisce eventuali errori del server
    console.error("Errore nel login:", error);
    res.status(500).json({ message: "Errore del server" });
  }
});

// GET /me => restituisce l'autore collegato al token di accesso
// authMiddleware verifica il token e aggiunge i dati dell'autore a req.author
router.get("/me", authMiddleware, (req, res) => {
  // Converte il documento Mongoose in un oggetto JavaScript semplice
  const authorData = req.author.toObject();
  // Rimuove il campo password per sicurezza
  delete authorData.password;
  // Invia i dati dell'autore come risposta
  res.json(authorData);
});

export default router;
```

### Modifica di `server.js` per includere le nuove rotte di autenticazione

```javascript
// [altri import]
import authRoutes from "./routes/authRoutes.js"; // NEW! Rotte per l'autenticazione

// [altro codice]

// Definizione delle rotte principali
app.use("/api/auth", authRoutes); // NEW! Rotte per l'autenticazione
app.use("/api/authors", authorRoutes);
app.use("/api/blogPosts", blogPostRoutes);

// [il resto del codice rimane lo stesso]
```

### Modifichiamo `blogPostRoutes.js` per utilizzare il middleware di autenticazione su tutte le rotte tranne la GET a tutti i post e la GET ad un singolo post

```javascript
// [altri import]
import { authMiddleware } from "../middlewares/authMiddleware.js"; // NEW! middleware di autenticazione

// Sotto la rotta GET ad un singolo post inseriamo quanto segue:

// NEW! Proteggi le altre rotte con il middleware di autenticazione
router.use(authMiddleware);
```

## FRONTEND -> Implementazione dell'autenticazione basata su token JWT (JSON Web Tokens)

Dobbiamo adeguare il nostro frontend alla situazione attuale: creare le pagine di registrazione e login (_Dopo un login effettuato con successo, memorizzare il token di accesso nel localStorage e redirezionare l'utente alla homepage, usando il token ovunque sia necessario_) e modificare i componenti per adattarli alla situazione attuale, tipo aggiornare la navbar, la creazione di un post (_che prenda automaticamente la mail dell'utente loggato_) come la pagina di dettaglio dei post (_i commenti prendono automaticamente la mail dell'utente loggato_).

### Aggiornamento del file `api.js` per includere nuove funzioni

```javascript
// [codice esistente]

// NEW! Funzione per registrare un nuovo utente
export const registerUser = (userData) => api.post("/authors", userData);

// NEW: Funzione per effettuare il login di un utente
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials); // Effettua la richiesta di login
    console.log("Risposta API login:", response.data); // Log della risposta per debugging
    return response.data; // Restituisce i dati della risposta
  } catch (error) {
    console.error("Errore nella chiamata API di login:", error); // Log dell'errore per debugging
    throw error; // Lancia l'errore per essere gestito dal chiamante
  }
};

// NEW: Funzione per ottenere i dati dell'utente attualmente autenticato
export const getMe = () =>
  api.get("/auth/me").then((response) => response.data);

// Funzione per ottenere i dati dell'utente attualmente autenticato con gestione degli errori
export const getUserData = async () => {
  try {
    const response = await api.get("/auth/me"); // Effettua la richiesta per ottenere i dati dell'utente
    return response.data; // Restituisce i dati della risposta
  } catch (error) {
    console.error("Errore nel recupero dei dati utente:", error); // Log dell'errore per debugging
    throw error; // Lancia l'errore per essere gestito dal chiamante
  }
};

// Esporta l'istanza di axios configurata per essere utilizzata altrove nel progetto
export default api;
```

### Creazione della pagina di registrazione `src/pages/Register.jsx`

```jsx
import { useState } from "react"; // Importa il hook useState da React per gestire lo stato del componente
import { useNavigate } from "react-router-dom"; // Importa useNavigate da react-router-dom per navigare tra le pagine
import { registerUser } from "../services/api"; // Importa la funzione registerUser dal file api.js per effettuare la registrazione

export default function Register() {
  // Definisce lo stato del form con useState, inizializzato con campi vuoti
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    password: "",
    dataDiNascita: "",
  });

  const navigate = useNavigate(); // Inizializza useNavigate per poter navigare programmaticamente

  // Gestore per aggiornare lo stato quando i campi del form cambiano
  const handleChange = (e) => {
    // Aggiorna il campo corrispondente nello stato con il valore attuale dell'input
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestore per la sottomissione del form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene il comportamento predefinito del form di ricaricare la pagina
    try {
      await registerUser(formData); // Chiama la funzione registerUser con i dati del form
      alert("Registrazione avvenuta con successo!"); // Mostra un messaggio di successo
      navigate("/login"); // Naviga alla pagina di login dopo la registrazione
    } catch (error) {
      console.error("Errore durante la registrazione:", error); // Logga l'errore in console
      alert("Errore durante la registrazione. Riprova."); // Mostra un messaggio di errore
    }
  };

  return (
    <div className="container">
      <h2>Registrazione</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cognome"
          placeholder="Cognome"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dataDiNascita"
          onChange={handleChange}
          required
        />
        <button type="submit">Registrati</button>
      </form>
    </div>
  );
}
```

### Creazione della pagina di login `src/pages/Login.jsx`

```jsx
import { useState } from "react"; // Importa il hook useState da React per gestire lo stato
import { useNavigate } from "react-router-dom"; // Importa useNavigate da react-router-dom per navigare programmaticamente
import { loginUser } from "../services/api"; // Importa la funzione API per effettuare il login

export default function Login() {
  const [formData, setFormData] = useState({
    email: "", // Stato iniziale del campo email
    password: "", // Stato iniziale del campo password
  });
  const navigate = useNavigate(); // Inizializza il navigatore per cambiare pagina

  // Gestore del cambiamento degli input del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); // Aggiorna lo stato del form con i valori degli input
  };

  // Gestore dell'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene il comportamento predefinito del form di ricaricare la pagina
    try {
      const response = await loginUser(formData); // Chiama la funzione loginUser per autenticare l'utente
      localStorage.setItem("token", response.token); // Memorizza il token di autenticazione nel localStorage
      // Trigger l'evento storage per aggiornare la Navbar
      window.dispatchEvent(new Event("storage")); // Scatena un evento di storage per aggiornare componenti come la Navbar
      alert("Login effettuato con successo!"); // Mostra un messaggio di successo
      navigate("/"); // Naviga alla pagina principale
    } catch (error) {
      console.error("Errore durante il login:", error); // Logga l'errore in console
      alert("Credenziali non valide. Riprova."); // Mostra un messaggio di errore
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Accedi</button>
      </form>
    </div>
  );
}
```

### Aggiorniamo `App.jsx` per includere le nuove rotte

```jsx
import Register from "./pages/Register";
import Login from "./pages/Login";

// [il resto del codice rimane lo stesso]

<Routes>
  <Route path="/register" element={<Register />} />
  <Route path="/login" element={<Login />} />
  {/* [altre rotte] */}
</Routes>;

// [il resto del codice rimane lo stesso]
```

### Aggiorniamo la Navbar in `Navbar.jsx` per includere i link di login/registrazione

```jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Controlla se esiste un token nel localStorage
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    // Controlla lo stato di login all'avvio
    checkLoginStatus();

    // Aggiungi un event listener per controllare lo stato di login
    window.addEventListener("storage", checkLoginStatus);

    // Rimuovi l'event listener quando il componente viene smontato
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Blog App
        </Link>

        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link to="/create" className="nav-link">
                  Nuovo Post
                </Link>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Registrati
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
```

### Aggiorniamo nuovamente `api.js` per includere il token in tutte le richieste autenticate

```javascript
// [il resto del codice rimane lo stesso]
// dopo const api ...
// NEW! Aggiungi un interceptor per includere il token in tutte le richieste
api.interceptors.request.use(
  (config) => {
    // Recupera il token dalla memoria locale
    const token = localStorage.getItem("token");
    if (token) {
      // Se il token esiste, aggiungilo all'header di autorizzazione
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Token inviato:", token); // Log del token inviato per debugging
    }
    return config; // Restituisce la configurazione aggiornata
  },
  (error) => {
    // Gestisce eventuali errori durante l'invio della richiesta
    return Promise.reject(error);
  }
);

// [il resto del codice rimane lo stesso]
```

### Aggiorniamo la pagina `CreatePost.jsx` per utilizzare automaticamente l'email dell'utente loggato

```jsx
// NEW! Importa, oltre a useState anche useEffect
import { useState, useEffect } from "react";
// [altri import]
// NEW! Importo anche getMe dalle api
import { createPost, getMe } from "../services/api";

// [il resto del codice rimane lo stesso]
const navigate = useNavigate();

// NEW! useEffect per l'autenticazione
useEffect(() => {
  const fetchUserEmail = async () => {
    try {
      const userData = await getMe();
      setPost((prevPost) => ({ ...prevPost, author: userData.email }));
    } catch (error) {
      console.error("Errore nel recupero dei dati utente:", error);
      navigate("/login");
    }
  };
  fetchUserEmail();
}, [navigate]);

// [il resto del codice rimane lo stesso]

// [nel form, all'input della mail, aggiungiamo un valore di default che sia uguale all'email dell'utente loggato, togliamo l'onChange ed il required e lo rendiamo readOnly]
<input
  type="email"
  id="author"
  name="author"
  value={post.author}
  // onChange={handleChange}
  // required
  readOnly
/>;
```

### Aggiorniamo la pagina `PostDetail.jsx` per utilizzare automaticamente l'email dell'utente loggato nei commenti che andiamo ad inserire

```jsx
import { useState, useEffect } from "react"; // Importa i hook useState e useEffect da React
import { useParams, Link } from "react-router-dom"; // Importa useParams e Link da react-router-dom per gestire i parametri dell'URL e creare link
import { getPost, getComments, addComment, getUserData } from "../services/api"; // Importa le funzioni API per interagire con il backend
import "./PostDetail.css"; // Importa il file CSS per il componente PostDetail

export default function PostDetail() {
  const [post, setPost] = useState(null); // Stato per memorizzare i dati del post
  const [comments, setComments] = useState([]); // Stato per memorizzare i commenti del post
  const [newComment, setNewComment] = useState({ content: "" }); // Stato per il nuovo commento da aggiungere
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Stato per verificare se l'utente è loggato
  const [userData, setUserData] = useState(null); // Stato per memorizzare i dati dell'utente
  const { id } = useParams(); // Ottiene l'ID del post dai parametri dell'URL

  // Effettua il fetch dei dati del post e dei commenti al caricamento del componente
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await getPost(id); // Ottiene i dati del post dall'API
        setPost(postData); // Imposta i dati del post nello stato
      } catch (error) {
        console.error("Errore nel caricamento del post:", error); // Logga l'errore in console
      }
    };

    const fetchComments = async () => {
      try {
        const commentsData = await getComments(id); // Ottiene i commenti del post dall'API
        setComments(commentsData); // Imposta i commenti nello stato
      } catch (error) {
        console.error("Errore nel caricamento dei commenti:", error); // Logga l'errore in console
      }
    };

    const checkAuthAndFetchUserData = async () => {
      const token = localStorage.getItem("token"); // Recupera il token di autenticazione dalla memoria locale
      if (token) {
        setIsLoggedIn(true); // Imposta lo stato di autenticazione a true
        try {
          const data = await getUserData(); // Ottiene i dati dell'utente autenticato dall'API
          setUserData(data); // Imposta i dati dell'utente nello stato
          fetchComments(); // Carica i commenti del post
        } catch (error) {
          console.error("Errore nel recupero dei dati utente:", error); // Logga l'errore in console
          setIsLoggedIn(false); // Imposta lo stato di autenticazione a false
        }
      } else {
        setIsLoggedIn(false); // Imposta lo stato di autenticazione a false
      }
    };

    fetchPost(); // Carica i dati del post al caricamento del componente
    checkAuthAndFetchUserData(); // Verifica l'autenticazione e carica i dati dell'utente
  }, [id]); // Effettua nuovamente l'effetto quando l'ID del post cambia

  // Gestore per la sottomissione del nuovo commento
  const handleCommentSubmit = async (e) => {
    e.preventDefault(); // Previene il comportamento predefinito del form di ricaricare la pagina
    if (!isLoggedIn) {
      console.error("Devi effettuare il login per commentare."); // Logga un messaggio di errore se l'utente non è loggato
      return;
    }
    try {
      const commentData = {
        content: newComment.content, // Contenuto del nuovo commento
        name: `${userData.nome} ${userData.cognome}`, // Nome dell'utente
        email: userData.email, // Email dell'utente
      };
      const newCommentData = await addComment(id, commentData); // Invia il nuovo commento all'API

      // Genera un ID temporaneo se l'API non restituisce un ID in tempo
      if (!newCommentData._id) {
        newCommentData._id = Date.now().toString();
      }
      setComments((prevComments) => [...prevComments, newCommentData]); // Aggiunge il nuovo commento alla lista dei commenti
      setNewComment({ content: "" }); // Resetta il campo del nuovo commento
    } catch (error) {
      console.error("Errore nell'invio del commento:", error); // Logga l'errore in console
      alert(
        `Errore nell'invio del commento: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  if (!post) return <div>Caricamento...</div>; // Mostra un messaggio di caricamento se i dati del post non sono ancora stati caricati

  // Rendering del componente
  return (
    <div className="container">
      <article className="post-detail">
        {/* Immagine di copertina del post */}
        <img src={post.cover} alt={post.title} className="post-cover" />
        {/* Titolo del post */}
        <h1>{post.title}</h1>
        {/* Dati del post */}
        <div className="post-meta">
          <span>Categoria: {post.category}</span>
          <span>Autore: {post.author}</span>
          <span>
            Tempo di lettura: {post.readTime.value} {post.readTime.unit}
          </span>
        </div>
        {/* Contenuto del post */}
        {/* dangerouslySetInnerHTML, come nel template originario che ci ha dato EPICODE è usato per renderizzare HTML "RAW", usare con cautela!!!! */}
        <div
          className="comment-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Sezione commenti */}
        <h3 className="comment-section-title">Commenti</h3>
        {comments.map((comment) => (
          <div key={comment._id} className="comment">
            <p>{comment.content}</p>
            <small>Di: {comment.name}</small>
          </div>
        ))}

        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment.content}
              onChange={(e) =>
                setNewComment({ ...newComment, content: e.target.value })
              }
              placeholder="Scrivi un commento..."
            />
            <button type="submit">Invia commento</button>
          </form>
        ) : (
          <p className="no-logged-section">
            <Link to="/login">Accedi</Link> per visualizzare o lasciare
            commenti.
          </p>
        )}
      </article>
    </div>
  );
}
```
