// FETCH NO AXIOS

// Definiamo l'url di base
const API_URL = "http://localhost:5001/api";

// Funzione di utilità per gestire le risposte
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Qualcosa è andato storto");
  }
  return response.json();
};

// Funzioni per le operazioni CRUD
export const getPosts = () =>
  fetch(`${API_URL}/blogPosts`).then(handleResponse);

export const getPost = (id) =>
  fetch(`${API_URL}/blogPosts/${id}`).then(handleResponse);

// UPLOAD: modificata la funzione createPost per gestire FormData
export const createPost = (postData) =>
  fetch(`${API_URL}/blogPosts`, {
    method: "POST",
    body: postData, // postData è già un FormData
    // Non è necessario impostare Content-Type per FormData, il browser lo fa automaticamente
  }).then(handleResponse);

export const updatePost = (id, postData) =>
  fetch(`${API_URL}/blogPosts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  }).then(handleResponse);

export const deletePost = (id) =>
  fetch(`${API_URL}/blogPosts/${id}`, {
    method: "DELETE",
  }).then(handleResponse);

// Se un domani aggiungiamo le operazioni per gli autori, possiamo definirle qua
