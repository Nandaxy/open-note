import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  secretCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Note", noteSchema);
