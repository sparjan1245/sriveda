"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff } from "lucide-react";
import ServiceForm from "./ServiceForm";

interface Service {
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
}

export default function ServiceActions({ service }: { service: Service }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const patch = async (data: object) => {
    setLoading(true);
    await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
    setLoading(false);
  };

  const remove = async () => {
    if (!confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete.");
      setLoading(false);
      return;
    }
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <ServiceForm service={service} />
      <button
        onClick={() => patch({ active: !service.active })}
        disabled={loading}
        title={service.active ? "Deactivate" : "Activate"}
        className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
          service.active
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        {service.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
      <button
        onClick={remove}
        disabled={loading}
        title="Delete service"
        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
