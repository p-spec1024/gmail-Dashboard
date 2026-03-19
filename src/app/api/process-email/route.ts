import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { VertexAI } from '@google-cloud/vertexai';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailBody } = await req.json();

    if (!emailBody) {
      return NextResponse.json({ error: 'Email body is required' }, { status: 400 });
    }

    // Initialize Vertex AI with your Cloud project and location
    // Note: The user needs to provide GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION
    const project = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    // We expect the user to have Application Default Credentials (ADC) set up
    // Or specify a service account key path via GOOGLE_APPLICATION_CREDENTIALS
    const vertexAI = new VertexAI({ project, location });

    // Instantiate the models
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: { maxOutputTokens: 256, temperature: 0.2 },
    });

    const prompt = `
      You are an intelligent email assistant. Read the following email body and provide a JSON response with four fields:
      1. "summary": A concise, 1-2 sentence summary of the email.
      2. "category": Choose one of: "logistics", "invoices", "trading", "newsletter", or "other".
      3. "priority": Choose one of: "low", "medium", "high", "critical".
      4. "suggestedAction": A brief suggested action item (e.g., "Review pending tasks", "Reply to confirm").

      Email Body:
      """
      ${emailBody}
      """

      Return ONLY raw JSON, with no markdown formatting or \`\`\`json blocks.
    `;

    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const result = await generativeModel.generateContent(request);
    const response = result.response;

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No candidates returned from Vertex AI');
    }

    const textOutput = response.candidates[0].content.parts[0].text || '';

    // Clean up potential markdown formatting (in case the model still outputs it)
    let jsonStr = textOutput.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse JSON from Vertex AI:', textOutput);
      throw new Error('Vertex AI returned invalid JSON');
    }

    // Validate structure (optional, but good practice)
    const finalResponse = {
      summary: parsedResponse.summary || 'Summary unavailable',
      category: parsedResponse.category || 'other',
      priority: parsedResponse.priority || 'medium',
      suggestedAction: parsedResponse.suggestedAction || 'No action needed',
    };

    return NextResponse.json(finalResponse);

  } catch (error: any) {
    console.error('Error in /api/process-email:', error);
    return NextResponse.json({ error: error.message || 'Failed to process email' }, { status: 500 });
  }
}
