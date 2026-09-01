import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import { getContactInfo } from "@/lib/contact";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Sri Veda Gayatri Temple for inquiries about services, events, and more.",
};

export default async function ContactPage() {
  const contact = await getContactInfo();
  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`;

  return (
    <div>
      {/* ── Inner Page Banner ── */}
      <section className="relative h-20 md:h-22 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.temple1} alt="Contact Us" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-maroon/60" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(212,160,23,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-2 text-white/70 text-[11px] tracking-widest uppercase mb-3">
            <span>Home</span>
            <span className="text-gold/60">›</span>
            <span className="text-gold/80">Contact Us</span>
          </div>
          
        </div>
      </section>

      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-3xl mx-auto text-center mb-12">
           <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-3">Get in Touch</p>
              <h2 className="section-heading text-3xl font-bold mb-6 text-left">We&apos;d Love to Hear From You</h2>
              <p className="text-foreground leading-relaxed mb-8">
                Whether you have questions about our services, want to schedule a puja, or need
                guidance on upcoming events — our team is always here to help you on your spiritual journey.
              </p>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <div>
             

              <div className="space-y-5">
                <div className="flex items-start gap-4 bg-white rounded-xl p-4 gold-border">
                  <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-semibold text-maroon mb-1">Temple Address</h4>
                    <p className="text-foreground text-sm">{contact.address}</p>
                    <p className="text-foreground text-xs mt-1">Mailing: {contact.mailingAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white rounded-xl p-4 gold-border">
                  <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-semibold text-maroon mb-1">Temple Hours</h4>
                    <p className="text-foreground text-sm">{contact.hours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white rounded-xl p-4 gold-border">
                  <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-semibold text-maroon mb-1">Phone</h4>
                    {contact.phones.map((phone) => (
                      <a key={phone} href={`tel:${phone.replace(/\D/g, "")}`} className="block text-foreground text-sm hover:text-saffron transition-colors">
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white rounded-xl p-4 gold-border">
                  <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-semibold text-maroon mb-1">Email</h4>
                    {contact.emails.map((email) => (
                      <a key={email} href={`mailto:${email}`} className="block text-foreground text-sm hover:text-saffron transition-colors break-all">
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-6 rounded-xl overflow-hidden shadow-sm gold-border h-52">
                <iframe
                  src={mapEmbedSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Temple Location"
                />
              </div>
            </div>

            {/* Form */}
            <div>
              <div className="bg-white rounded-2xl p-8 gold-border shadow-sm">
                <h3 className="font-cinzel font-semibold text-maroon text-2xl mb-2">Send a Message</h3>
                <p className="text-foreground text-sm mb-6">We&apos;ll respond within 24 hours.</p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
