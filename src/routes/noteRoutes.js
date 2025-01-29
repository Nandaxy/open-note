import express from "express";
import { encode } from "html-entities";
import Note from "../models/Note.js";
import noteSchema from "../validations/noteValidation.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const validatedData = noteSchema.parse(req.body);
    const canEdit = validatedData.secretCode ? true : false
    const encodedData = {
      name: encode(validatedData.name),
      message: encode(validatedData.message),
      secretCode: encode(validatedData.secretCode),
      canEdit,
    };

    const note = new Note(encodedData);
    await note.save();

    res.status(201).json(note);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors: validationErrors });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const notes = await Note.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const definedNotes = notes.map((note) => ({
      _id: note._id,
      name: note.name,
      message: note.message,
      createdAt: note.createdAt,
      canEdit: note.canEdit,
    }));

    res.json(definedNotes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

router.get("/delete/:id", async (req, res) => {
  const secretCode = req.query.code;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Catatan tidak ditemukan" });
    }

    if (secretCode != note.secretCode) {
      return res
        .status(401)
        .json({ error: "Kode salah, Silahkan cek kembali" });
    }

    await note.deleteOne();
    res.json({ message: "Catatan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus catatan" });
  }
});

router.get("/:id", async (req, res) => {
  const secretCode = req.query.code;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Catatan tidak ditemukan" });
    }

    if (secretCode != note.secretCode) {
      return res
        .status(401)
        .json({ error: "Kode salah, Silahkan cek kembali" });
    }

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil catatan" });
  }
});

router.put("/:id", async (req, res) => {
  const { name, message, secretCode } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Catatan tidak ditemukan" });
    }

    if (secretCode != note.secretCode) {
      return res
        .status(401)
        .json({ error: "Kode salah, Silahkan cek kembali" });
    }

    note.name = encode(name);
    note.message = encode(message);
    await note.save();

    res.json({ message: "Catatan berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memperbarui catatan" });
  }
});

export default router;

