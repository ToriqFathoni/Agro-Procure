import connectToDatabase from './lib/mongodb';
import { Vendor } from './models/Vendor';
import { Order } from './models/Order';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function triggerWebhook() {
  await connectToDatabase();
  const vendor = await Vendor.findOne({ is_bot_active: true });
  if (!vendor) {
    console.log("No active vendor found");
    return;
  }
  console.log("Found vendor:", vendor.whatsapp_number);
  
  const order = await Order.findOne({ status: 'NEGOTIATING' });
  if (!order) {
    console.log("No negotiating order found");
    return;
  }
  console.log("Found order:", order.item_name);

  console.log("Sending webhook...");
  const res = await fetch('http://localhost:3000/api/webhook/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: vendor.whatsapp_number,
      replyText: "saya hanya bisa memenuhi sebanyak 45 ekor dengan harga 70000 per ekor"
    })
  });
  
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", data);
}

triggerWebhook();
