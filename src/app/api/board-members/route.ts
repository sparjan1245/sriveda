import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";

export async function GET() {
  const members = await db.boardMember.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []);
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { name, title, image, bio, order, active } = await req.json();
  if (!name || !title) return NextResponse.json({ error: "Name and title are required." }, { status: 400 });

  const member = await db.boardMember.create({
    data: { name, title, image: image || null, bio: bio || null, order: order ?? 0, active: active ?? true },
  });
  revalidateTag("board-members", "max");
  revalidatePath("/", "page");
  return NextResponse.json(member, { status: 201 });
}
