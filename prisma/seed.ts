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

  if ((await db.sponsorTier.count()) === 0) {
    await db.sponsorTier.createMany({
      data: [
        {
          name: "Devotee Seva", minAmount: 51, maxAmount: 999,
          benefits: "Support daily poojas and temple maintenance\nName listed in weekly announcements\nSpecial blessing at events",
        },
        {
          name: "Bronze Seva", minAmount: 1000, maxAmount: 2499,
          benefits: "All Devotee benefits\nDedicated pooja on a monthly festival\nAnnual recognition in temple newsletter",
        },
        {
          name: "Silver Seva", minAmount: 2500, maxAmount: 4999,
          benefits: "Sponsor festivals, pooja materials, or lighting\nCertificate of appreciation\nPriority event seating\nFamily name on temple board",
        },
        {
          name: "Gold Seva", minAmount: 5000, maxAmount: 9999,
          benefits: "Sponsor homams, sanctum preparation, or mandapam upgrades\nNaming rights for a temple event\nPersonal meeting with board",
        },
        {
          name: "Platinum Seva", minAmount: 10000, maxAmount: 24999,
          benefits: "Sponsor deity installation or Maha Kumbhabhishekam rituals\nFamily participation in key ceremonies\nLifetime recognition plaque\nFeatured in all publications",
        },
        {
          name: "Diamond Seva", minAmount: 25000, maxAmount: null, highlighted: true,
          benefits: "Sponsor major renovation phase or Prana Pratishta\nDonor recognition as per temple guidelines\nHighest honour from the board\nPermanent dedication plaque",
        },
      ],
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

  const festivalYear = 2026;
  const festivalsByMonth: [number, string[]][] = [
    [1,  ["Sankranti / Pongal", "Vaikuntha Ekadashi"]],
    [2,  ["Maha Shivaratri", "Thai Poosam"]],
    [3,  ["Ugadi (Telugu New Year)", "Holi", "Ram Navami"]],
    [4,  ["Hanuman Jayanti", "Akshaya Tritiya"]],
    [5,  ["Buddha Purnima", "Shankaracharya Jayanti"]],
    [6,  ["Vat Purnima", "Satyanarayana Pooja"]],
    [7,  ["Guru Purnima", "Ashadha Ekadashi"]],
    [8,  ["Krishna Janmashtami", "Ganesh Chaturthi", "Onam"]],
    [9,  ["Navaratri", "Dussehra"]],
    [10, ["Diwali", "Lakshmi Puja", "Karthik Poornima"]],
    [11, ["Skanda Sashti", "Karthigai Deepam"]],
    [12, ["Gita Jayanti", "Vaikunta Ekadashi"]],
  ];

  if ((await db.festival.count({ where: { year: festivalYear } })) === 0) {
    await db.festival.createMany({
      data: festivalsByMonth.flatMap(([month, names]) =>
        names.map((name, order) => ({ year: festivalYear, month, name, order }))
      ),
    });
  }

  console.log("✅ Seeding complete!");
  console.log("   Admin login: vgcc@srivedagayatritemple.org / admin123!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
