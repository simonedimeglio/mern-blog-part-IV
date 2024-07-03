// Importa gli hook necessari da React
import { useState, useEffect } from "react";
// Importa useParams per accedere ai parametri dell'URL
import { useParams } from "react-router-dom";
// Importo la funzione getPost dal mio file services/api
import { getPost } from "../services/api";
// Importa il file CSS per gli stili specifici di questo componente
import "./PostDetail.css";

export default function PostDetail() {
  // Stato per memorizzare i dati del post
  const [post, setPost] = useState(null);

  // Estrae l'id del post dai parametri dell'URL
  const { id } = useParams();

  // Effect hook per fetchare i dati del post quando il componente viene montato o l'id cambia
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Effettua una richiesta GET al backend per ottenere i dettagli del post
        const response = await getPost(id);
        // Aggiorna lo stato con i dati del post
        setPost(response.data);
      } catch (error) {
        // Logga eventuali errori nella console
        console.error("Errore nella fetch del post:", error);
      }
    };
    // Chiama la funzione fetchPost
    fetchPost();
  }, [id]); // L'effetto si attiva quando l'id cambia

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
      </article>
    </div>
  );
}
