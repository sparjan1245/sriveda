import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary, uploadRawToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "temple/banners";

  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const isPdf = file.type === "application/pdf";

  if (!isPdf && !allowedImages.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, GIF, and PDF are allowed." },
      { status: 400 }
    );
  }

  const maxSize = isPdf ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File must be under ${isPdf ? "20" : "10"} MB.` },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const url = isPdf
    ? await uploadRawToCloudinary(buffer, folder)
    : await uploadToCloudinary(buffer, folder);

  return NextResponse.json({ url });
}
