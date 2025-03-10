import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  secretCode: { type: String },
  canEdit: { type: Boolean, default: false },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Note", noteSchema);
