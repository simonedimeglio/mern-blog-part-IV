import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String, required: true },
  cover: { type: String, required: true },
  readTime: {
    value: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  author: { type: String, required: true }, // email dell'autore
  content: { type: String, required: true }
}, {
  timestamps: true,
  collection: "blogPosts"
});

export default mongoose.model("BlogPost", blogPostSchema);
