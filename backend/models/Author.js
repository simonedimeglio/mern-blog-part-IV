import mongoose from "mongoose";
import bcrypt from 'bcrypt'; // NEW! Importa bcrypt per l'hashing delle password

// Definizione dello schema per l'autore
const authorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique: true previene email duplicate
  dataDiNascita: { type: String, required: true },
  avatar: { type: String }, // Campo opzionale per l'URL dell'avatar
  password: { type: String, required: true }, // NEW! Campo per la password (sarà hashata)
}, {
  timestamps: true, // Aggiunge automaticamente campi createdAt e updatedAt
  collection: "authors" // Specifica il nome della collezione in MongoDB
});

// NEW! Metodo per confrontare le password
// Questo metodo viene aggiunto a ogni documento 'author'
authorSchema.methods.comparePassword = function(candidatePassword) {
  // Usa bcrypt per confrontare la password fornita con quella hashata nel database
  return bcrypt.compare(candidatePassword, this.password);
};

// NEW! Middleware per l'hashing delle password prima del salvataggio
authorSchema.pre('save', async function(next) {
  // Esegui l'hashing solo se la password è stata modificata (o è nuova)
  // Questo previene l'hashing multiplo della stessa password
  if (!this.isModified('password')) return next();

  try {
    // Genera un salt (un valore casuale per rendere l'hash più sicuro)
    const salt = await bcrypt.genSalt(10);
    // Crea l'hash della password usando il salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); // Passa eventuali errori al middleware successivo
  }
});

// Crea e esporta il modello 'Author' basato sullo schema definito
export default mongoose.model("Author", authorSchema);