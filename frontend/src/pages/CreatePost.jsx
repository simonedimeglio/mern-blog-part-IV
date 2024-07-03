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
    cover: "",
    readTime: { value: 0, unit: "minutes" },
    author: "",
  });

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

  // Gestore per l'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Invia i dati del post al backend
      await createPost(post);
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
        {/* Campo per l'URL dell'immagine di copertina del post */}
        <div className="form-group">
          <label>URL Immagine</label>
          <input
            type="text"
            id="cover"
            name="cover"
            value={post.cover}
            onChange={handleChange}
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
