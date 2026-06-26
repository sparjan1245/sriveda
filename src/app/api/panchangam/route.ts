import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year  = searchParams.get("year");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (month && year) {
    const m = parseInt(month) - 1;
    const y = parseInt(year);
    where.date = { gte: new Date(Date.UTC(y, m, 1)), lt: new Date(Date.UTC(y, m + 1, 1)) };
  } else if (year) {
    const y = parseInt(year);
    where.date = { gte: new Date(Date.UTC(y, 0, 1)), lt: new Date(Date.UTC(y + 1, 0, 1)) };
  }

  const entries = await db.panchangam
    .findMany({ where, orderBy: { date: "desc" } })
    .catch(() => []);

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 401 });

  const data = await req.json();
  if (!data.date) return new NextResponse("Date is required", { status: 400 });

  const [y, m, d] = (data.date as string).split("-").map(Number);
  const dateUTC = new Date(Date.UTC(y, m - 1, d));

  const entry = await db.panchangam.create({
    data: {
      date:        dateUTC,
      samvatsara:  data.samvatsara  || null,
      masam:       data.masam       || null,
      ayanam:      data.ayanam      || null,
      ruthuvu:     data.ruthuvu     || null,
      thithi:      data.thithi      || null,
      nakshatra:   data.nakshatra   || null,
      varjyam:     data.varjyam     || null,
      durmuhurtam: data.durmuhurtam || null,
      rahuKalam:   data.rahuKalam   || null,
      yamagandam:  data.yamagandam  || null,
      goodTime:    data.goodTime    || null,
      priestName:  data.priestName  || null,
    },
  });

  revalidateTag("panchangam", "max");
  revalidatePath("/", "page");
  return NextResponse.json(entry, { status: 201 });
}
