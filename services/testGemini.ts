import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { parseVendorReply } from './gemini';

async function test() {
  try {
    console.log('Testing gemini...');
    const result = await parseVendorReply("saya hanya bisa memenuhi sebanyak 45 ekor dengan harga 70000 per ekor");
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
