import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function categorizeEmail(emailData: { subject: string; sender: string; snippet: string; bodyText: string; }) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze the following email and categorize it.

    Email Details:
    Sender: ${emailData.sender}
    Subject: ${emailData.subject}
    Body Snippet: ${emailData.snippet}
    Body Text: ${emailData.bodyText}

    Instructions:
    1. Read the context of the email.
    2. Assign a broad "Parent Category" (e.g., Work, Personal, Promotions, Newsletters, Social).
    3. Assign a specific "Sub-Category" (e.g., Project X, Family, Discounts, Tech News, Updates).
    4. Generate a 1-sentence AI summary of the email body.

    Respond STRICTLY with a valid JSON object in the following format:
    {
      "parentCategory": "string",
      "subCategory": "string",
      "summary": "string"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown formatting in the response (e.g., ```json\n...\n```)
    const jsonStr = text.replace(/```json|```/g, '').trim();

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error categorizing email with Gemini:", error);
    // Fallback in case of error
    return {
      parentCategory: "Uncategorized",
      subCategory: "Unknown",
      summary: "Could not generate summary."
    };
  }
}
