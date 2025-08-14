// Lightweight Postmark email utility
// Inputs: to (string), subject (string), html (string), optional replyTo
// Uses env: POSTMARK_API_TOKEN, FROM_EMAIL, POSTMARK_MESSAGE_STREAM

export async function sendPostmarkEmail(params: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  const token = process.env.POSTMARK_API_TOKEN
  const from = process.env.FROM_EMAIL || 'info@northpathstrategies.org'
  const messageStream = process.env.POSTMARK_MESSAGE_STREAM || 'outbound'

  if (!token) {
    throw new Error('POSTMARK_API_TOKEN is not set')
  }

  const res = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': token,
    },
    body: JSON.stringify({
      From: from,
      To: params.to,
      Subject: params.subject,
      HtmlBody: params.html,
      ReplyTo: params.replyTo,
      MessageStream: messageStream,
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Postmark error ${res.status}: ${txt}`)
  }

  return true
}
