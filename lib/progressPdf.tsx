import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { getCEFR } from "@/lib/cefr"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 48,
    backgroundColor: "#ffffff",
    color: "#161d1d",
  },
  header: {
    marginBottom: 24,
    borderBottom: "1pt solid #c1c8c7",
    paddingBottom: 16,
  },
  brand: { fontSize: 8, letterSpacing: 2, color: "#727878", marginBottom: 4 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#051f1f", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#414848" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 8, letterSpacing: 2, color: "#727878",
    marginBottom: 8, borderBottom: "0.5pt solid #e8efef", paddingBottom: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  label: { fontSize: 10, color: "#414848" },
  value: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#161d1d" },
  barTrack: { height: 4, backgroundColor: "#e8efef", borderRadius: 2, marginTop: 2, marginBottom: 6 },
  barFill: { height: 4, backgroundColor: "#4a5d4e", borderRadius: 2 },
  cefrBox: {
    backgroundColor: "#051f1f", padding: "12pt 20pt", borderRadius: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
  },
  cefrLabel: { color: "#6f8988", fontSize: 8, letterSpacing: 2 },
  cefrValue: { color: "#e8efef", fontSize: 28, fontFamily: "Helvetica-Bold" },
  mockRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "0.5pt solid #e8efef" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#c1c8c7", letterSpacing: 1 },
})

const SKILL_LABELS: Record<string, string> = {
  grammar: "Structure", vocab: "Lexicon", reading: "Analysis",
  listening: "Reception", speaking: "Fluency", writing: "Composition",
}

type Props = {
  name: string
  currentCefr: string | null
  examDate: string | null
  overallPct: number | null
  latestBySkill: Record<string, number>
  streak: { current_streak: number; longest_streak: number } | null
  xp: number
  mockResults: { total_score: number; cefr_band: string; taken_at: string }[]
  generatedDate: string
}

export function ProgressDocument({
  name, currentCefr, examDate, overallPct,
  latestBySkill, streak, xp, mockResults, generatedDate,
}: Props) {
  return (
    <Document title={`Naunglish Progress Report — ${name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>NAUNGLISH · PROGRESS REPORT</Text>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>
            {`Generated ${generatedDate}${examDate ? `  ·  Exam: ${new Date(examDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}`}
          </Text>
        </View>

        {(currentCefr || overallPct) && (
          <View style={styles.cefrBox}>
            <View>
              <Text style={styles.cefrLabel}>CURRENT LEVEL</Text>
              <Text style={styles.cefrValue}>{currentCefr ?? (overallPct ? getCEFR(overallPct) : "—")}</Text>
            </View>
            {overallPct !== null && (
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.cefrLabel}>OVERALL SCORE</Text>
                <Text style={{ color: "#e8efef", fontSize: 20, fontFamily: "Helvetica-Bold" }}>{overallPct}%</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVITY SUMMARY</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Current Streak</Text>
            <Text style={styles.value}>{streak?.current_streak ?? 0} days</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Longest Streak</Text>
            <Text style={styles.value}>{streak?.longest_streak ?? 0} days</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total XP</Text>
            <Text style={styles.value}>{xp.toLocaleString()}</Text>
          </View>
        </View>

        {Object.keys(latestBySkill).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILL SCORES</Text>
            {Object.entries(latestBySkill).map(([skill, pct]) => (
              <View key={skill}>
                <View style={styles.row}>
                  <Text style={styles.label}>{SKILL_LABELS[skill] ?? skill}</Text>
                  <Text style={styles.value}>{pct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {mockResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MOCK TEST HISTORY</Text>
            {mockResults.map((r, i) => (
              <View key={i} style={styles.mockRow}>
                <Text style={styles.label}>
                  {new Date(r.taken_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
                <Text style={styles.value}>{r.total_score}% — {r.cefr_band}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>NAUNGLISH · ENGLISH MASTERY PLATFORM</Text>
          <Text style={styles.footerText}>{generatedDate}</Text>
        </View>
      </Page>
    </Document>
  )
}
