import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('API KEY:', process.env.GEMINI_API_KEY);
