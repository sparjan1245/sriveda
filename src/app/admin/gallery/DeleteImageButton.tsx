"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteImageButton({ imageId }: { imageId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this photo from the gallery?")) return;
    setLoading(true);
    await fetch(`/api/gallery/${imageId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
      title="Remove photo"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
