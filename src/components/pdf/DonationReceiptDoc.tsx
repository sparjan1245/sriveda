import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const MAROON = "#6B0F1A";
const GOLD = "#D4A017";
const SAFFRON = "#E8610A";
const CREAM = "#FFF8F0";

export interface DonationReceiptDocProps {
  logoUrl: string;
  receiptNo: string;
  createdAt: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  address?: string;
  cause: string;
  paymentMode: string;
  checkRef?: string;
  message?: string;
  amountFormatted: string;
  amountInWords: string;
  taxId: string;
  templeAddress: string;
  templePhone: string;
  templeEmail: string;
}

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, backgroundColor: "#fff" },

  header: { backgroundColor: MAROON, paddingHorizontal: 36, paddingVertical: 18, alignItems: "center" },
  logo: { width: 56, height: 56, marginBottom: 7 },
  hName: { color: "#fff", fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "center" },
  hSub: { color: "rgba(255,255,255,0.75)", fontSize: 7.5, marginTop: 2, textAlign: "center" },

  goldBar: { height: 3, backgroundColor: GOLD },

  titleArea: {
    paddingHorizontal: 36, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(212,160,23,0.22)",
    alignItems: "center",
  },
  titleText: { fontSize: 12, fontFamily: "Helvetica-Bold", color: MAROON, letterSpacing: 1.5, textAlign: "center", marginBottom: 8 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  metaLabel: { color: "rgba(26,26,26,0.5)", fontSize: 8.5 },
  metaNo: { color: MAROON, fontFamily: "Helvetica-Bold", fontSize: 10 },

  body: { paddingHorizontal: 36, paddingTop: 14 },
  sec: { marginBottom: 11 },
  secTitle: { fontFamily: "Helvetica-Bold", color: MAROON, fontSize: 7.5, letterSpacing: 1.5, marginBottom: 5 },

  infoBox: { backgroundColor: CREAM, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", flexWrap: "wrap" },
  infoCell: { width: "50%", paddingBottom: 5 },
  infoLabel: { fontSize: 7.5, color: "rgba(26,26,26,0.5)", marginBottom: 1.5 },
  infoVal: { fontSize: 9, fontFamily: "Helvetica-Bold", color: MAROON },

  table: { borderWidth: 1, borderColor: "rgba(212,160,23,0.22)", borderRadius: 8 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "rgba(212,160,23,0.12)" },
  rowAmt: { flexDirection: "row", backgroundColor: "rgba(107,15,26,0.04)" },
  tdL: { width: "38%", paddingVertical: 7, paddingHorizontal: 10, color: "rgba(26,26,26,0.5)" },
  tdV: { flex: 1, paddingVertical: 7, paddingHorizontal: 10, color: MAROON, fontFamily: "Helvetica-Bold" },
  tdLA: { width: "38%", paddingVertical: 9, paddingHorizontal: 10, fontFamily: "Helvetica-Bold", color: MAROON },
  tdVA: { flex: 1, paddingVertical: 9, paddingHorizontal: 10, fontFamily: "Helvetica-Bold", color: SAFFRON, fontSize: 12 },

  wordsBox: { borderWidth: 1, borderColor: "rgba(212,160,23,0.22)", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  wordsLabel: { color: "rgba(26,26,26,0.5)", fontSize: 7.5, marginRight: 4 },
  wordsVal: { color: MAROON, fontFamily: "Helvetica-Bold", fontSize: 8.5, flex: 1 },

  taxBox: { borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#f0fdf4", alignItems: "center" },
  taxText: { color: "#166534", fontSize: 8.5, fontFamily: "Helvetica-Bold", textAlign: "center" },
  taxSub: { color: "#15803d", fontSize: 8, marginTop: 2, textAlign: "center" },

  sigRow: { flexDirection: "row", marginTop: 16, marginBottom: 14 },
  sigItem: { flex: 1, alignItems: "center" },
  sigLine: { borderTopWidth: 1.5, borderTopColor: "rgba(107,15,26,0.18)", width: "68%", marginTop: 26, paddingTop: 5, alignItems: "center" },
  sigLabel: { fontSize: 7.5, color: "rgba(26,26,26,0.5)", textAlign: "center" },

  footer: { backgroundColor: MAROON, paddingVertical: 8, paddingHorizontal: 36, alignItems: "center", marginTop: 12 },
  footerText: { color: "rgba(255,255,255,0.6)", fontSize: 7.5, textAlign: "center" },
});

export default function DonationReceiptDoc(props: DonationReceiptDocProps) {
  const rows: [string, string][] = [
    ["Cause / Purpose", props.cause],
    ["Payment Mode", props.paymentMode],
    ...(props.checkRef ? [["Check / Ref No.", props.checkRef] as [string, string]] : []),
    ...(props.message ? [["Dedication", props.message] as [string, string]] : []),
    ["Date", props.createdAt],
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
          <Text style={s.titleText}>OFFICIAL DONATION RECEIPT</Text>
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>Receipt No.</Text>
            <Text style={s.metaNo}>{props.receiptNo}</Text>
            <Text style={s.metaLabel}>Date: {props.createdAt}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>
          {/* Donor details */}
          <View style={s.sec}>
            <Text style={s.secTitle}>RECEIVED FROM</Text>
            <View style={s.infoBox}>
              <View style={s.infoCell}>
                <Text style={s.infoLabel}>Name</Text>
                <Text style={s.infoVal}>{props.donorName}</Text>
              </View>
              {props.donorPhone && (
                <View style={s.infoCell}>
                  <Text style={s.infoLabel}>Phone</Text>
                  <Text style={s.infoVal}>{props.donorPhone}</Text>
                </View>
              )}
              {props.donorEmail && (
                <View style={s.infoCell}>
                  <Text style={s.infoLabel}>Email</Text>
                  <Text style={s.infoVal}>{props.donorEmail}</Text>
                </View>
              )}
              {props.address && (
                <View style={s.infoCell}>
                  <Text style={s.infoLabel}>Address</Text>
                  <Text style={s.infoVal}>{props.address}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Donation details */}
          <View style={s.sec}>
            <Text style={s.secTitle}>DONATION DETAILS</Text>
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

          {/* Tax notice */}
          <View style={[s.sec, s.taxBox]}>
            <Text style={s.taxText}>This donation is fully tax-deductible under IRS 501(c)(3) provisions.</Text>
            <Text style={s.taxSub}>Tax ID (EIN): {props.taxId}</Text>
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
