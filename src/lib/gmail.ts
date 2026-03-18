import { google } from 'googleapis';

export async function getUnreadEmails(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
    maxResults: 50,
  });

  const messages = res.data.messages || [];

  const emailDetails = await Promise.all(
    messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id as string,
        format: 'full', // need headers and body
      });

      const payload = msg.data.payload;
      const headers = payload?.headers || [];

      let subject = 'No Subject';
      let sender = 'Unknown Sender';
      let date = '';

      headers.forEach((header) => {
        if (header.name === 'Subject') subject = header.value || 'No Subject';
        if (header.name === 'From') sender = header.value || 'Unknown Sender';
        if (header.name === 'Date') date = header.value || '';
      });

      // Extract body snippet
      const snippet = msg.data.snippet || '';

      // Try to get actual body content if needed for better AI context, but snippet is often enough
      let bodyText = '';
      if (payload?.parts) {
        // Simple extraction of first text/plain part
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart && textPart.body && textPart.body.data) {
           bodyText = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      } else if (payload?.body?.data) {
          bodyText = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      }

      return {
        id: message.id,
        subject,
        sender,
        date,
        snippet,
        bodyText: bodyText || snippet, // fallback to snippet if body extraction fails
      };
    })
  );

  return emailDetails;
}
