import express from "express";
import Author from "../models/Author.js";
import BlogPost from "../models/BlogPost.js";

const router = express.Router();

// GET /authors: ritorna la lista degli autori
router.get("/", async (req, res) => {
  try {
    // Recupera tutti gli autori dal database
    const authors = await Author.find();
    // Invia la lista degli autori come risposta JSON
    res.json(authors);
  } catch (err) {
    // In caso di errore, invia una risposta di errore
    res.status(500).json({ message: err.message });
  }
});

// GET /authors/123: ritorna il singolo autore
router.get("/:id", async (req, res) => {
  try {
    // Cerca un autore specifico per ID
    const author = await Author.findById(req.params.id);
    if (!author) {
      // Se l'autore non viene trovato, invia una risposta 404
      return res.status(404).json({ message: "Autore non trovato" });
    }
    // Invia l'autore trovato come risposta JSON
    res.json(author);
  } catch (err) {
    // In caso di errore, invia una risposta di errore
    res.status(500).json({ message: err.message });
  }
});

// POST /authors: crea un nuovo autore
router.post("/", async (req, res) => {
  // Crea una nuova istanza di Author con i dati dalla richiesta
  const author = new Author(req.body);
  try {
    // Salva il nuovo autore nel database
    const newAuthor = await author.save();
    // Invia il nuovo autore creato come risposta JSON con status 201 (Created)
    res.status(201).json(newAuthor);
  } catch (err) {
    // In caso di errore (es. validazione fallita), invia una risposta di errore
    res.status(400).json({ message: err.message });
  }
});

// PUT /authors/123: modifica l'autore con l'id associato
router.put("/:id", async (req, res) => {
  try {
    // Trova e aggiorna l'autore nel database
    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedAuthor) {
      // Se l'autore non viene trovato, invia una risposta 404
      return res.status(404).json({ message: "Autore non trovato" });
    }
    // Invia l'autore aggiornato come risposta JSON
    res.json(updatedAuthor);
  } catch (err) {
    // In caso di errore, invia una risposta di errore
    res.status(400).json({ message: err.message });
  }
});

// DELETE /authors/123: cancella l'autore con l'id associato
router.delete("/:id", async (req, res) => {
  try {
    // Trova e elimina l'autore dal database
    const deletedAuthor = await Author.findByIdAndDelete(req.params.id);
    if (!deletedAuthor) {
      // Se l'autore non viene trovato, invia una risposta 404
      return res.status(404).json({ message: "Autore non trovato" });
    }
    // Invia un messaggio di conferma come risposta JSON
    res.json({ message: "Autore eliminato" });
  } catch (err) {
    // In caso di errore, invia una risposta di errore
    res.status(500).json({ message: err.message });
  }
});

// GET /authors/:id/blogPosts: ricevi tutti i blog post di uno specifico autore
router.get("/:id/blogPosts", async (req, res) => {
  try {
    // Cerca l'autore specifico per ID
    const author = await Author.findById(req.params.id);
    if (!author) {
      // Se l'autore non viene trovato, invia una risposta 404
      return res.status(404).json({ message: "Autore non trovato" });
    }
    // Cerca tutti i blog post dell'autore usando la sua email
    const blogPosts = await BlogPost.find({ author: author.email });
    // Invia la lista dei blog post come risposta JSON
    res.json(blogPosts);
  } catch (err) {
    // In caso di errore, invia una risposta di errore
    res.status(500).json({ message: err.message });
  }
});

export default router;
