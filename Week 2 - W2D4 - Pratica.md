# Pratica

## Richiesta

- 1) **Scrivere una nuova rotta**: si tratta di una `PATCH` all'endpoint `/authors/:authorId/avatar` che carica una immagine per l'autore specificato e salva l'URL creata da Cloudinary nel db.

- 2) **Scrivere una nuova rotta**: si tratta di una `PATCH` all'endpoint `/blogPosts/:blogPostId/cover` che carica una immagine per il post specificato dall'id, ovviamente salvando l'URL creato da Cloudinary nel post corrispondente.

## Soluzione

Per la prima richiesta, dobbiamo modificare `authorRoutes.js`, aggiungendo questa nuova route:

```javascript
import cloudinaryUploader from "../config/claudinaryConfig.js"; // Assicurati che ci sia questo import!

// PATCH /authors/:authorId/avatar: carica un'immagine avatar per l'autore specificato
router.patch("/:authorId/avatar", cloudinaryUploader.single("avatar"), async (req, res) => {
  try {
    // Verifica se è stato caricato un file, se non l'ho caricato rispondo con un 400
    if (!req.file) {
      return res.status(400).json({ message: "Nessun file caricato" });
    }

    // Cerca l'autore nel database, se non esiste rispondo con una 404
    const author = await Author.findById(req.params.authorId);
    if (!author) {
      return res.status(404).json({ message: "Autore non trovato" });
    }

    // Aggiorna l'URL dell'avatar dell'autore con l'URL fornito da Cloudinary
    author.avatar = req.file.path;

    // Salva le modifiche nel db
    await author.save();

    // Invia la risposta con l'autore aggiornato
    res.json(author);
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'avatar:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});
```

Per creare invece la seconda rotta richiesta, dobbiamo modificare `blogPostRoutes.js` aggiungendo questa nuova rotta:

```javascript
// Anche qua, assicurati che l'import di cloudinaryUploader sia presente!
import cloudinaryUploader from "../config/claudinaryConfig.js";

// PATCH /blogPosts/:blogPostId/cover: carica un'immagine di copertina per il post specificato
router.patch("/:blogPostId/cover", cloudinaryUploader.single("cover"), async (req, res) => {
  try {
    // Verifica se è stato caricato un file o meno
    if (!req.file) {
      return res.status(400).json({ message: "Ops, nessun file caricato" });
    }

    // Cerca il blog post nel db
    const blogPost = await BlogPost.findById(req.params.blogPostId);
    if (!blogPost) {
      return res.status(404).json({ message: "Blog post non trovato" });
    }

    // Aggiorna l'URL della copertina del post con l'URL fornito da Cloudinary
    blogPost.cover = req.file.path;

    // Salva le modifiche nel db
    await blogPost.save();

    // Invia la risposta con il blog post aggiornato
    res.json(blogPost);
  } catch (error) {
    console.error("Errore durante l'aggiornamento della copertina:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});
```

## Testare queste due nuove rotte su Postman

- Per la rotta PATCH /authors/:authorId/avatar:
a. Apri Postman e crea una nuova richiesta PATCH.
b. Inserisci l'URL, ad esempio: <http://localhost:5001/api/authors/123456/avatar> (sostituisci 123456 con un ID autore valido).
c. Vai alla sezione "Body" della richiesta.
d. Seleziona "form-data" come tipo di body.
e. Aggiungi una nuova chiave chiamata "avatar".
f. A destra della chiave "avatar", c'è un menu a discesa. Seleziona "File" invece di "Text".
g. Clicca su "Select Files" e scegli un'immagine dal tuo computer.
h. Invia la richiesta.

- Per la rotta PATCH /blogPosts/:blogPostId/cover:
a. Crea una nuova richiesta PATCH in Postman.
b. Inserisci l'URL, ad esempio: <http://localhost:5001/api/blogPosts/789012/cover> (sostituisci 789012 con un ID di blog post valido).
c. Vai alla sezione "Body" della richiesta.
d. Seleziona "form-data" come tipo di body.
e. Aggiungi una nuova chiave chiamata "cover".
f. Cambia il tipo della chiave "cover" in "File".
g. Seleziona un'immagine dal tuo computer.
h. Invia la richiesta.
