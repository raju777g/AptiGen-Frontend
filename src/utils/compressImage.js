const IMAGE_COMPRESSION_THRESHOLD = 100 * 1024;
const IMAGE_QUALITY = 0.85;
const NON_RASTER_IMAGE_TYPES = new Set(["image/gif", "image/svg+xml"]);

/** Compress supported raster images over 100 KB to WebP at 85% quality. */
export async function compressImageIfNeeded(file) {
  if (!file || file.size <= IMAGE_COMPRESSION_THRESHOLD || !file.type.startsWith("image/") || NON_RASTER_IMAGE_TYPES.has(file.type)) {
    return file;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0);

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
