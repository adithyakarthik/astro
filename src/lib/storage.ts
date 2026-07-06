import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Saves a user-uploaded photo and returns a servable URL. Uses Vercel Blob
// when BLOB_READ_WRITE_TOKEN is configured (production); otherwise falls
// back to writing into public/uploads/finds/ for local development — same
// "real service in prod, dev-friendly fallback locally" pattern as OTP email
// delivery (Resend vs. on-screen codes).
export async function saveUploadedPhoto(file: File): Promise<string> {
  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const filename = `${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`finds/${filename}`, file, { access: "public" });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "finds");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/finds/${filename}`;
}
