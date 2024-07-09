# Week 3 - W3D1 | Lezione Serale (Lunedì 8 Luglio 2024)

## Implementare un sistema di commenti per i blog post utilizzando l'embedding

Implementiamo un sistema di commenti per i blog post utilizzando l'embedding, che è una ottima scelta in questo caso. Procediamo step by step, modificando il modello esistente e implementando nuove rotte per gestire al meglio la nostra app.

Punteremo ad avere tutte le seguenti rotte disponibili (*ovviamente tenendo conto delle rotte già realizzate nelle scorse lezioni*):

```zsh
Rotte disponibili:
┌─────────┬──────────────────────────────────────────┬────────────────────┐
│ (index) │ path                                     │ methods            │
├─────────┼──────────────────────────────────────────┼────────────────────┤
│ 0       │ '/api/authors'                           │ 'GET, POST'        │
│ 1       │ '/api/authors/:id'                       │ 'GET, PUT, DELETE' │
│ 2       │ '/api/authors/:id/blogPosts'             │ 'GET'              │
│ 3       │ '/api/authors/:authorId/avatar'          │ 'PATCH'            │
│ 4       │ '/api/blogPosts'                         │ 'GET, POST'        │
│ 5       │ '/api/blogPosts/:id'                     │ 'GET, PUT, DELETE' │
│ 6       │ '/api/blogPosts/:blogPostId/cover'       │ 'PATCH'            │
│ 7       │ '/api/blogPosts/:id/comments'            │ 'GET, POST'        │
│ 8       │ '/api/blogPosts/:id/comments/:commentId' │ 'GET, PUT, DELETE' │
└─────────┴──────────────────────────────────────────┴────────────────────┘
```

### (A) Modifichiamo il modello `blogPost.js`

Prima di tutto, dobbiamo modificare il modello BlogPost per includere i commenti (ovviamente faccio riferimento allo *schema* `models/blogPost.js`).

Faremo questo:

- Aggiungiamo uno schema separato (*sempre all'interno dello stesso file*) per i commenti (`commentSchema`).
- Aggiungiamo un array `comments` al `blogPostSchema` che utilizza il `commentSchema`
- Aggiungiamo il timestamps (*che oramai conosciamo*) e `_id: true` per dare ad ogni commento un id univoco.

```javascript
import mongoose from "mongoose";

// NEW: AGGIUNGO LO SCHEMA PER I COMMENTI!
const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
    _id: true // Mi assicuro che ogni commento abbia un proprio _id univoco
  },
);

const blogPostSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    author: { type: String, required: true },
    content: { type: String, required: true },
    comments: [commentSchema] // NEW: Aggiungo l'array di commenti EMBEDDED.
  },
  {
    timestamps: true,
    collection: "blogPosts",
  },
);

export default mongoose.model("BlogPost", blogPostSchema);
```

**Perché non specifichiamo una collection per commentSchema?**

Non specifichiamo una collection per commentSchema perché questo schema è utilizzato come un subdocumento all'interno del blogPostSchema.

> In MongoDB, i subdocumenti non hanno una propria collection separata, ma sono invece memorizzati come parte del documento principale (in questo caso, il blog post).

Quando usi l'**embedding**, i commenti sono memorizzati direttamente all'interno del documento del blog post.

Non esistono come documenti indipendenti in una collection separata, ma come un array di oggetti all'interno del documento del post.


> Il blogPostSchema, invece, ha specificata una collection (collection: "blogPosts"), perché rappresenta documenti di primo livello che vengono effettivamente memorizzati in una collection dedicata nel database.

**Questa struttura ci permette di recuperare un post con tutti i suoi commenti in una singola query, il che è uno dei principali vantaggi dell'embedding in MongoDB.**

### (B) Implementiamo le nuove rotte in `blogPostRoutes.js`

Ora possiamo modificare il modello `blogPostRoutes.js` per implementare tutte le nuove rotte di cui potremmo aver bisogno.

> Possiamo tranquillamente implementare queste nuove rotte alla fine del file, dopo le altre già implementate.

**STRATEGIA:**

1. Ogni rotta inizierà cercando il post specifico usando `BlogPost.findById(req.params.id)`.

2. Per le operazioni che andremo ad eseguire sui singoli commenti, useremo il metodo `id()` di Mongoose, così da poter trovare il commento specifico nell'array.

3. Utilizzeremo `push()` per aggiungere nuovi commenti e `remove()` per toglierli.

4. Dopo ogni modifica, chiameremo `post.save()` per salvare le modifiche nel db.

5. Ogni rotta avrà la classica gestione degli errori di base per lanciare messaggi di errore customizzati ogni volta.

6. Andremo sempre a verificare l'esistenza del post e del commento (ovviamente dove possiamo) prima di eseguire ogni operazione.

- **GET /blogPosts/:id/comments => ritorna tutti i commenti di uno specifico post**

```javascript
router.get("/:id/comments", async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post non trovato" });
    }
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

- **GET /blogPosts/:id/comments/:commentId => ritorna un commento specifico di un post specifico**

```javascript
router.get("/:id/comments/:commentId", async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post non trovato" });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commento non trovato" });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

- **POST /blogPosts/:id/comments => aggiungi un nuovo commento ad un post specifico**

```javascript
router.post("/:id/comments", async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post non trovato" });
    }
    const newComment = {
      name: req.body.name,
      email: req.body.email,
      content: req.body.content
    };
    post.comments.push(newComment);
    await post.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
```

- **PUT /blogPosts/:id/comments/:commentId => cambia un commento di un post specifico**

```javascript
router.put("/:id/comments/:commentId", async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post non trovato" });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commento non trovato" });
    }
    comment.content = req.body.content;
    await post.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
```

- **DELETE /blogPosts/:id/comments/:commentId => elimina un commento specifico da un post specifico**

```javascript
router.delete("/:id/comments/:commentId", async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post non trovato" });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commento non trovato" });
    }
    comment.remove();
    await post.save();
    res.json({ message: "Commento eliminato con successo" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

### (C) Diamo la possibilità all'utente di aggiungere e visualizzare i commenti nel FRONTEND

Per implementare i commenti nel frontend, il posto migliore è senza dubbio il componente `postDetail.jsx`, dato che rappresenta la vista dettagliata di un singolo post.

Aggiorniamo le funzioni definite in `services/api.js` aggiungendo quanto segue:

```javascript
// NEW: modifico per praticità la funzione getPost:id
export const getPost = (id) =>
  api.get(`/blogPosts/${id}`).then((response) => response.data);

// Recupera tutti i commenti per un post specifico
export const getComments = (postId) =>
  api.get(`/blogPosts/${postId}/comments`).then((response) => response.data);

// Aggiunge un nuovo commento a un post specifico
export const addComment = (postId, commentData) =>
  api
    .post(`/blogPosts/${postId}/comments`, commentData)
    .then((response) => response.data);

// Funzione per recuperare un commento specifico
export const getComment = (postId, commentId) =>
  api
    .get(`/blogPosts/${postId}/comments/${commentId}`)
    .then((response) => response.data);

// Funzione per aggiornare un commento specifico
export const updateComment = (postId, commentId, commentData) =>
  api
    .put(`/blogPosts/${postId}/comments/${commentId}`, commentData)
    .then((response) => response.data);

// Funzione per eliminare un commento specifico
export const deleteComment = (postId, commentId) =>
  api
    .delete(`/blogPosts/${postId}/comments/${commentId}`)
    .then((response) => response.data);
```

Modifichiamo quindi `postDetail.jsx`.

```javascript
// Importa gli hook necessari da React
import { useState, useEffect } from "react";
// Importa useParams per accedere ai parametri dell'URL
import { useParams } from "react-router-dom";
// Importo la funzione getPost dal mio file services/api
// NEW: Aggiungiamo getComments e addComment alle importazioni
import { getPost, getComments, addComment } from "../services/api";
// Importa il file CSS per gli stili specifici di questo componente
import "./PostDetail.css";

export default function PostDetail() {
  // Stato per memorizzare i dati del post
  const [post, setPost] = useState(null);
  // NEW: Stato per memorizzare i commenti
  const [comments, setComments] = useState([]);
  // NEW: Stato per il nuovo commento
  const [newComment, setNewComment] = useState({
    name: "",
    email: "",
    content: "",
  });

  // Estrae l'id del post dai parametri dell'URL
  const { id } = useParams();

  // Effect hook per fetchare i dati del post quando il componente viene montato o l'id cambia
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        // Effettua una richiesta GET al backend per ottenere i dettagli del post
        const postResponse = await getPost(id);
        // Aggiorna lo stato con i dati del post
        setPost(postResponse);

        // NEW: Fetch dei commenti
        const commentsResponse = await getComments(id);
        setComments(commentsResponse);
        commentsResponse.forEach((comment) =>
          console.log("Comment ID:", comment._id),
        );
      } catch (error) {
        // Logga eventuali errori nella console
        console.error("Errore nella fetch del post o dei commenti:", error);
      }
    };
    // Chiama la funzione fetchPostAndComments
    fetchPostAndComments();
  }, [id]); // L'effetto si attiva quando l'id cambia

  // NEW: Gestore per i cambiamenti nei campi del nuovo commento
  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setNewComment((prev) => ({ ...prev, [name]: value }));
  };

  // NEW: Gestore per l'invio di un nuovo commento
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await addComment(id, newComment);
      // Aggiorna i commenti ricaricandoli dal database per ottenere l'ID del nuovo commento
      const commentsResponse = await getComments(id);
      setComments(commentsResponse);
      setNewComment({ name: "", email: "", content: "" });

      // Logga gli ID dei commenti dopo l'aggiornamento
      commentsResponse.forEach((comment) =>
        console.log("Comment ID:", comment._id),
      );
    } catch (error) {
      console.error("Errore nell'aggiunta del commento:", error);
    }
  };

  // Se il post non è ancora stato caricato, mostra un messaggio di caricamento
  if (!post) return <div>Caricamento...</div>;

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
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* NEW: Sezione commenti */}
        <div className="comments-section">
          <h2>Commenti</h2>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="comment">
                <h3>{comment.name}</h3>
                <p>{comment.content}</p>
              </div>
            ))
          ) : (
            <p>Ancora nessun commento</p>
          )}

          {/* NEW: Form per aggiungere un nuovo commento */}
          <form onSubmit={handleCommentSubmit}>
            <input
              type="text"
              name="name"
              value={newComment.name}
              onChange={handleCommentChange}
              placeholder="Il tuo nome"
              required
            />
            <input
              type="email"
              name="email"
              value={newComment.email}
              onChange={handleCommentChange}
              placeholder="La tua email"
              required
            />
            <textarea
              name="content"
              value={newComment.content}
              onChange={handleCommentChange}
              placeholder="Il tuo commento"
              required
            ></textarea>
            <button type="submit">Invia commento</button>
          </form>
        </div>
      </article>
    </div>
  );
}
```

> Ovviamente ho aggiunto un minimo di css dedicato nel file `PostDetail.css`

**ATTENZIONE:**

Se hai già dei post nel database senza il campo comments, potresti voler eseguire un aggiornamento una tantum per aggiungere il campo a tutti i documenti esistenti. Puoi farlo eseguendo questa query in MongoDB Compass:

1. Apri MongoDB Compass: Avvia MongoDB Compass e connettiti al tuo database.

2. Seleziona il Database e la Collection:
  - Nel pannello a sinistra, espandi il database che contiene i tuoi post.
	- Seleziona la collection che contiene i documenti dei tuoi post (ad esempio, blogPosts).

3.	Clicca su "update" (accanto a "add data" ed "export data)

4.	Incolla questa query sul pannello di sinistra

```
{
  $set: {
		comments: []
  },
}
```
5. Clicca su “Update N documents” per eseguire la query.
