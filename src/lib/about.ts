import { cache } from "react";
import { db } from "@/lib/db";
import { TEMPLE, IMAGES } from "@/lib/constants";

export interface AboutInfo {
  badge: string;
  heading: string;
  paragraphs: string[];
  image: string;
  quote: {
    sanskrit: string;
    translation: string;
    attribution: string;
  };
}

// Preserves the site's current copy until an admin edits Settings → About Us.
const STORY_DEFAULTS = [
  `Sri Veda Gayatri Temple was founded in ${TEMPLE.founded} with a singular vision to establish a sacred spiritual home that preserves and promotes the timeless values of Sanatana Dharma while serving the growing Hindu community in California's Central Valley. Located at 702 W Yosemite Ave, Manteca, CA, the temple stands as a beacon of devotion, spirituality, culture, and community, welcoming people of all ages to experience the richness of Vedic traditions.`,
  `As a California Registered 501(c)(3) Non-Profit Organization (Tax ID: ${TEMPLE.taxId}), Sri Veda Gayatri Temple is dedicated to serving the community with integrity, transparency, and the highest standards of Vedic worship and spiritual practices. Every donation made to the temple is fully tax-deductible under U.S. law and directly supports our religious, educational, and charitable initiatives.`,
  `Our temple offers a wide range of spiritual and cultural services, including daily pujas, sacred homams, life cycle samskaras, Vedic astrology consultations, and religious observances. The temple organizes festivals, community gatherings, and charitable outreach programs that bring families together in devotion and service.`,
];

export const getAboutInfo = cache(async (): Promise<AboutInfo> => {
  const s = await db.siteSettings.findUnique({ where: { id: "main" } }).catch(() => null);

  const paragraphs = s?.aboutStory
    ? s.aboutStory.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : STORY_DEFAULTS;

  return {
    badge: s?.aboutBadge || "Our Story",
    heading: s?.aboutHeading || "Founded With Purpose",
    paragraphs: paragraphs.length ? paragraphs : STORY_DEFAULTS,
    image: s?.aboutImage || IMAGES.about1,
    quote: {
      sanskrit: s?.aboutQuoteSanskrit || "Lokah Samastah Sukhino Bhavantu",
      translation: s?.aboutQuoteTranslation || "May all beings, everywhere, be happy and live in peace.",
      attribution: s?.aboutQuoteAttribution || "VGCC Team",
    },
  };
});
