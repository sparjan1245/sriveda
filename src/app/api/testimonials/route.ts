import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

export async function GET() {
  const testimonials = await db.testimonial
    .findMany({ where: { active: true }, orderBy: { order: "asc" } })
    .catch(() => []);
  return NextResponse.json(testimonials);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { name, location, avatar, text, rating, order } = await req.json();
  if (!name || !text) {
    return NextResponse.json({ error: "Name and text are required." }, { status: 400 });
  }
  const count = await db.testimonial.count();
  const testimonial = await db.testimonial.create({
    data: { name, location, avatar, text, rating: rating ?? 5, order: order ?? count },
  });
  revalidateTag("testimonials", "max");
  return NextResponse.json(testimonial);
}
