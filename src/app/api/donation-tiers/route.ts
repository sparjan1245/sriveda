import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

export async function GET() {
  const tiers = await db.donationTier
    .findMany({ where: { active: true }, orderBy: { order: "asc" } })
    .catch(() => []);
  return NextResponse.json(tiers);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { name, description, amount, recurring, order } = await req.json();
  if (!name || !amount) {
    return NextResponse.json({ error: "Name and amount are required." }, { status: 400 });
  }
  const count = await db.donationTier.count();
  const tier = await db.donationTier.create({
    data: { name, description, amount: parseFloat(amount), recurring: !!recurring, order: order ?? count },
  });
  revalidateTag("donation-tiers", "max");
  return NextResponse.json(tier);
}
