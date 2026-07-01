import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any);

const members = [
  {
    name: "Veluri Subramanyam",
    title: "Founder & Chairman",
    bio: "Founder and Chairman of Sri Veda Gayatri Temple, dedicated to promoting Sanatana Dharma, Vedic traditions, and community service. He has led the establishment of the temple's new premises, creating a center for Vedic learning, spiritual growth, cultural heritage, and community outreach.",
    order: 0,
    active: true,
  },
  {
    name: "Sri Venkata Sastry Hari",
    title: "Board of Director",
    bio: "Board of Director committed to preserving Sanatana Dharma and supporting the temple's vision. He encourages devotees to use the Veda Gayatri Calendar as a daily spiritual guide and actively supports the construction of the new temple and community initiatives.",
    order: 1,
    active: true,
  },
  {
    name: "Siva Ramakrishna Dendukuri",
    title: "Board of Director",
    bio: "Board of Director of Veda Gayatri Cultural Center dedicated to preserving Vedic culture and traditions. He supports the publication of the Telugu Calendar and the development of the new temple as a center for spiritual learning, cultural activities, and community service.",
    order: 2,
    active: true,
  },
  {
    name: "Dr. Sahithi Latha Bandari",
    title: "Board of Director",
    bio: "Board of Director, Kuchipudi artist, and cultural educator devoted to preserving Indian traditions through dance and spiritual service. She believes dance is a form of prayer and works to inspire future generations while serving the temple community with dedication.",
    order: 3,
    active: true,
  },
];

async function main() {
  console.log("Seeding board members...\n");
  for (const m of members) {
    const exists = await db.boardMember.findFirst({ where: { name: m.name } });
    if (exists) {
      console.log(`SKIP  ${m.name} (already exists)`);
    } else {
      await db.boardMember.create({ data: m });
      console.log(`ADDED ${m.name}`);
    }
  }
  const total = await db.boardMember.count();
  console.log(`\nDone. Total board members: ${total}`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
