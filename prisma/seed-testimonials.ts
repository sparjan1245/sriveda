import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any);

const testimonials = [
  { name: "Priya Sharma", location: "Stockton, CA", avatar: "PS", rating: 5, order: 0, text: "The Abhishekam ceremony was deeply moving. The chanting and rituals were conducted with such devotion and authenticity. Sri Veda Gayatri Temple has truly become our spiritual home in California." },
  { name: "Rajan & Meena Patel", location: "Tracy, CA", avatar: "RP", rating: 5, order: 1, text: "We had our son's Upanayana Samskara performed here and it was a beautiful experience. The priest explained each step with such depth. The temple team was incredibly welcoming throughout." },
  { name: "Dr. Ananya Krishnan", location: "Modesto, CA", avatar: "AK", rating: 5, order: 2, text: "The weekly Annadaanam is a wonderful initiative. I can see the incredible love and dedication the founders and priests put into every ritual and community event. Truly a blessed place." },
];

async function main() {
  const existing = await db.testimonial.count();
  if (existing > 0) { console.log(`Already seeded (${existing} found). Skipping.`); return; }
  await db.testimonial.createMany({ data: testimonials });
  console.log(`✅ Seeded ${testimonials.length} testimonials.`);
}

main().catch(console.error).finally(() => db.$disconnect());
