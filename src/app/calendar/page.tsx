import { db } from "@/lib/db";
import CalendarViewer from "./CalendarViewer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hindu Calendar — Sri Veda Gayatri Temple",
  description: "Annual Hindu calendar for Sri Veda Gayatri Temple, Manteca, CA.",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = yearParam ? parseInt(yearParam) : currentYear;

  const [calendar, yearRows] = await Promise.all([
    db.calendar.findFirst({ where: { year, active: true } }).catch(() => null),
    db.calendar
      .findMany({ where: { active: true }, select: { year: true }, orderBy: { year: "desc" } })
      .catch(() => []),
  ]);
  const years = yearRows.map((r) => r.year);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <CalendarViewer
        calendar={calendar ? { ...calendar, images: calendar.images } : null}
        currentYear={year}
        availableYears={years}
      />
    </div>
  );
}
