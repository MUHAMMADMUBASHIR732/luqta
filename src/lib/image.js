// Image helpers: compress before upload (about 1280px) and make small thumbnails for demo data.

async function loadBitmap(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fall back to an <img> element */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function drawScaled(file, maxEdge, quality) {
  const bitmap = await loadBitmap(file);
  const width = bitmap.width || bitmap.naturalWidth;
  const height = bitmap.height || bitmap.naturalHeight;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  if (typeof bitmap.close === "function") bitmap.close();
  return { canvas, scale, quality };
}

const toBlob = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

/** Returns a File no larger than ~1280px on its longest edge. Falls back to the original on any problem. */
export async function compressImage(file, maxEdge = 1280, quality = 0.82) {
  if (!file || !file.type || !file.type.startsWith("image/")) return file;
  try {
    const { canvas, scale } = await drawScaled(file, maxEdge, quality);
    if (scale === 1 && file.size < 350_000) return file;
    const blob = await toBlob(canvas, quality);
    if (!blob || (scale === 1 && blob.size >= file.size)) return file;
    const base = (file.name || "photo").replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

/** Small data URL for the demo store. */
export async function fileToDataUrl(file, maxEdge = 480, quality = 0.72) {
  try {
    const { canvas } = await drawScaled(file, maxEdge, quality);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
}
