import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";

export async function GET(req: Request) {
  const showAll = new URL(req.url).searchParams.get("all") === "true";
  const where   = showAll ? {} : { active: true };
  const tiers   = await db.sponsorTier
    .findMany({ where, orderBy: { minAmount: "asc" } })
    .catch(() => []);
  return NextResponse.json(tiers);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { name, description, minAmount, maxAmount, benefits, highlighted } = await req.json();
  if (!name || !minAmount) {
    return NextResponse.json({ error: "Name and minimum amount are required." }, { status: 400 });
  }
  const min = parseFloat(minAmount);
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
  const tier = await db.sponsorTier.create({
    data: { name, description, minAmount: min, maxAmount: max, benefits: benefits || null, highlighted: !!highlighted },
  });
  revalidateTag("sponsor-tiers", "max");
  revalidatePath("/donate", "page");
  return NextResponse.json(tier);
}
