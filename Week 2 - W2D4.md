# Week 2 - W2D4 | Lezione Serale (Giovedì 4 Luglio 2024)

## UPLOAD DEI FILE (NO CLOUDINARY)

Vediamo come possiamo integrare l'upload di file nel progetto del blog che abbiamo sviluppato insieme. Questa funzionalità sarà particolarmente utile per caricare le immagini di copertina dei post. Ecco una spiegazione semplice e passo-passo su come implementare l'upload di file:

**Cosa è Multer? a cosa serve?** Multer è un middleware per express molto famoso, creato per gestire l'upload di file in web app.

### (A) Installiamo **Multer** nel nostro **backend**

```bash
npm install multer
```

### (B) Creiamo una cartella chiamata `uploads`

Questa cartella dovrebbe essere creata nella directory principale del progetto backend, (per capire, allo stesso livello del file `server.js`). Assicuriamoci che questa cartella abbia i permessi corretti per consentire al server di scrivere i file al suoi interno.

Se usi macOs lancia il seguente comando in terminale (accertati di essere nella cartella `backend`):

```bash
chmod 755 uploads
```

Windows gestisce i permessi in modo diverso. Generalmente, non è necessario modificare esplicitamente i permessi della cartella. In ogni caso, se hai problemi di accesso, puoi seguire questi passaggi:

1. Fai clic destro sulla cartella 'uploads'
2. Seleziona "Proprietà"
3. Vai alla scheda "Sicurezza"
4. Clicca su "Modifica"
5. Assicurati che l'utente che esegue l'applicazione (*solitamente il tuo utente*) abbia i permessi di "Lettura" e "Scrittura"

In alternativa, puoi usare il prompt dei comandi **come amministratore** ed eseguire questo comando:

```bash
icacls uploads /grant Users:(OI)(CI)F
```

> In questo modo dai il controllo completo alla cartella 'uploads' per tutti gli utenti.

### (C) Nella cartella `backend/middlewares` creiamo un nuovo file chiamato `upload.js`

```javascript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

export default upload;
```

### (D) Modifichiamo la route per la creazione dei post

Nel file `blogPostRoutes.js` modifichiamo la route **POST** per includere l'upload dei file:

```javascript
import upload from '../middlewares/upload.js';

// ...

// POST /blogPosts: crea un nuovo blog post (AGGIORNATA AD UPLOAD!)
router.post("/", upload.single("cover"), async (req, res) => {
  try {
    const postData = req.body;
    if (req.file) {
      // Ovviamente, attenzione alla porta che avete scelto (nel mio caso è la 5001)!!!
      postData.cover = `http://localhost:5001/uploads/${req.file.filename}`;
    }
    const newPost = new BlogPost(postData);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});
```

### (E) Aggiorniamo ora il `server.js`

Nel dettaglio, aggiungiamo la rotta per servire i "file statici"

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ...

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### (F) Passiamo ora al frontend

Nel nostro file `api.js` per includere un terzo argomento nell'chiamata api.post. Questo argomento è un oggetto di configurazione che specifica gli headers della richiesta. Imposteremo l'header 'Content-Type' su 'multipart/form-data'.

Questo è OBBLIGATORIO quando si invia FormData, (*che è ciò che stiamo usando per l'upload di file*).

```javascript
export const createPost = (postData) => api.post("/blogPosts", postData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

Le altre funzioni non verranno modificate, perchè non riguardano l'upload di file.

Se in futuro saremop chiamati ad aggiungere l'upload di file anche per updatePost, allora faremo una modifica simile anche per quella funzione.

### (G) Per quanto riguarda REACT

In questa repo ho modificato il componente `CreatePost.jsx` per adattare il form all'upload di file.

Ecco cosa faremo:

1. Aggiungeremo un nuovo stato chiamato `coverFile` per gestire il file di copertina del post.
2. Creeremo una nuova funzione `handleFileChange` per l'upload dei file.
3. Modificheremo `handleSubmit` per utilizzare `FormData` ed includere il file per la copertina.
4. Sostituiremo il campo di input per l'URL dell'immagine con un campo di tipo "file".

```jsx
// Importa useState hook da React
import { useState } from "react";
// Importa useNavigate da react-router-dom per la navigazione programmatica
import { useNavigate } from "react-router-dom";
// Importo la funzione createPost dal mio file services/api
import { createPost } from "../services/api";
// Importa il file CSS per gli stili specifici di questo componente
import "./CreatePost.css";

export default function CreatePost() {
  // Stato per memorizzare i dati del nuovo post
  const [post, setPost] = useState({
    title: "",
    category: "",
    content: "",
    readTime: { value: 0, unit: "minutes" },
    author: "",
  });

  // Nuovo stato per gestire il file di copertina
  const [coverFile, setCoverFile] = useState(null);

  // Hook per la navigazione
  const navigate = useNavigate();

  // Gestore per i cambiamenti nei campi del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "readTimeValue") {
      // Gestiamo il "readTime" del post
      setPost({
        ...post,
        readTime: { ...post.readTime, value: parseInt(value) },
      });
    } else {
      // Aggiornamento generale per gli altri campi
      setPost({ ...post, [name]: value });
    }
  };

  // Nuovo gestore per il cambiamento del file di copertina
  const handleFileChange = (e) => {
    setCoverFile(e.target.files[0]);
  };

  // Gestore per l'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Creiamo un oggetto FormData per inviare sia i dati del post che il file
      const formData = new FormData();
      
      // Aggiungiamo tutti i campi del post al FormData
      Object.keys(post).forEach(key => {
        if (key === 'readTime') {
          formData.append('readTime[value]', post.readTime.value);
          formData.append('readTime[unit]', post.readTime.unit);
        } else {
          formData.append(key, post[key]);
        }
      });

      // Aggiungiamo il file di copertina se presente
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      // Invia i dati del post al backend
      await createPost(formData);
      // Naviga alla rotta della home dopo la creazione del post
      navigate("/");
    } catch (error) {
      console.error("Errore nella creazione del post:", error);
    }
  };

  // Template del componente
  return (
    <div className="container">
      <h1>Crea un nuovo post</h1>
      <form onSubmit={handleSubmit} className="create-post-form">
        {/* Campo per il titolo */}
        <div className="form-group">
          <label>Titolo</label>
          <input
            type="text"
            id="title"
            name="title"
            value={post.title}
            onChange={handleChange}
            required
          />
        </div>
        {/* Campo per la categoria */}
        <div className="form-group">
          <label>Categoria</label>
          <input
            type="text"
            id="category"
            name="category"
            value={post.category}
            onChange={handleChange}
            required
          />
        </div>
        {/* Campo per il contenuto HTML */}
        <div className="form-group">
          <label>Contenuto</label>
          <textarea
            id="content"
            name="content"
            value={post.content}
            onChange={handleChange}
            required
          />
        </div>
        {/* Campo per l'upload del file di copertina */}
        <div className="form-group">
          <label>Immagine di copertina</label>
          <input
            type="file"
            id="cover"
            name="cover"
            onChange={handleFileChange}
            required
          />
        </div>
        {/* Campo per il tempo di lettura */}
        <div className="form-group">
          <label>Tempo di lettura (minuti)</label>
          <input
            type="number"
            id="readTimeValue"
            name="readTimeValue"
            value={post.readTime.value}
            onChange={handleChange}
            required
          />
        </div>
        {/* Campo per l'email dell'autore */}
        <div className="form-group">
          <label>Email autore</label>
          <input
            type="email"
            id="author"
            name="author"
            value={post.author}
            onChange={handleChange}
            required
          />
        </div>
        {/* Pulsante di invio */}
        <button type="submit" className="submit-button">
          Crea il post
        </button>
      </form>
    </div>
  );
}
```

## CLOUDINARY: cosa è? a cosa serve?

Cloudinary è un servizio cloud che offre soluzioni di gestione e ottimizzazione delle immagini e dei video.

Il suo utilizzo, rispetto al codice scritto sopra questa sezione, offre numerosi vantaggi:

1. Non dobbiamo gestire manualmente lo storage sul server (non gestiamo lo spazio sul server in questo modo!)
2. Abbiamo maggiori prestazioni e velocità del caricamento del sito (Cloudinary ottimizza automaticamente le immagini senza perdita di qualità).
3. Abbiamo accesso a funzionalità avanzate di gestione delle immagini (ridimensionamento, tagli, effetti ecc..).
4. Riduciamo il carico sul server principale  (immagini distribuite da una rete globale di server).
5. Abbiamo una soluzione scalabile per progetti che crescono nel tempo (Ridondanza per sicurezza, formati adattivi ecc..)

## UPLOAD DEI FILE (CON CLOUDINARY)

Visitiamo il sito *cloudinary.com*, registriamoci (anche con Github o Google). Dopo il login avremo accesso alla dashboard che ci offrirà tutte le informazioni di cui abbiamo bisogno per implementare Cloudinary nel nostro progetto.

### (A) Installiamo le dipendenze necessarie

```bash
npm install cloudinary multer-storage-cloudinary
```

### (B) Aggiorniamo il file `.env`

Dalla dashborad di Cloudinary, prendiamo `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` ed inseriamo questi dati nel nostro file `.env`:

```env
MONGODB_URI=mongodb+srv://utente:<password>@cluster0.rzsgan5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=5001

CLOUDINARY_CLOUD_NAME = tuo-cloud-name
CLOUDINARY_API_KEY = tua-api-key
CLOUDINARY_API_SECRET = tua-api-secret
```

### (C) Adesso configuriamo Claudinary

Creiamo un nuovo file chiamato `claudinaryConfig.js` dentro la cartella `backend/config`

```javascript
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog_covers", // Nome della cartella su Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "gif"], // Formati consentiti
  },
});

const cloudinaryUploader = multer({ storage: storage });

export default cloudinaryUploader;
```

### (D) Modifichiamo ora `blogPostRoutes.js`

Dobbiamo sostituire l'import di `upload` con il nuovo uploader di Cloudinary

```javascript
import cloudinaryUploader from '../config/cloudinaryConfig.js';

// ... 

router.post("/", cloudinaryUploader.single("cover"), async (req, res) => {
  try {
    const postData = req.body;
    if (req.file) {
      postData.cover = req.file.path; // Cloudinary restituisce l'URL direttamente
    }
    const newPost = new BlogPost(postData);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});
```

### (E) Aggiorniamo `server.js`

Rimuoviamo la configurazione per servire i file statici dalla cartella `uploads`, dato che ora non servirà più!

```bash
// Commenta questa riga, non serve più!
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### (F) Modifiche al frontend? Per questa volta, no grazie

Non è necessario apportare modifiche al componente REACT `CreatePost.jsx` nel frontend, in quanto Cloudinary viene gestito TOTALMENTE nel backend

### (G) Pulizia (?)

Se vuoi, rimuovi la cartella `uploads` che usavamo prima di cloudinary

## INVIO DI MAIL

Per l'invio di mail, utilizzeremo **Mailgun**: registriamoci all'indirizzo `https://signup.mailgun.com/new/signup` (NON inseriamo i dati di pagamento, il piano gratuito offre già 100 mail al giorno!).

> IMPORTANTE!!! Dopo la registrazione, dobbiamo confermare il nostro indirizzo mail (ci arriverà una mail con il link per confermare: poi inseriremo il numero di telefono perchè il servizio ci invierà un SMS con un codice da inserire)

(A) Installiamo le dipendenze necessarie: nella cartella `backend` lanciamo il seguente comando:

```bash
npm install mailgun-js
```

(B) Dalla dashboard di Mailgun, prendiamo una API KEY e la inseriamo nel nostro file `.env`

```env
MAILGUN_API_KEY = tua-api-key
MAILGUN_DOMAIN = tuo-mailgun-domain
```

> La MAILGUN_API_KEY la troviamo in dashboard sotto l'opzione "API keys", mentre il MAILGUN_DOMAIN lo troviamo dal menu di navigazione a sinistra, sotto "sending" e poi "domains". Solitamente è qualcosa come "sandbox123456789abcdef.mailgun.org"

(C) Configuriamo Mailgun: creiamo una cartella chiamata `services` ed all'interno inseriamo un file chiamato `emailService.js`

```javascript
import mailgun from 'mailgun-js';

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

export const sendEmail = async (to, subject, htmlContent) => {
  const data = {
    from: 'Nome del tuo blog <noreply@yourdomain.com>',
    to,
    subject,
    html: htmlContent
  };

  try {
    const response = await mg.messages().send(data);
    console.log('Email inviata con successo:', response);
    return response;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email:', error);
    throw error;
  }
};
```

(D) Ipotizziamo di voler inviare una mail all'utente che crea il post ogni volta che effettivamente un post viene creato. Ancora una volta siamo chiamati a modificare la rotta `post` di `blogPostRoutes.js`. Prima di fare ``

```javascript
// [... resto del codice ...]
  const htmlContent = `
    <h1>Il tuo post è stato pubblicato!</h1>
    <p>Ciao ${newPost.author},</p>
    <p>Il tuo post "${newPost.title}" è stato pubblicato con successo!</p>
    <p>Categoria: ${newPost.category}</p>
    <p>Grazie per il tuo contributo al blog!</p>
  `;

  await sendEmail(
    newPost.author, // Ovviamente assumendo che newPost.author sia l'email dell'autore
    "Il tuo post è stato correttamente pubblicato",
    htmlContent
  );

  // da qua continua il codice già presente
  res.status(201).json(newPost);
  // [... resto del codice ...]
```

(E) Quando si utilizza un account gratuito di Mailgun con un dominio sandbox, è necessario autorizzare *esplicitamente* gli indirizzi email dei destinatari.

Ecco come risolvere questo problema:

1. Accedi al tuo account Mailgun.
2. Nel menu di navigazione a sinistra, clicca su "Sending" e poi su "Domains".
3. Clicca sopra il tuo dominio sandbox.
4. Nella pagina del dominio, cerca la sezione "Authorized Recipients" o "Authorized Emails".
5. Aggiungi l'indirizzo email del destinatario (in questo caso, l'email dell'autore del post) alla lista degli indirizzi autorizzati.
6. Mailgun invierà un'email di verifica all'indirizzo aggiunto. Il destinatario dovrà cliccare sul link di conferma in questa email.
7. Una volta che l'indirizzo è stato verificato, potrai inviare email a quel destinatario utilizzando il tuo dominio sandbox.

### APPROFONDIMENTO SU MULTER

Nel codice abbiamo utilizzato `.single()` per quanto riguarda **Multer**, questo perchè dal form HTML carichiamo un solo file. Se avete bisogno di caricare più di un file, potete osservare la repository di multer dove viene spiegato il metodo adatto: <https://github.com/expressjs/multer>
