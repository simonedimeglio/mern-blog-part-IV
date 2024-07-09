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
