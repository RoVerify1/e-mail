'use client';

import { useState } from 'react';

export default function Home() {
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Etwas ist schiefgelaufen.');
      }

      setStatus({
        type: 'success',
        text: 'E-Mails wurden erfolgreich über BCC versendet!',
      });
      setEmails('');
      setSubject('');
      setMessage('');
    } catch (error) {
      setStatus({
        type: 'error',
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between p-4 md:p-8 selection:bg-black selection:text-white">
      <header className="max-w-2xl w-full mx-auto pt-8">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Mailer</h1>
        <p className="text-gray-500 mt-2">Sende Nachrichten sicher und anonym an mehrere Empfänger gleichzeitig.</p>
      </header>

      <div className="max-w-2xl w-full mx-auto my-auto py-8">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 space-y-6"
        >
          {status.text && (
            <div 
              className={`p-4 rounded-xl text-sm transition-all duration-200 ${
                status.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {status.text}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="emails" className="text-sm font-medium text-gray-700 block">
              Empfänger <span className="text-gray-400 font-normal">(Eine E-Mail-Adresse pro Zeile)</span>
            </label>
            <textarea
              id="emails"
              required
              rows={5}
              placeholder="empfaenger1@domain.de&#10;empfaenger2@domain.de"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-y text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-gray-700 block">
              Betreff
            </label>
            <input
              id="subject"
              type="text"
              required
              placeholder="Dein Betreff hier"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700 block">
              Nachricht
            </label>
            <textarea
              id="message"
              required
              rows={6}
              placeholder="Schreibe deine Nachricht..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-y text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Emails senden'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6 max-w-md mx-auto leading-relaxed">
          🔒 <strong className="text-gray-500 font-medium">Absolut diskret:</strong> Alle Empfänger-Adressen werden ausschließlich via <span className="font-semibold">BCC</span> an die API übertragen. Es ist technisch unmöglich, dass Empfänger die Adressen anderer Personen einsehen – weder im E-Mail-Header noch über versteckte Details.
        </p>
      </div>

      <footer className="text-center text-xs text-gray-400 pt-8 pb-4">
        &copy; {new Date().getFullYear()} Bulk Mailer. Bereit für Vercel & GitHub.
      </footer>
    </main>
  );
}