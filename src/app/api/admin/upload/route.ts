import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const MAX_SIZE = 3 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be 3 MB or smaller." }, { status: 413 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 415 });
  }

  const media = await db.media.create({
    data: {
      mime: file.type,
      size: file.size,
      data: Buffer.from(await file.arrayBuffer()),
    },
  });

  return NextResponse.json({ ok: true, url: `/api/media/${media.id}` });
}
