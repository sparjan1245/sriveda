import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any);

const tiers = [
  { name: "Food Sponsor (Anna Prasadam)", description: "Sponsor the blessed food offering distributed every Sunday at the temple.", amount: 51, recurring: false, order: 0 },
  { name: "Pushpa Alankara Seva", description: "Sponsor the flower decoration ceremony for the deities.", amount: 75, recurring: false, order: 1 },
  { name: "Abhishekam Seva", description: "Sponsor the sacred ritual bathing (Abhishekam) of the deity.", amount: 116, recurring: false, order: 2 },
  { name: "Vastra Sponsor", description: "Sponsor the sacred clothing (Vastra) offered to the deities.", amount: 150, recurring: false, order: 3 },
  { name: "Monthly Dollar-a-Day", description: "A meaningful monthly contribution of $30 to support daily temple operations.", amount: 30, recurring: true, order: 4 },
  { name: "Bronze Sponsor", description: "Support the temple mission with a generous Bronze sponsorship.", amount: 500, recurring: false, order: 5 },
  { name: "Silver Sponsor", description: "Make a significant impact with a Silver sponsorship for the temple.", amount: 2500, recurring: false, order: 6 },
  { name: "Gold Sponsor", description: "Become a Gold Sponsor and be a cornerstone of our spiritual community.", amount: 5000, recurring: false, order: 7 },
];

async function main() {
  const existing = await db.donationTier.count();
  if (existing > 0) {
    console.log(`Donation tiers already seeded (${existing} found). Skipping.`);
    return;
  }
  await db.donationTier.createMany({ data: tiers });
  console.log(`✅ Seeded ${tiers.length} donation tiers.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
