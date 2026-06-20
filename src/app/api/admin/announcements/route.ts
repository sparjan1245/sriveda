import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.announcement.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] }).catch(() => []);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { title, content, type, active, pinned } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "Title and content are required." }, { status: 400 });

  const item = await db.announcement.create({
    data: { title, content, type: type || "INFO", active: active ?? true, pinned: pinned ?? false },
  });
  return NextResponse.json(item, { status: 201 });
}
