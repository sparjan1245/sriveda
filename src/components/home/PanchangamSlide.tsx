import Image from "next/image";
import { TEMPLE } from "@/lib/constants";

export interface PanchangamData {
  id: string;
  date: string;
  samvatsara?: string | null;
  masam?: string | null;
  ayanam?: string | null;
  ruthuvu?: string | null;
  thithi?: string | null;
  nakshatra?: string | null;
  varjyam?: string | null;
  durmuhurtam?: string | null;
  rahuKalam?: string | null;
  yamagandam?: string | null;
  goodTime?: string | null;
  priestName?: string | null;
}

function formatPanchangamDate(isoDate: string): string {
  const datePart = isoDate.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const s = day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
  return `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${day}${s} ${year}`;
}

export default function PanchangamSlide({ data }: { data: PanchangamData }) {
  const dateLabel  = formatPanchangamDate(data.date);
  const hinduLine1 = [data.samvatsara, data.masam].filter(Boolean).join(", ");
  const hinduLine2 = [data.ayanam, data.ruthuvu].filter(Boolean).join(", ");
  const priest     = data.priestName || "VELURI SUBRAHMANYA SARMA";

  const fields = [
    { label: "Thithi",       value: data.thithi },
    { label: "Nakshthra",    value: data.nakshatra },
    { label: "Varjyam",      value: data.varjyam },
    { label: "Durmuhurtam",  value: data.durmuhurtam },
    { label: "Rahu Kalam",   value: data.rahuKalam },
    { label: "Yamagandam",   value: data.yamagandam },
    { label: "Good Time",    value: data.goodTime },
  ].filter((f) => f.value);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center py-4 px-3 overflow-y-auto"
      style={{ background: "linear-gradient(135deg,#FFF8F0 0%,#FCEABC 40%,#FFF8F0 100%)" }}
    >
      {/* OM watermark */}
      <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span style={{ fontSize: "min(52vw,440px)", color: "rgba(107,15,26,0.045)", fontFamily: "serif", lineHeight: 1 }}>
          ॐ
        </span>
      </div>

      {/* Poster card */}
      <div
        className="relative z-10 w-full my-2"
        style={{
          maxWidth: "430px",
          background: "#FFFAF2",
          boxShadow: "0 0 0 3px #8B4513,0 0 0 6px #D4A017,0 0 0 9px #8B4513,0 8px 40px rgba(0,0,0,0.22)",
          borderRadius: "2px",
          padding: "12px 18px",
        }}
      >
        {/* Top ornamental row */}
        <div style={{ textAlign: "center", fontSize: "0.95rem", letterSpacing: "0.45em", marginBottom: "6px" }}>
          🔔🌺🔔🌺🔔🌺🔔
        </div>

        {/* Gold inner line */}
        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#D4A017 25%,#D4A017 75%,transparent)", marginBottom: "8px" }} />

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "5px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "2px solid #D4A017", overflow: "hidden", flexShrink: 0 }}>
            <Image src="/logo.png" alt="Sri Veda Gayatri Temple" width={56} height={56} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        {/* Temple name */}
        <h2 style={{ fontFamily: "Georgia,serif", fontWeight: 900, color: "#1a237e", fontSize: "0.9rem", textAlign: "center", letterSpacing: "0.1em", margin: "0 0 2px", textTransform: "uppercase" }}>
          Sri Veda Gayatri Temple
        </h2>
        <p style={{ fontSize: "0.58rem", color: "#555", textAlign: "center", margin: "0 0 7px" }}>
          {TEMPLE.address}
        </p>

        {/* TODAY PANCHANGAM badge */}
        <div style={{ border: "2px solid #1a237e", margin: "0 6px 7px", padding: "3px 0", textAlign: "center" }}>
          <span style={{ color: "#1a237e", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.14em", fontFamily: "Georgia,serif" }}>
            ✦&ensp;TODAY PANCHANGAM&ensp;✦
          </span>
        </div>

        {/* Hindu calendar lines */}
        {hinduLine1 && (
          <p style={{ textAlign: "center", fontSize: "0.62rem", fontWeight: 700, color: "#8B0000", margin: "0 0 2px", letterSpacing: "0.02em" }}>
            {hinduLine1}
          </p>
        )}
        {hinduLine2 && (
          <p style={{ textAlign: "center", fontSize: "0.6rem", fontWeight: 600, color: "#6B4226", margin: "0 0 5px" }}>
            {hinduLine2}
          </p>
        )}

        {/* Gregorian date */}
        <p style={{ textAlign: "center", fontWeight: 800, fontSize: "0.78rem", color: "#111", margin: "0 0 7px", letterSpacing: "0.01em" }}>
          {dateLabel}
        </p>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#D4A017 25%,#D4A017 75%,transparent)", marginBottom: "7px" }} />

        {/* Fields */}
        {fields.map(({ label, value }) => (
          <div key={label} style={{ display: "flex", marginBottom: "3px", lineHeight: "1.3" }}>
            <span style={{ fontSize: "0.64rem", fontWeight: 700, color: "#1a1a1a", width: "82px", flexShrink: 0, letterSpacing: "0.01em" }}>
              {label}
            </span>
            <span style={{ fontSize: "0.64rem", color: "#555", marginRight: "5px", flexShrink: 0 }}>:</span>
            <span style={{ fontSize: "0.64rem", color: "#C45600", fontWeight: 700, flex: 1 }}>
              {value}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#D4A017 25%,#D4A017 75%,transparent)", margin: "7px 0" }} />

        {/* Priest */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "Georgia,serif", fontWeight: 900, fontSize: "0.8rem", color: "#8B0000", margin: "0 0 1px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {priest}
          </p>
          <p style={{ fontSize: "0.57rem", color: "#666", margin: "0 0 2px" }}>Founder &amp; Priest</p>
          <p style={{ fontSize: "0.54rem", color: "#888", margin: 0 }}>
            www.srivedagayatritemple.org&ensp;·&ensp;{TEMPLE.emails[0]}&ensp;·&ensp;{TEMPLE.phones[1]}
          </p>
        </div>

        {/* Gold inner line */}
        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#D4A017 25%,#D4A017 75%,transparent)", margin: "8px 0 6px" }} />

        {/* Bottom ornamental row */}
        <div style={{ textAlign: "center", fontSize: "0.95rem", letterSpacing: "0.45em" }}>
          🔔🌺🔔🌺🔔🌺🔔
        </div>
      </div>
    </div>
  );
}
