import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const data = await req.json();

  const user = await db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      gotram: data.gotram,
      nakshatra: data.nakshatra,
    },
  });

  return NextResponse.json({ id: user.id });
}
