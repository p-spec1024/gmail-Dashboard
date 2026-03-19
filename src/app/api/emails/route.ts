import { NextResponse } from 'next/server';
import { getUnreadEmails } from '@/lib/gmail';
import { categorizeEmail } from '@/lib/gemini';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    let limit = limitParam ? parseInt(limitParam, 10) : 50;

    if (isNaN(limit) || limit < 0) {
      limit = 50;
    } else if (limit > 50) {
      limit = 50;
    }

    // 1. Fetch unread emails from Gmail using OAuth access token
    const emails = await getUnreadEmails(session.accessToken, limit);

    // Simply return the raw emails from Gmail.
    // Processing with Vertex AI is now done per-email via /api/process-email route

    return NextResponse.json({ emails });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch or process emails.', details: errorMessage },
      { status: 500 }
    );
  }
}
