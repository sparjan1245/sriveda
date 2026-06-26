import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const svc = db.service as any;

export async function GET() {
  const services = await svc
    .findMany({ where: { active: true }, orderBy: { order: "asc" } })
    .catch(() => []);
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, slug, shortDesc, description, price, duration, image, category, active } =
    await req.json();

  if (!name || !slug || price === undefined || price === "") {
    return NextResponse.json({ error: "Name, slug, and price are required." }, { status: 400 });
  }

  const count = await svc.count();

  try {
    const service = await svc.create({
      data: {
        name,
        slug,
        shortDesc: shortDesc || null,
        description: description || "",
        price: parseFloat(price),
        duration: duration || null,
        image: image || null,
        category: category || null,
        active: active ?? true,
        order: count,
      },
    });
    revalidateTag("services", "max");
    revalidatePath("/", "page");
    revalidatePath("/services", "page");
    return NextResponse.json(service);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === "P2002") {
      return NextResponse.json({ error: "A service with this slug already exists." }, { status: 409 });
    }
    console.error("[POST /api/services]", e.code, e.message);
    return NextResponse.json({ error: "Failed to create service." }, { status: 500 });
  }
}
