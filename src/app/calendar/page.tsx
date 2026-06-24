import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import CalendarViewer from "./CalendarViewer";

const getCalendarByYear = unstable_cache(
  async (year: number) =>
    db.calendar.findFirst({ where: { year, active: true } }).catch(() => null),
  ["calendar-by-year"],
  { tags: ["calendar"] }
);

const getCalendarYears = unstable_cache(
  async () => {
    const rows = await db.calendar
      .findMany({ where: { active: true }, select: { year: true }, orderBy: { year: "desc" } })
      .catch(() => []);
    return rows.map((r) => r.year);
  },
  ["calendar-years"],
  { tags: ["calendar"] }
);

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

  const [calendar, years] = await Promise.all([
    getCalendarByYear(year),
    getCalendarYears(),
  ]);

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
