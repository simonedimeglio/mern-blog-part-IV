import express from "express";
import BlogPost from "../models/BlogPost.js";
import upload from "../middlewares/upload.js"; // Import nuovo Middleware per upload (NO CLOUDINARY)
import cloudinaryUploader from "../config/claudinaryConfig.js"; // Import dell'uploader di Cloudinary (CON CLOUDINARY)
import { sendEmail } from "../services/emailService.js"; // Import del codice per l'invio delle mail (INVIO MAIL)

// import controlloMail from "../middlewares/controlloMail.js"; // NON USARE - SOLO PER DIDATTICA - MIDDLEWARE (commentato)

const router = express.Router();

// router.use(controlloMail); // NON USARE - SOLO PER DIDATTICA - Applicazione del middleware a tutte le rotte (commentato)

// GET /blogPosts: ritorna una lista di blog post
router.get("/", async (req, res) => {
  try {
    let query = {};
    // Se c'è un parametro 'title' nella query, crea un filtro per la ricerca case-insensitive
    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: "i" }; // Per fare ricerca case-insensitive:
      // Altrimenti per fare ricerca case-sensitive -> query.title = req.query.title;
    }
    // Cerca i blog post nel database usando il filtro (se presente)
    const blogPosts = await BlogPost.find(query);
    // Invia la lista dei blog post come risposta JSON
    res.json(blogPosts);
  } catch (err) {
    // In caso di errore, invia una risposta di errore
    res.status(500).json({ message: err.message });
  }
});

// GET /blogPosts/123: ritorna un singolo blog post
router.get("/:id", async (req, res) => {
  try {
    // Cerca un blog post specifico per ID
    const blogPost = await BlogPost.findById(req.params.id);
    if (!blogPost) {
      // Se il blog post non viene trovato, invia una risposta 404
      return res.status(404).json({ message: "Blog post non trovato" });
    }
    // Invia il blog post trovato come risposta JSON
    res.json(blogPost);
  } catch (err) {
    // In caso di errore, invia una risposta di errore
    res.status(500).json({ message: err.message });
  }
});

// POST /blogPosts: crea un nuovo blog post (AGGIORNATA AD UPLOAD!)

// router.post("/", upload.single("cover"), async (req, res) => {
router.post("/", cloudinaryUploader.single("cover"), async (req, res) => {
  try {
    const postData = req.body;
    if (req.file) {
      // postData.cover = `http://localhost:5001/uploads/${req.file.filename}`;
      postData.cover = req.file.path; // Cloudinary restituirà direttamente il suo url
    }
    const newPost = new BlogPost(postData);
    await newPost.save();

    // CODICE PER INVIO MAIL con MAILGUN
    const htmlContent = `
      <h1>Il tuo post è stato pubblicato!</h1>
      <p>Ciao ${newPost.author},</p>
      <p>Il tuo post "${newPost.title}" è stato pubblicato con successo.</p>
      <p>Categoria: ${newPost.category}</p>
      <p>Grazie per il tuo contributo al blog!</p>
    `;

    await sendEmail(
      newPost.author, // Ovviamente assumendo che newPost.author sia l'email dell'autore
      "Il tuo post è stato correttamente pubblicato",
      htmlContent
    );

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /blogPosts/123: modifica il blog post con l'id associato
router.put("/:id", async (req, res) => {
  try {
    // Trova e aggiorna il blog post nel database
    const updatedBlogPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Opzione per restituire il documento aggiornato
    );
    if (!updatedBlogPost) {
      // Se il blog post non viene trovato, invia una risposta 404
      return res.status(404).json({ message: "Blog post non trovato" });
    }
    // Invia il blog post aggiornato come risposta JSON
    res.json(updatedBlogPost);
  } catch (err) {
    // In caso di errore, invia una risposta di errore
    res.status(400).json({ message: err.message });
  }
});

// DELETE /blogPosts/123: cancella il blog post con l'id associato
router.delete("/:id", async (req, res) => {
  try {
    // Trova e elimina il blog post dal database
    const deletedBlogPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deletedBlogPost) {
      // Se il blog post non viene trovato, invia una risposta 404
      return res.status(404).json({ message: "Blog post non trovato" });
    }
    // Invia un messaggio di conferma come risposta JSON
    res.json({ message: "Blog post eliminato" });
  } catch (err) {
    // In caso di errore, invia una risposta di errore
    res.status(500).json({ message: err.message });
  }
});

export default router;
