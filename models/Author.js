import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dataDiNascita: { type: String, required: true },
  avatar: { type: String }
}, {
  timestamps: true,
  collection: "authors"
});

export default mongoose.model("Author", authorSchema);
