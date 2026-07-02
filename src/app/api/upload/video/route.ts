import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadVideoToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const ALLOWED = ["video/mp4", "video/webm", "video/quicktime", "video/avi", "video/mov"];
const MAX_SIZE = 200 * 1024 * 1024; // 200 MB

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "temple/gallery/videos";

  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Only MP4, WebM, MOV, and AVI videos are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Video must be under 200 MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const url = await uploadVideoToCloudinary(buffer, folder);

  return NextResponse.json({ url });
}
