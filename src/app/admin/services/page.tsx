import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import ServiceForm from "./ServiceForm";
import ServiceActions from "./ServiceActions";

interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  description: string;
  price: number;
  duration: string | null;
  image: string | null;
  category: string | null;
  active: boolean;
  order: number;
  createdAt: Date;
}

export default async function AdminServicesPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (db.service as any)
    .findMany({ orderBy: { order: "asc" } })
    .catch(() => []);
  const services = raw as ServiceRow[];

  const bookingCounts = await db.booking
    .groupBy({ by: ["serviceId"], _count: { id: true } })
    .catch(() => []);

  const countMap = Object.fromEntries(
    bookingCounts.map((b) => [b.serviceId, b._count.id])
  );

  const totalBookings = bookingCounts.reduce((sum, b) => sum + b._count.id, 0);
  const activeCount = services.filter((s) => s.active).length;

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Services</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-4 py-2 gold-border text-center">
              <div className="font-cinzel font-bold text-xl text-maroon">{activeCount}</div>
              <div className="text-xs text-foreground/50">Active</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 gold-border text-center">
              <div className="font-cinzel font-bold text-xl text-maroon">{totalBookings}</div>
              <div className="text-xs text-foreground/50">Bookings</div>
            </div>
            <ServiceForm />
          </div>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <Layers className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <p className="text-foreground/50 mb-2 font-cinzel">No services yet.</p>
            <p className="text-foreground/40 text-sm mb-6">
              Add your first service to start accepting bookings from the public site.
            </p>
            <ServiceForm />
          </div>
        ) : (
          <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20 bg-cream/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-20">
                      Image
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-32">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-28">
                      Duration
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">
                      Bookings
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-28">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {services.map((service) => (
                    <tr
                      key={service.id}
                      className={`transition-colors hover:bg-cream/20 ${!service.active ? "opacity-60" : ""}`}
                    >
                      {/* Image */}
                      <td className="px-4 py-3 align-middle">
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-cream">
                          {service.image ? (
                            <Image
                              src={service.image}
                              alt={service.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Layers className="w-5 h-5 text-gold/40" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name / slug / short desc */}
                      <td className="px-4 py-3 align-middle max-w-xs">
                        <p className="font-cinzel font-semibold text-maroon text-sm">
                          {service.name}
                        </p>
                        <p className="text-foreground/40 text-xs font-mono mt-0.5">
                          /services/{service.slug}
                        </p>
                        {service.shortDesc && (
                          <p className="text-foreground/50 text-xs mt-0.5 line-clamp-1">
                            {service.shortDesc}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 align-middle">
                        {service.category ? (
                          <span className="text-xs bg-saffron/10 text-saffron px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                            {service.category}
                          </span>
                        ) : (
                          <span className="text-foreground/30 text-xs">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 align-middle">
                        <span className="font-cinzel font-semibold text-maroon text-sm">
                          {formatCurrency(service.price)}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3 align-middle text-xs text-foreground/60">
                        {service.duration || <span className="text-foreground/30">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-middle">
                        {service.active ? (
                          <span className="inline-flex text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Bookings */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-saffron" />
                          <span className="font-semibold text-maroon text-sm">
                            {countMap[service.id] || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 align-middle">
                        <ServiceActions service={service} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
