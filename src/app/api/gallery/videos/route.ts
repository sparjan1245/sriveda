import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

export async function GET() {
  const videos = await db.galleryVideo.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  return NextResponse.json(videos);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { url, title, thumbnail, category } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const video = await db.galleryVideo.create({ data: { url, title, thumbnail, category } });
  revalidateTag("gallery", "max");
  return NextResponse.json(video, { status: 201 });
}
