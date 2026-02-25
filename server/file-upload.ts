import { Response } from "express";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-rar-compressed",
  "text/plain",
  "text/csv",
];

export async function handleFileUpload(req: any, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: "File type not allowed. Supported: images, PDF, Word, Excel, PowerPoint, ZIP, RAR, text files" 
      });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: `File must be smaller than ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      });
    }

    const ext = req.file.originalname.split(".").pop() || "bin";
    const key = `school-files/${nanoid()}-${Date.now()}.${ext}`;

    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    res.json({
      url,
      key,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
}
