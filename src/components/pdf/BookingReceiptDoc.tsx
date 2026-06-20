import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const MAROON = "#6B0F1A";
const GOLD = "#D4A017";
const SAFFRON = "#E8610A";
const CREAM = "#FFF8F0";

export interface BookingReceiptDocProps {
  logoUrl: string;
  receiptNo: string;
  createdAt: string;
  status: string;
  devoteeName: string;
  devoteeEmail?: string;
  devoteePhone?: string;
  gotra?: string;
  nakshatra?: string;
  sankalpam?: string;
  serviceName: string;
  serviceDate: string;
  occasion?: string;
  paymentMode: string;
  notes?: string;
  amountFormatted: string;
  amountInWords: string;
  templeAddress: string;
  templePhone: string;
  templeEmail: string;
}

const STATUS_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  PENDING:   { bg: "#fefce8", border: "#fef08a", text: "#a16207" },
  CONFIRMED: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  COMPLETED: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  CANCELLED: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
};

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, backgroundColor: "#fff" },

  // ── Header ──────────────────────────────────────────────
  header: { backgroundColor: MAROON, paddingHorizontal: 36, paddingVertical: 18, alignItems: "center" },
  logo: { width: 56, height: 56, marginBottom: 7 },
  hName: { color: "#fff", fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "center" },
  hSub: { color: "rgba(255,255,255,0.75)", fontSize: 7.5, marginTop: 2, textAlign: "center" },

  goldBar: { height: 3, backgroundColor: GOLD },

  // ── Title row ───────────────────────────────────────────
  titleArea: {
    paddingHorizontal: 36, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(212,160,23,0.22)",
    alignItems: "center",
  },
  titleText: { fontSize: 12, fontFamily: "Helvetica-Bold", color: MAROON, letterSpacing: 1.5, textAlign: "center", marginBottom: 8 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  metaLabel: { color: "rgba(26,26,26,0.5)", fontSize: 8.5 },
  metaNo: { color: MAROON, fontFamily: "Helvetica-Bold", fontSize: 10 },

  // ── Body ────────────────────────────────────────────────
  body: { paddingHorizontal: 36, paddingTop: 14 },
  sec: { marginBottom: 11 },
  secTitle: { fontFamily: "Helvetica-Bold", color: MAROON, fontSize: 7.5, letterSpacing: 1.5, marginBottom: 5 },

  // Status
  badge: { alignSelf: "center", paddingVertical: 4, paddingHorizontal: 14, borderRadius: 4, borderWidth: 1, marginBottom: 10 },
  badgeText: { fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "center" },

  // Info box
  infoBox: { backgroundColor: CREAM, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", flexWrap: "wrap" },
  infoCell: { width: "50%", paddingBottom: 5 },
  infoLabel: { fontSize: 7.5, color: "rgba(26,26,26,0.5)", marginBottom: 1.5 },
  infoVal: { fontSize: 9, fontFamily: "Helvetica-Bold", color: MAROON },

  // Sankalpam
  sankBox: { borderWidth: 1, borderColor: "rgba(212,160,23,0.22)", borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  sankText: { fontSize: 8.5, fontStyle: "italic", color: "rgba(26,26,26,0.8)" },

  // Table
  table: { borderWidth: 1, borderColor: "rgba(212,160,23,0.22)", borderRadius: 8 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "rgba(212,160,23,0.12)" },
  rowAmt: { flexDirection: "row", backgroundColor: "rgba(107,15,26,0.04)" },
  tdL: { width: "38%", paddingVertical: 7, paddingHorizontal: 10, color: "rgba(26,26,26,0.5)" },
  tdV: { flex: 1, paddingVertical: 7, paddingHorizontal: 10, color: MAROON, fontFamily: "Helvetica-Bold" },
  tdLA: { width: "38%", paddingVertical: 9, paddingHorizontal: 10, fontFamily: "Helvetica-Bold", color: MAROON },
  tdVA: { flex: 1, paddingVertical: 9, paddingHorizontal: 10, fontFamily: "Helvetica-Bold", color: SAFFRON, fontSize: 12 },

  // Amount in words
  wordsBox: { borderWidth: 1, borderColor: "rgba(212,160,23,0.22)", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  wordsLabel: { color: "rgba(26,26,26,0.5)", fontSize: 7.5, marginRight: 4 },
  wordsVal: { color: MAROON, fontFamily: "Helvetica-Bold", fontSize: 8.5, flex: 1 },

  // Signatures
  sigRow: { flexDirection: "row", marginTop: 16, marginBottom: 14 },
  sigItem: { flex: 1, alignItems: "center" },
  sigLine: { borderTopWidth: 1.5, borderTopColor: "rgba(107,15,26,0.18)", width: "68%", marginTop: 26, paddingTop: 5, alignItems: "center" },
  sigLabel: { fontSize: 7.5, color: "rgba(26,26,26,0.5)", textAlign: "center" },

  // Footer
  footer: { backgroundColor: MAROON, paddingVertical: 8, paddingHorizontal: 36, alignItems: "center", marginTop: 12 },
  footerText: { color: "rgba(255,255,255,0.6)", fontSize: 7.5, textAlign: "center" },
});

export default function BookingReceiptDoc(props: BookingReceiptDocProps) {
  const sc = STATUS_STYLE[props.status] || STATUS_STYLE.PENDING;

  const rows: [string, string][] = [
    ["Service", props.serviceName],
    ["Service Date", props.serviceDate],
    ...(props.occasion ? [["Occasion", props.occasion] as [string, string]] : []),
    ["Payment Mode", props.paymentMode],
    ...(props.notes ? [["Notes", props.notes] as [string, string]] : []),
  ];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Image src={props.logoUrl} style={s.logo} />
          <Text style={s.hName}>Sri Veda Gayatri Cultural Center</Text>
          <Text style={s.hSub}>{props.templeAddress}</Text>
          <Text style={s.hSub}>{props.templePhone}  ·  {props.templeEmail}</Text>
        </View>

        <View style={s.goldBar} />

        {/* Title */}
        <View style={s.titleArea}>
          <Text style={s.titleText}>SERVICE BOOKING RECEIPT</Text>
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>Receipt No.</Text>
            <Text style={s.metaNo}>{props.receiptNo}</Text>
            <Text style={s.metaLabel}>Date: {props.createdAt}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>
          {/* Status */}
          <View style={[s.badge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Text style={[s.badgeText, { color: sc.text }]}>Booking Status: {props.status}</Text>
          </View>

          {/* Devotee details */}
          <View style={s.sec}>
            <Text style={s.secTitle}>DEVOTEE DETAILS</Text>
            <View style={s.infoBox}>
              <View style={s.infoCell}>
                <Text style={s.infoLabel}>Name</Text>
                <Text style={s.infoVal}>{props.devoteeName}</Text>
              </View>
              {props.devoteePhone && (
                <View style={s.infoCell}>
                  <Text style={s.infoLabel}>Phone</Text>
                  <Text style={s.infoVal}>{props.devoteePhone}</Text>
                </View>
              )}
              {props.devoteeEmail && (
                <View style={s.infoCell}>
                  <Text style={s.infoLabel}>Email</Text>
                  <Text style={s.infoVal}>{props.devoteeEmail}</Text>
                </View>
              )}
              {props.gotra && (
                <View style={s.infoCell}>
                  <Text style={s.infoLabel}>Gotra</Text>
                  <Text style={s.infoVal}>{props.gotra}</Text>
                </View>
              )}
              {props.nakshatra && (
                <View style={s.infoCell}>
                  <Text style={s.infoLabel}>Nakshatra</Text>
                  <Text style={s.infoVal}>{props.nakshatra}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Sankalpam */}
          {props.sankalpam && (
            <View style={s.sec}>
              <Text style={s.secTitle}>SANKALPAM</Text>
              <View style={s.sankBox}>
                <Text style={s.sankText}>{props.sankalpam}</Text>
              </View>
            </View>
          )}

          {/* Service details */}
          <View style={s.sec}>
            <Text style={s.secTitle}>SERVICE DETAILS</Text>
            <View style={s.table}>
              {rows.map(([label, value]) => (
                <View key={label} style={s.row}>
                  <Text style={s.tdL}>{label}</Text>
                  <Text style={s.tdV}>{value}</Text>
                </View>
              ))}
              <View style={s.rowAmt}>
                <Text style={s.tdLA}>Amount</Text>
                <Text style={s.tdVA}>{props.amountFormatted}</Text>
              </View>
            </View>
          </View>

          {/* Amount in words */}
          <View style={[s.sec, s.wordsBox]}>
            <Text style={s.wordsLabel}>AMOUNT IN WORDS: </Text>
            <Text style={s.wordsVal}>{props.amountInWords}</Text>
          </View>

          {/* Signatures */}
          <View style={s.sigRow}>
            {(["Authorized Signatory", "Temple Priest"] as const).map((label) => (
              <View key={label} style={s.sigItem}>
                <View style={s.sigLine}>
                  <Text style={s.sigLabel}>{label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            www.srivedagayatritemple.org  ·  This is a computer-generated receipt
          </Text>
        </View>
      </Page>
    </Document>
  );
}
