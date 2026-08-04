import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";

export async function GET(req: Request) {
  const showAll = new URL(req.url).searchParams.get("all") === "true";
  const where   = showAll ? {} : { active: true };
  const tiers   = await db.donationTier
    .findMany({ where, orderBy: { order: "asc" } })
    .catch(() => []);
  return NextResponse.json(tiers);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { name, description, amount, maxAmount, recurring, order, highlighted } = await req.json();
  if (!name || !amount) {
    return NextResponse.json({ error: "Name and amount are required." }, { status: 400 });
  }
  const min = parseFloat(amount);
  if (!Number.isFinite(min) || min <= 0) {
    return NextResponse.json({ error: "Minimum amount must be a positive number." }, { status: 400 });
  }
  let max: number | null = null;
  if (maxAmount !== undefined && maxAmount !== null && maxAmount !== "") {
    max = parseFloat(maxAmount);
    if (!Number.isFinite(max) || max < min) {
      return NextResponse.json({ error: "Maximum amount must be greater than or equal to the minimum." }, { status: 400 });
    }
  }
  const count = await db.donationTier.count();
  const tier = await db.donationTier.create({
    data: { name, description, amount: min, maxAmount: max, recurring: !!recurring, order: order ?? count, highlighted: !!highlighted },
  });
  revalidateTag("donation-tiers", "max");
  revalidatePath("/", "page");
  revalidatePath("/donate", "page");
  return NextResponse.json(tier);
}
