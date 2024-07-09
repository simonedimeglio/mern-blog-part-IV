import axios from "axios";

// Definiamo l'url di base
const API_URL = "http://localhost:5001/api";

// Configura un'istanza di axios con l'URL di base
const api = axios.create({
  baseURL: API_URL,
});

// Funzioni per le operazioni CRUD sui post
export const getPosts = () => api.get("/blogPosts");
// NEW: modifico per praticità la funzione getPost:id
export const getPost = (id) =>
  api.get(`/blogPosts/${id}`).then((response) => response.data);
export const createPost = (postData) =>
  api.post("/blogPosts", postData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const updatePost = (id, postData) =>
  api.put(`/blogPosts/${id}`, postData);
export const deletePost = (id) => api.delete(`/blogPosts/${id}`);

// NEW: Funzioni per gestire i commenti

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

// Se un domani aggiungiamo le operazioni per gli autori, possiamo definirle qua

// Infine, esportiamo api
export default api;
