import { Request, Response } from "express";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export async function handleImageUpload(req: any, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "File must be an image" });
    }

    // Validate file size (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File must be smaller than 5MB" });
    }

    // Generate unique key with random suffix to prevent enumeration
    const ext = req.file.originalname.split(".").pop() || "jpg";
    const key = `messages/${nanoid()}-${Date.now()}.${ext}`;

    // Upload to S3
    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    res.json({
      url,
      key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
}
