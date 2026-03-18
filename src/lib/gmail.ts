import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import path from 'path';
import fs from 'fs/promises';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf-8');
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {import('googleapis').Auth.OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: any) {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials?.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 */
export async function authorize() {
  const existingClient = await loadSavedCredentialsIfExist();
  if (existingClient) {
    return existingClient;
  }
  const client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

export async function getUnreadEmails() {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth: auth as any });

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
