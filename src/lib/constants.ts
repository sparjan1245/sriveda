export const TEMPLE = {
  name: "Sri Veda Gayatri Temple",
  fullName: "Sri Veda Gayatri Temple (Veda Gayatri Cultural Center)",
  tagline: "Welcome to Our Hindu Religious Services",
  mission:
    "Foster spiritual growth, provide cultural education, and organize religious activities that uplift and enrich the lives of individuals within the community.",
  quote:
    "Culture is not just tradition but a sacred bridge that connects us to the Divine.",
  founded: "2024",
  address: "702 W Yosemite Ave, Manteca, CA 95337",
  mailingAddress: "16045 Mavericks Lane, Lathrop, CA 95330",
  phones: ["+1 (669) 213-8780", "+1 (510) 634-3208"],
  emails: ["vgcc@srivedagayatritemple.org", "vgccpriest@srivedgayatritemple.org"],
  primaryEmail: "vgcc@srivedagayatritemple.org",
  hours: "Monday – Sunday: 5:00 PM – 9:00 PM",
  taxId: "99-4945072",
  taxStatus: "California Registered Non-Profit Organization",
  ein: "501(c)(3)",
};

export const IMAGES = {
  hero: "https://srivedagayatritemple.org/wp-content/uploads/2026/01/pexels-mugesh-dsraj-218642671-11885769-1-1024x618.jpg",
  temple1: "https://srivedagayatritemple.org/wp-content/uploads/2026/01/pexels-photo-774282-1-1024x682.jpeg",
  puja: "https://srivedagayatritemple.org/wp-content/uploads/2026/01/pexels-photo-1583244-1.jpeg",
  altar: "https://srivedagayatritemple.org/wp-content/uploads/2026/01/pexels-photo-1583244.jpeg",
  download4: "https://srivedagayatritemple.org/wp-content/uploads/2026/01/download-4.jpg",
  about1: "/about.jpeg",
  about2: "https://srivedagayatritemple.org/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-05-at-9.12.39-PM-1-1.jpeg",
  about3: "https://srivedagayatritemple.org/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-05-at-9.13.45-PM-2.jpeg",
  about4: "https://srivedagayatritemple.org/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-05-at-9.13.45-PM-1-1.jpeg",
  pujaBase: "https://srivedagayatritemple.org/wp-content/uploads/2026/01/pexels-photo-1583244.jpeg",
};

export const BOARD_MEMBERS = [
  {
    name: "Veluri Subramanyam",
    title: "Founder & Chairman",
    image: IMAGES.about1,
  },
  {
    name: "Sri Venkata Sastry Hari",
    title: "Board Director",
    image: IMAGES.about2,
  },
  {
    name: "Siva Ramakrishna Dendukuri",
    title: "Board Director",
    image: IMAGES.about3,
  },
  {
    name: "Dr. Sahithi Latha Bandari",
    title: "Board Director",
    image: IMAGES.about4,
  },
];

export const SERVICES = [
  {
    slug: "archana-abhishekam",
    name: "Archana & Abhishekam",
    shortDesc: "Daily rituals honoring deities with traditional puja ceremonies, flowers, fruits, and prayers.",
    description:
      "Archana and Abhishekam are sacred daily rituals performed to honor various deities. Archana involves the recitation of the deity's 108 names while offering flowers, and Abhishekam is the ritual bathing of the deity with sacred substances like milk, honey, and water. These timeless ceremonies create a deep spiritual connection between the devotee and the Divine.",
    price: 51,
    duration: "1 hour",
    image: IMAGES.altar,
    category: "Daily Rituals",
  },
  {
    slug: "special-pujas-homams",
    name: "Special Pujas & Homams",
    shortDesc: "Sacred fire rituals seeking divine blessings, removing obstacles, and purifying mind and surroundings.",
    description:
      "Homams (fire rituals) are ancient Vedic ceremonies where offerings are made into sacred fire as a means of communion with the Divine. Each Homam is performed for a specific purpose — Ganapathi Homam for removing obstacles, Sudarshana Homam for protection, Navagraha Homam for planetary peace, and many more. Our trained priests conduct these powerful rituals with full Vedic procedures.",
    price: 116,
    duration: "2–3 hours",
    image: IMAGES.puja,
    category: "Pujas & Homams",
  },
  {
    slug: "samskaras",
    name: "Samskaras (Life Cycle Rituals)",
    shortDesc: "Sacred life-cycle ceremonies: Namakarana, Upanayana, Vivaha, and Antyeshti.",
    description:
      "Samskaras are sacred Hindu rites of passage that mark the important milestones of a devotee's life journey. We perform Namakarana (Naming Ceremony), Annaprashana (First Feeding), Upanayana (Sacred Thread Ceremony), Vivaha (Marriage Ceremony), and Antyeshti (Last Rites). Our priests ensure each Samskara is performed with full Vedic authenticity and meaning.",
    price: 201,
    duration: "2–4 hours",
    image: IMAGES.temple1,
    category: "Life Ceremonies",
  },
  {
    slug: "astrology-consultations",
    name: "Astrological Consultations",
    shortDesc: "Personalized Vedic astrology guidance on life path, career, relationships, and spiritual growth.",
    description:
      "Our Vedic astrology consultations provide deep spiritual guidance based on your birth chart (Janma Kundali). Our experienced astrologer helps you understand your life path, career choices, relationship compatibility, auspicious timings (Muhurtas) for important events, and remedies for planetary doshas. Each consultation is a sacred conversation grounded in the ancient wisdom of Jyotish.",
    price: 75,
    duration: "45–60 minutes",
    image: IMAGES.download4,
    category: "Consultations",
  },
];

export const DONATION_TIERS = [
  {
    id: "anna-prasadam",
    name: "Food Sponsor (Anna Prasadam)",
    description: "Sponsor the blessed food offering distributed every Sunday at the temple.",
    amount: 51,
    recurring: false,
  },
  {
    id: "pushpa-alankara",
    name: "Pushpa Alankara Seva",
    description: "Sponsor the flower decoration ceremony for the deities.",
    amount: 75,
    recurring: false,
  },
  {
    id: "abhishekam-seva",
    name: "Abhishekam Seva",
    description: "Sponsor the sacred ritual bathing (Abhishekam) of the deity.",
    amount: 116,
    recurring: false,
  },
  {
    id: "vastra-sponsor",
    name: "Vastra Sponsor",
    description: "Sponsor the sacred clothing (Vastra) offered to the deities.",
    amount: 150,
    recurring: false,
  },
  {
    id: "dollar-a-day",
    name: "Monthly Dollar-a-Day",
    description: "A meaningful monthly contribution of $30 to support daily temple operations.",
    amount: 30,
    recurring: true,
  },
  {
    id: "bronze-sponsor",
    name: "Bronze Sponsor",
    description: "Support the temple's mission with a generous Bronze sponsorship.",
    amount: 500,
    recurring: false,
  },
  {
    id: "silver-sponsor",
    name: "Silver Sponsor",
    description: "Make a significant impact with a Silver sponsorship for the temple.",
    amount: 2500,
    recurring: false,
  },
  {
    id: "gold-sponsor",
    name: "Gold Sponsor",
    description: "Become a Gold Sponsor and be a cornerstone of our spiritual community.",
    amount: 5000,
    recurring: false,
  },
];
