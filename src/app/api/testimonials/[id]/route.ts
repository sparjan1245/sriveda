import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  const data = await req.json();
  const allowed = ["name", "location", "avatar", "text", "rating", "order", "active"] as const;
  const update = Object.fromEntries(allowed.filter((k) => k in data).map((k) => [k, data[k]]));
  const testimonial = await db.testimonial.update({ where: { id }, data: update });
  revalidateTag("testimonials", "max");
  return NextResponse.json(testimonial);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  await db.testimonial.delete({ where: { id } });
  revalidateTag("testimonials", "max");
  return NextResponse.json({ success: true });
}
