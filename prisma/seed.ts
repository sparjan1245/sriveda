import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123!", 12);
  await db.user.upsert({
    where: { email: "vgcc@srivedagayatritemple.org" },
    update: {},
    create: {
      name: "Temple Admin",
      email: "vgcc@srivedagayatritemple.org",
      password: adminPassword,
      role: "ADMIN",
      phone: "+16692138780",
      city: "Manteca",
      state: "CA",
    },
  });

  const services = [
    {
      slug: "archana-abhishekam",
      name: "Archana & Abhishekam",
      description: "Daily rituals honoring various deities with traditional puja ceremonies, flowers, fruits, and prayers.",
      price: 51,
      duration: "1 hour",
      category: "Daily Rituals",
    },
    {
      slug: "special-pujas-homams",
      name: "Special Pujas & Homams",
      description: "Sacred fire rituals seeking divine blessings, removing obstacles, and purifying mind and surroundings.",
      price: 116,
      duration: "2–3 hours",
      category: "Pujas & Homams",
    },
    {
      slug: "samskaras",
      name: "Samskaras (Life Cycle Rituals)",
      description: "Sacred Hindu rites of passage: Namakarana, Upanayana, Vivaha, and Antyeshti.",
      price: 201,
      duration: "2–4 hours",
      category: "Life Ceremonies",
    },
    {
      slug: "astrology-consultations",
      name: "Astrological Consultations",
      description: "Personalized Vedic astrology consultations based on your birth chart.",
      price: 75,
      duration: "45–60 minutes",
      category: "Consultations",
    },
  ];

  for (const service of services) {
    await db.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  const events = [
    {
      title: "Satyanarayana Pooja",
      description: "Monthly Satyanarayana Pooja for the well-being of all devotees. All are welcome.",
      date: new Date("2026-06-15T17:00:00"),
      location: "Main Hall – 702 W Yosemite Ave, Manteca",
      featured: true,
    },
    {
      title: "Guru Purnima Celebration",
      description: "Annual Guru Purnima celebration with special puja and cultural programs.",
      date: new Date("2026-07-10T17:00:00"),
      location: "Temple Grounds",
      featured: false,
    },
    {
      title: "Krishna Janmashtami",
      description: "Celebrate the birth of Lord Krishna with bhajans, abhishekam, and prasadam.",
      date: new Date("2026-08-16T17:00:00"),
      location: "Main Hall",
      featured: true,
    },
    {
      title: "Ganesh Chaturthi",
      description: "Grand Ganesh Chaturthi celebrations with homam and cultural programs.",
      date: new Date("2026-08-26T17:00:00"),
      location: "Temple Grounds",
      featured: false,
    },
  ];

  for (const event of events) {
    await db.event.create({ data: event }).catch(() => {});
  }

  console.log("✅ Seeding complete!");
  console.log("   Admin login: vgcc@srivedagayatritemple.org / admin123!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
