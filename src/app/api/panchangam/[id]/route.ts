import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const data = await req.json();

  let dateUTC: Date | undefined;
  if (data.date) {
    const [y, m, d] = (data.date as string).split("-").map(Number);
    dateUTC = new Date(Date.UTC(y, m - 1, d));
  }

  const entry = await db.panchangam.update({
    where: { id },
    data: {
      ...(dateUTC && { date: dateUTC }),
      samvatsara:  data.samvatsara  ?? undefined,
      masam:       data.masam       ?? undefined,
      ayanam:      data.ayanam      ?? undefined,
      ruthuvu:     data.ruthuvu     ?? undefined,
      thithi:      data.thithi      ?? undefined,
      nakshatra:   data.nakshatra   ?? undefined,
      varjyam:     data.varjyam     ?? undefined,
      durmuhurtam: data.durmuhurtam ?? undefined,
      rahuKalam:   data.rahuKalam   ?? undefined,
      yamagandam:  data.yamagandam  ?? undefined,
      goodTime:    data.goodTime    ?? undefined,
      priestName:  data.priestName  ?? undefined,
    },
  });

  revalidateTag("panchangam", "max");
  revalidatePath("/", "page");
  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  await db.panchangam.delete({ where: { id } });

  revalidateTag("panchangam", "max");
  revalidatePath("/", "page");
  return new NextResponse(null, { status: 204 });
}
