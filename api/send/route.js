// Datei: app/api/send/route.js
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { emails, subject, message } = await request.json()

    // Validation
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Mindestens eine E-Mail erforderlich.' }, { status: 400 })
    }
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Betreff und Nachricht erforderlich.' }, { status: 400 })
    }
    if (emails.length > 50) {
      return NextResponse.json({ error: 'Max. 50 Empfänger erlaubt.' }, { status: 400 })
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalid = emails.filter(e => !emailRegex.test(e))
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Ungültige Adressen: ${invalid.slice(0,3).join(', ')}` }, { status: 400 })
    }

    // Resend API Call – BCC für Datenschutz!
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dein Name <onboarding@resend.dev>', // ← Anpassen!
        to: ['blind@recipient.com'], // Dummy-Empfänger, alle echten über BCC
        bcc: emails, // 🔒 Alle Empfänger hier – niemand sieht die anderen!
        subject,
        html: `<div style="font-family:system-ui,sans-serif;white-space:pre-wrap;">${message.replace(/</g,'&lt;')}</div>`,
        text: message,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Resend API Fehler')

    return NextResponse.json({ success: true, recipientCount: emails.length })
  } catch (err) {
    console.error('Send error:', err)
    return NextResponse.json(
      { error: err.message || 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
