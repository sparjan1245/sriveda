"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import BannerForm from "./BannerForm";

interface Banner {
  id: string;
  image: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  cta2Text: string | null;
  cta2Link: string | null;
  active: boolean;
  order: number;
}

interface Props {
  banner: Banner;
  total: number;
}

export default function BannerActions({ banner, total }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const patch = async (data: object) => {
    setLoading(true);
    await fetch(`/api/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
    setLoading(false);
  };

  const remove = async () => {
    if (!confirm("Delete this banner slide?")) return;
    setLoading(true);
    await fetch(`/api/banners/${banner.id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <BannerForm banner={banner} />
      <button
        onClick={() => patch({ active: !banner.active })}
        disabled={loading}
        title={banner.active ? "Hide banner" : "Show banner"}
        className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
          banner.active
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        {banner.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
      <button
        onClick={() => patch({ order: banner.order - 1 })}
        disabled={loading || banner.order === 0}
        title="Move up"
        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-30"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => patch({ order: banner.order + 1 })}
        disabled={loading || banner.order === total - 1}
        title="Move down"
        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-30"
      >
        <ArrowDown className="w-4 h-4" />
      </button>
      <button
        onClick={remove}
        disabled={loading}
        title="Delete banner"
        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
