import { cache } from "react";
import { db } from "@/lib/db";
import { TEMPLE } from "@/lib/constants";

export interface ContactInfo {
  address: string;
  mailingAddress: string;
  phones: string[];
  emails: string[];
  hours: string;
  social: {
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
    twitter: string | null;
    whatsapp: string | null;
  };
}

// Preserves the site's current look until an admin edits Settings → Contact & Social.
const SOCIAL_DEFAULTS = {
  facebook: "https://facebook.com/srivedagayatritemple",
  instagram: "https://instagram.com/srivedagayatritemple",
  youtube: "https://www.youtube.com/@srivedagayatritemple",
  twitter: null as string | null,
  whatsapp: "+16692138780",
};

export const getContactInfo = cache(async (): Promise<ContactInfo> => {
  const s = await db.siteSettings.findUnique({ where: { id: "main" } }).catch(() => null);

  return {
    address: s?.contactAddress || TEMPLE.address,
    mailingAddress: s?.contactMailingAddress || TEMPLE.mailingAddress,
    phones: s?.contactPhones?.length ? s.contactPhones : TEMPLE.phones,
    emails: s?.contactEmails?.length ? s.contactEmails : TEMPLE.emails,
    hours: s?.contactHours || TEMPLE.hours,
    social: {
      facebook: s?.facebookUrl || SOCIAL_DEFAULTS.facebook,
      instagram: s?.instagramUrl || SOCIAL_DEFAULTS.instagram,
      youtube: s?.youtubeUrl || SOCIAL_DEFAULTS.youtube,
      twitter: s?.twitterUrl || SOCIAL_DEFAULTS.twitter,
      whatsapp: s?.whatsappNumber || SOCIAL_DEFAULTS.whatsapp,
    },
  };
});
