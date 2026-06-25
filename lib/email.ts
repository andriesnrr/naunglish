import { Resend } from "resend"

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://naunglish.vercel.app"
const FROM = "Naunglish <reminders@naunglish.app>"

type ReminderPayload = {
  to: string
  name: string
  streak: number
  daysUntilExam: number | null
}

export async function sendDailyReminder({ to, name, streak, daysUntilExam }: ReminderPayload) {
  const firstName = name.split(" ")[0] || name
  const streakLine =
    streak > 1
      ? `You're on a <strong>${streak}-day streak</strong> — don't break it!`
      : `Start your streak today by completing a practice session.`

  const examLine = daysUntilExam
    ? `<p style="color:#8e5d44;font-size:14px;margin:0">📅 ${daysUntilExam} days until your exam.</p>`
    : ""

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Georgia',serif">
  <div style="max-width:480px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 0 0 #c1c8c7">
    <!-- Header -->
    <div style="background:#051f1f;padding:28px 32px">
      <p style="color:#d4af37;font-size:11px;letter-spacing:2px;margin:0 0 4px">NAUNGLISH</p>
      <h1 style="color:#e8efef;font-size:24px;margin:0;font-weight:700">Time to practise, ${firstName}</h1>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;border-bottom:1px solid #e8efef">
      <p style="color:#414848;font-size:16px;line-height:1.6;margin:0 0 16px">
        ${streakLine}
      </p>
      ${examLine}
    </div>

    <!-- CTA -->
    <div style="padding:28px 32px;text-align:center">
      <a href="${APP_URL}/dashboard"
         style="display:inline-block;background:#051f1f;color:#e8efef;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600">
        Continue Studying →
      </a>
      <p style="color:#727878;font-size:12px;margin:20px 0 0;font-family:'Courier New',monospace">
        Quick links:
        <a href="${APP_URL}/practice/grammar" style="color:#4a5d4e;text-decoration:none">Grammar</a> ·
        <a href="${APP_URL}/flashcards" style="color:#8e5d44;text-decoration:none">Flashcards</a> ·
        <a href="${APP_URL}/mock-test" style="color:#3f51b5;text-decoration:none">Mock Test</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#f4f7f6;text-align:center">
      <p style="color:#c1c8c7;font-size:11px;font-family:'Courier New',monospace;margin:0;letter-spacing:1px">
        NAUNGLISH · ENGLISH MASTERY PLATFORM
      </p>
    </div>
  </div>
</body>
</html>`

  return getResend().emails.send({
    from: FROM,
    to,
    subject: streak > 1 ? `🔥 ${streak}-day streak at risk — practice now` : "📚 Your daily English practice awaits",
    html,
  })
}
