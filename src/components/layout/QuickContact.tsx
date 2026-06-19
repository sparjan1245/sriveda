"use client";

import { useState } from "react";

const ITEMS = [
  {
    label: "Call Us",
    href: "tel:+16692138780",
    bg: "#16a34a",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/16692138780",
    bg: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/srivedagayatritemple",
    bg: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@srivedagayatritemple",
    bg: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

type QuickItemProps = {
  label: string;
  href: string;
  bg: string;
  icon: React.ReactNode;
  expanded: boolean;
  onHover: () => void;
  onLeave: () => void;
};

function QuickItem({
  label,
  href,
  bg,
  icon,
  expanded,
  onHover,
  onLeave,
}: QuickItemProps) {
  return (
    <a
      href={href}
      target={href.startsWith("tel:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="flex items-center h-12 w-40 rounded-l-full text-white shadow-lg"
      style={{
        backgroundColor: bg,
        transform: expanded
          ? "translateX(0)"
          : "translateX(calc(100% - 48px))",
        transition: "transform 0.3s ease",
      }}
    >
      <span className="flex items-center justify-center w-12 h-12 shrink-0">
        {icon}
      </span>

      <span
        className="pr-4 text-sm font-semibold whitespace-nowrap"
        style={{
          opacity: expanded ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        {label}
      </span>
    </a>
  );
}

export default function QuickContact() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2 overflow-visible">
      {ITEMS.map((item) => (
        <QuickItem
          key={item.label}
          {...item}
          expanded={hoveredItem === item.label}
          onHover={() => setHoveredItem(item.label)}
          onLeave={() => setHoveredItem(null)}
        />
      ))}
    </div>
  );
}