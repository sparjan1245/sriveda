"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { EditMemberButton } from "./BoardMemberForm";

interface BoardMember {
  id: string;
  name: string;
  title: string;
  image: string | null;
  bio: string | null;
  order: number;
  active: boolean;
}

interface Props {
  member: BoardMember;
  total: number;
}

export default function BoardMemberActions({ member, total }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const patch = async (data: object) => {
    setLoading(true);
    await fetch(`/api/board-members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
    setLoading(false);
  };

  const remove = async () => {
    if (!confirm("Remove this board member?")) return;
    setLoading(true);
    await fetch(`/api/board-members/${member.id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <EditMemberButton member={member} />
      <button
        onClick={() => patch({ active: !member.active })}
        disabled={loading}
        title={member.active ? "Hide member" : "Show member"}
        className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
          member.active
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        {member.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
      <button
        onClick={() => patch({ order: member.order - 1 })}
        disabled={loading || member.order === 0}
        title="Move up"
        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-30"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => patch({ order: member.order + 1 })}
        disabled={loading || member.order >= total - 1}
        title="Move down"
        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-30"
      >
        <ArrowDown className="w-4 h-4" />
      </button>
      <button
        onClick={remove}
        disabled={loading}
        title="Delete member"
        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
