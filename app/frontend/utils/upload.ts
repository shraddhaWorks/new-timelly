/**
 * Upload an image file to Supabase Storage via the app API.
 * Returns the public URL of the uploaded file (high quality, no base64).
 */
export async function uploadImage(file: File, folder = "images"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Upload failed");
  }
  if (!data?.url) {
    throw new Error("No URL returned from upload");
  }
  return data.url;
}

/** Upload a Blob (e.g. from canvas) as a file. */
export async function uploadBlob(
  blob: Blob,
  filename: string,
  folder = "certificates"
): Promise<string> {
  const file = new File([blob], filename, { type: blob.type || "image/png" });
  return uploadImage(file, folder);
}
