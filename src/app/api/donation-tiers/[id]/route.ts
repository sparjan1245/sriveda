import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  const data = await req.json();

  const existing = await db.donationTier.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Tier not found." }, { status: 404 });

  const allowed = ["name", "description", "amount", "maxAmount", "recurring", "order", "active", "highlighted"] as const;
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in data) update[k] = data[k];

  const nextMin = "amount" in update ? parseFloat(String(update.amount)) : existing.amount;
  if (!Number.isFinite(nextMin) || nextMin <= 0) {
    return NextResponse.json({ error: "Minimum amount must be a positive number." }, { status: 400 });
  }
  update.amount = nextMin;

  let nextMax: number | null;
  if ("maxAmount" in update) {
    const raw = update.maxAmount;
    nextMax = raw === null || raw === "" || raw === undefined ? null : parseFloat(String(raw));
    if (nextMax !== null && !Number.isFinite(nextMax)) {
      return NextResponse.json({ error: "Maximum amount must be a number." }, { status: 400 });
    }
  } else {
    nextMax = existing.maxAmount;
  }
  if (nextMax !== null && nextMax < nextMin) {
    return NextResponse.json({ error: "Maximum amount must be greater than or equal to the minimum." }, { status: 400 });
  }
  update.maxAmount = nextMax;

  const tier = await db.donationTier.update({ where: { id }, data: update });
  revalidateTag("donation-tiers", "max");
  revalidatePath("/", "page");
  revalidatePath("/donate", "page");
  return NextResponse.json(tier);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  await db.donationTier.delete({ where: { id } });
  revalidateTag("donation-tiers", "max");
  revalidatePath("/", "page");
  revalidatePath("/donate", "page");
  return NextResponse.json({ success: true });
}
