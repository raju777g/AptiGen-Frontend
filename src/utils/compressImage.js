const IMAGE_COMPRESSION_THRESHOLD = 100 * 1024;
const PROFILE_IMAGE_MAX_DIMENSION = 512;
const IMAGE_QUALITY = 0.82;
const NON_RASTER_IMAGE_TYPES = new Set(["image/gif", "image/svg+xml"]);

async function compressRasterImage(file, maxDimension = null) {
  if (!file || !file.type.startsWith("image/") || NON_RASTER_IMAGE_TYPES.has(file.type)) {
    return file;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const scale = maxDimension ? Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height)) : 1;
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

    const originalName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${originalName || "image"}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } catch {
    // Leave unusual or browser-unsupported image encodings untouched.
    return file;
  } finally {
    bitmap?.close();
  }
}

/** Compress supported raster images over 100 KB for general uploads. */
export async function compressImageIfNeeded(file) {
  if (!file || file.size <= IMAGE_COMPRESSION_THRESHOLD) return file;
  return compressRasterImage(file);
}

/** Reduce profile photos to a practical avatar size before they are uploaded. */
export async function compressProfileImage(file) {
  return compressRasterImage(file, PROFILE_IMAGE_MAX_DIMENSION);
}
