import axios from "axios";

// Definiamo l'url di base'
const API_URL = "http://localhost:5001/api";

// Configura un'istanza di axios con l'URL di base
const api = axios.create({
  baseURL: API_URL,
});

// Funzioni per le operazioni CRUD
export const getPosts = () => api.get("/blogPosts");
export const getPost = (id) => api.get(`/blogPosts/${id}`);
export const createPost = (postData) => api.post("/blogPosts", postData);
export const updatePost = (id, postData) =>
  api.put(`/blogPosts/${id}`, postData);
export const deletePost = (id) => api.delete(`/blogPosts/${id}`);

// Se un domani aggiungiamo le operazioni per gli autori, possiamo definirle qua

// Infine, esportiamo api
export default api;
