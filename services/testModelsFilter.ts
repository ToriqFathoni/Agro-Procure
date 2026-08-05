import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const textModels = data.models.filter((m: any) => 
    m.supportedGenerationMethods.includes('generateContent')
  ).map((m: any) => m.name);
  console.log("Supported generateContent models:");
  console.log(textModels.join('\n'));
}

listModels();
