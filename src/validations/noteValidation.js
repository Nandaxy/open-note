import { z } from "zod";

const noteSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nama wajib diisi" })
    .max(100, { message: "Nama harus kurang dari 100 karakter" }),
  message: z
    .string()
    .min(1, { message: "Pesan wajib diisi" })
    .max(500, { message: "Pesan harus kurang dari 500 karakter" }),
  secretCode: z
    .string()
    .max(100, { message: "Kode rahasia tidak boleh lebih dari 100 karakter" }),
});

export default noteSchema;
