import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const images = await db.galleryImage.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  return NextResponse.json(images);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { url, caption, category } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
  }

  const image = await db.galleryImage.create({ data: { url, caption, category } });
  return NextResponse.json(image);
}
