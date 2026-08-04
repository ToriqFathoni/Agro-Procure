import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function parseVendorReply(replyText: string) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3-flash-preview',
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `You are a B2B procurement parser. Your job is to extract data from a vendor's natural language text response.
You must return a valid JSON object matching the following structure exactly:
{
  "is_accepted": boolean,
  "negotiated_price": number,
  "available_qty": number,
  "dp_required": boolean,
  "dp_amount": number
}
If the vendor rejects or does not provide price/quantity, default the numbers to 0.
CRITICAL: If the vendor states they have a partial amount left (e.g., 'sisa 40 kilo'), you MUST extract that number into available_qty. Even if they use apologetic words like 'maaf' or 'sorry', if they offer a partial amount, you MUST set is_accepted to true.
Analyze if the vendor requires a down payment (DP) or tanda jadi. If yes, add dp_required: true and extract the amount into dp_amount (number). If they say the item is being delivered or is on the way, you can indicate that state.
Vendor Response: "${replyText}"`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    throw new Error('Failed to parse Gemini response: ' + cleanedText);
  }
}
