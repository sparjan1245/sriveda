import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const MAROON = "#6B0F1A";
const GOLD = "#D4A017";
const CREAM = "#FFF8F0";

export interface EventRegistrationDocProps {
  logoUrl: string;
  confirmationNo: string;
  createdAt: string;
  attendeeName: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
  familyMembers: { name: string; birthStar?: string }[];
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
  tdL: { width: "38%", paddingVertical: 7, paddingHorizontal: 10, color: "rgba(26,26,26,0.5)" },
  tdV: { flex: 1, paddingVertical: 7, paddingHorizontal: 10, color: MAROON, fontFamily: "Helvetica-Bold" },

  familyRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "rgba(212,160,23,0.12)" },
  familyIdx: { width: "8%", paddingVertical: 7, paddingHorizontal: 10, color: "rgba(26,26,26,0.4)" },
  familyName: { width: "52%", paddingVertical: 7, paddingHorizontal: 10, color: MAROON, fontFamily: "Helvetica-Bold" },
  familyStar: { flex: 1, paddingVertical: 7, paddingHorizontal: 10, color: "rgba(26,26,26,0.6)" },

  noticeBox: { borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#f0fdf4", alignItems: "center" },
  noticeText: { color: "#166534", fontSize: 8.5, fontFamily: "Helvetica-Bold", textAlign: "center" },

  footer: { backgroundColor: MAROON, paddingVertical: 8, paddingHorizontal: 36, alignItems: "center", marginTop: 12 },
  footerText: { color: "rgba(255,255,255,0.6)", fontSize: 7.5, textAlign: "center" },
});

export default function EventRegistrationDoc(props: EventRegistrationDocProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Image src={props.logoUrl} style={s.logo} />
          <Text style={s.hName}>Veda Gayatri Cultural Center</Text>
          <Text style={s.hSub}>{props.templeAddress}</Text>
          <Text style={s.hSub}>{props.templePhone}  ·  {props.templeEmail}</Text>
        </View>

        <View style={s.goldBar} />

        {/* Title */}
        <View style={s.titleArea}>
          <Text style={s.titleText}>EVENT REGISTRATION CONFIRMATION</Text>
          <View style={s.metaRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={s.metaLabel}>Confirmation No. </Text>
              <Text style={s.metaNo}>{props.confirmationNo}</Text>
            </View>
            <Text style={s.metaLabel}>Date: {props.createdAt}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>
          {/* Attendee details */}
          <View style={s.sec}>
            <Text style={s.secTitle}>REGISTERED BY</Text>
            <View style={s.infoBox}>
              <View style={s.infoCell}>
                <Text style={s.infoLabel}>Name</Text>
                <Text style={s.infoVal}>{props.attendeeName}</Text>
              </View>
              {props.attendeePhone && (
                <View style={s.infoCell}>
                  <Text style={s.infoLabel}>Phone</Text>
                  <Text style={s.infoVal}>{props.attendeePhone}</Text>
                </View>
              )}
              {props.attendeeEmail && (
                <View style={s.infoCell}>
                  <Text style={s.infoLabel}>Email</Text>
                  <Text style={s.infoVal}>{props.attendeeEmail}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Event details */}
          <View style={s.sec}>
            <Text style={s.secTitle}>EVENT DETAILS</Text>
            <View style={s.table}>
              <View style={s.row}>
                <Text style={s.tdL}>Event</Text>
                <Text style={s.tdV}>{props.eventTitle}</Text>
              </View>
              <View style={s.row}>
                <Text style={s.tdL}>Date &amp; Time</Text>
                <Text style={s.tdV}>{props.eventDate}</Text>
              </View>
              {props.eventLocation && (
                <View style={[s.row, { borderBottomWidth: 0 }]}>
                  <Text style={s.tdL}>Location</Text>
                  <Text style={s.tdV}>{props.eventLocation}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Family members */}
          {props.familyMembers.length > 0 && (
            <View style={s.sec}>
              <Text style={s.secTitle}>FAMILY MEMBERS ATTENDING</Text>
              <View style={s.table}>
                {props.familyMembers.map((m, i) => (
                  <View key={i} style={i === props.familyMembers.length - 1 ? [s.familyRow, { borderBottomWidth: 0 }] : s.familyRow}>
                    <Text style={s.familyIdx}>{i + 1}</Text>
                    <Text style={s.familyName}>{m.name}</Text>
                    <Text style={s.familyStar}>{m.birthStar || "—"}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={[s.sec, s.noticeBox]}>
            <Text style={s.noticeText}>Please bring this confirmation with you to the event.</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            www.srivedagayatritemple.org  ·  This is a computer-generated confirmation
          </Text>
        </View>
      </Page>
    </Document>
  );
}
