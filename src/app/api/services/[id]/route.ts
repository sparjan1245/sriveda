import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const svc = db.service as any;

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const data = await req.json();

  const allowed = [
    "name", "slug", "shortDesc", "description", "price",
    "duration", "image", "category", "active", "order",
  ] as const;

  const update = Object.fromEntries(
    allowed
      .filter((k) => k in data)
      .map((k) => {
        if (k === "price") return [k, parseFloat(data[k])];
        return [k, data[k]];
      })
  );

  try {
    const service = await svc.update({ where: { id }, data: update });
    return NextResponse.json(service);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === "P2002") {
      return NextResponse.json({ error: "A service with this slug already exists." }, { status: 409 });
    }
    console.error("[PATCH /api/services/:id]", e.code, e.message);
    return NextResponse.json({ error: "Failed to update service." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;

  try {
    await svc.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete a service with existing bookings. Deactivate it instead." },
        { status: 409 }
      );
    }
    console.error("[DELETE /api/services/:id]", e.code, e.message);
    return NextResponse.json({ error: "Failed to delete service." }, { status: 500 });
  }
}
