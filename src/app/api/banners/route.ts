import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const banners = await db.banner
    .findMany({ where: { active: true }, orderBy: { order: "asc" } })
    .catch(() => []);
  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { image, title, subtitle, description, ctaText, ctaLink, cta2Text, cta2Link } = await req.json();
  if (!image) return NextResponse.json({ error: "Image URL is required." }, { status: 400 });

  const count = await db.banner.count();
  const banner = await db.banner.create({
    data: { image, title, subtitle, description, ctaText, ctaLink, cta2Text, cta2Link, order: count },
  });
  return NextResponse.json(banner);
}
