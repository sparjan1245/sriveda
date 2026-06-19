import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { TEMPLE, IMAGES } from "@/lib/constants";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Sri Veda Gayatri Temple for inquiries about services, events, and more.",
};

export default function ContactPage() {
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
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <div>
              <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Get in Touch</p>
              <h2 className="section-heading text-3xl font-bold mb-6 text-left">We&apos;d Love to Hear From You</h2>
              <p className="text-foreground/70 leading-relaxed mb-8">
                Whether you have questions about our services, want to schedule a puja, or need
                guidance on upcoming events — our team is always here to help you on your spiritual journey.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4 bg-white rounded-xl p-4 gold-border">
                  <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-semibold text-maroon mb-1">Temple Address</h4>
                    <p className="text-foreground/70 text-sm">{TEMPLE.address}</p>
                    <p className="text-foreground/50 text-xs mt-1">Mailing: {TEMPLE.mailingAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white rounded-xl p-4 gold-border">
                  <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-semibold text-maroon mb-1">Temple Hours</h4>
                    <p className="text-foreground/70 text-sm">{TEMPLE.hours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white rounded-xl p-4 gold-border">
                  <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-saffron" />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-semibold text-maroon mb-1">Phone</h4>
                    {TEMPLE.phones.map((phone) => (
                      <a key={phone} href={`tel:${phone.replace(/\D/g, "")}`} className="block text-foreground/70 text-sm hover:text-saffron transition-colors">
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
                    {TEMPLE.emails.map((email) => (
                      <a key={email} href={`mailto:${email}`} className="block text-foreground/70 text-sm hover:text-saffron transition-colors break-all">
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-6 rounded-xl overflow-hidden shadow-sm gold-border h-52">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.0!2d-121.216!3d37.796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s702+W+Yosemite+Ave%2C+Manteca%2C+CA+95337!5e0!3m2!1sen!2sus!4v1!5m2!1sen!2sus"
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
                <p className="text-foreground/60 text-sm mb-6">We&apos;ll respond within 24 hours.</p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
