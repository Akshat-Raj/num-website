const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type VerificationResult = {
  valid: boolean;
  reason?: string;
};

export async function verifyIdCard(file: File | Blob): Promise<VerificationResult> {
  if (!file) {
    return { valid: false, reason: "No file received." };
  }

  if (typeof file.type === "string" && !ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, reason: "Unsupported file type." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, reason: "File is too large. Max 5MB." };
  }

  // Optional: perform light pixel check for images
  if (file instanceof File && file.type.startsWith("image/")) {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength < 1024) {
      return { valid: false, reason: "Image appears too small to be an ID." };
    }
  }

  return { valid: true };
}

