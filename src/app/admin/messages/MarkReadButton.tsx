"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

export default function MarkReadButton({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const markRead = async () => {
    setLoading(true);
    await fetch(`/api/messages/${messageId}`, { method: "PATCH" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={markRead}
      disabled={loading}
      className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center gap-1"
    >
      <CheckCheck className="w-3 h-3" />
      Mark Read
    </button>
  );
}
