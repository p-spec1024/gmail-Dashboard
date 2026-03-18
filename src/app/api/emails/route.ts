import { NextResponse } from 'next/server';
import { getUnreadEmails } from '@/lib/gmail';
import { categorizeEmail } from '@/lib/gemini';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // 1. Fetch unread emails from Gmail using OAuth access token
    const emails = await getUnreadEmails(session.accessToken);

    // 2. Process each email with Gemini sequentially to avoid rate limits
    // Note: To avoid 15 RPM free tier limits entirely for 50 emails, we'd need
    // a delay of ~4 seconds per email. We'll add a small 2.5s delay to be safe
    // and rely on Google's burst handling, or we process slower.
    // For a robust system, we should ideally use webhooks or background jobs,
    // but for this MVP, we process them sequentially with a delay.
    const processedEmails = [];

    // We only process up to 10 at a time to keep the request from timing out completely on Vercel
    // (Vercel hobby tier limits serverless functions to 10-60s)
    const emailsToProcess = emails.slice(0, 15);

    for (const email of emailsToProcess) {
      try {
        const aiData = await categorizeEmail(email);
        processedEmails.push({
          ...email,
          parentCategory: aiData.parentCategory,
          subCategory: aiData.subCategory,
          summary: aiData.summary,
        });

        // Add a delay to respect rate limits (e.g., Gemini 15 RPM = 4 seconds per request)
        // Here we delay 2.5 seconds to try and balance execution time and rate limits.
        await new Promise((resolve) => setTimeout(resolve, 2500));

      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error);
        processedEmails.push({
          ...email,
          parentCategory: 'Uncategorized',
          subCategory: 'Unknown',
          summary: 'Failed to generate summary.',
        });
      }
    }

    return NextResponse.json({ emails: processedEmails });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch or process emails.', details: errorMessage },
      { status: 500 }
    );
  }
}
