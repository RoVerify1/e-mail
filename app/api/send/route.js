import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { emails, subject, message } = await request.json();

    // Validierung der Eingaben
    if (!emails || !subject || !message) {
      return NextResponse.json(
        { error: 'Bitte fülle alle Felder aus.' },
        { status: 400 }
      );
    }

    // E-Mails in ein Array konvertieren, Leerzeichen entfernen und leere Zeilen filtern
    const emailList = emails
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailList.length === 0) {
      return NextResponse.json(
        { error: 'Keine gültigen E-Mail-Adressen gefunden.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Resend API Key ist nicht konfiguriert.' },
        { status: 500 }
      );
    }

    // WICHTIG: Deine Wunsch-Absenderadresse ist hier hinterlegt.
    // Hinweis: Die Domain kiblox.at muss vorher in deinem Resend-Dashboard verifiziert werden!
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Bulk Sender <xerionx@kiblox.at>', 
        to: 'xerionx@kiblox.at', // Die Mail geht "an dich selbst", um die Privatsphäre zu wahren
        bcc: emailList,          // Alle echten Empfänger stehen unsichtbar im BCC
        subject: subject,
        text: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Fehler beim Senden über Resend.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Interner Serverfehler: ' + error.message },
      { status: 500 }
    );
  }
}