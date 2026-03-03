import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin, SUPABASE_BUCKET } from "@/lib/supabase";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function saveLocally(file: File, folder: string, safeName: string) {
  const localFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+/, "");
  const relPath = path.posix.join("uploads", localFolder || "images", `${Date.now()}-${safeName}`);
  const absPath = path.join(process.cwd(), "public", ...relPath.split("/"));
  await mkdir(path.dirname(absPath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, buffer);
  return `/${relPath}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "images";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No file provided. Use form field 'file'." },
        { status: 400 }
      );
    }

    const allowedTypes =
      folder === "homework" || folder === "certificates" || folder === "circulars"
        ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]
        : ALLOWED_IMAGE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          message:
            folder === "homework" || folder === "certificates" || folder === "circulars"
              ? "Invalid file type. Use JPEG, PNG, WebP, GIF, PDF, or DOC/DOCX."
              : "Invalid file type. Use JPEG, PNG, WebP or GIF.",
        },
        { status: 400 }
      );
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      return NextResponse.json(
        { message: `File too large. Max ${MAX_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80);
    const storagePath = `${folder}/${Date.now()}-${safeName}`;

    if (supabaseAdmin) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!error && data?.path) {
        const { data: urlData } = supabaseAdmin.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(data.path);

        return NextResponse.json({ url: urlData.publicUrl, path: data.path, provider: "supabase" });
      }

      console.error("Supabase upload error, falling back to local:", error);
    } else {
      console.warn("Supabase not configured, using local upload fallback.");
    }

    const localUrl = await saveLocally(file, folder, safeName);
    return NextResponse.json({ url: localUrl, path: localUrl.replace(/^\//, ""), provider: "local" });
  } catch (e) {
    console.error("Upload API error:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
