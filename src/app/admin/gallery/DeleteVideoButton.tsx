"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteVideoButton({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this video?")) return;
    setLoading(true);
    await fetch(`/api/gallery/videos/${videoId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-red-600">
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
    </button>
  );
}
