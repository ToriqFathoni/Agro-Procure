import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Vendor } from '@/models/Vendor';
import { parseVendorReply } from '@/services/gemini';
import { allocateRemainingQuantity, reallocateDeficit } from '@/services/orchestrator';

const sendReply = async (phone: string, message: string) => {
  let cleanedPhone = phone.replace(/\D/g, '');
  if (cleanedPhone.startsWith('0')) cleanedPhone = '62' + cleanedPhone.substring(1);
  if (!cleanedPhone.endsWith('@c.us')) cleanedPhone += '@c.us';
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001';
    await fetch(`${apiUrl}/api/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: cleanedPhone, message })
    });
  } catch (err) {}
};

export async function processVendorReply(orderId: string, vendorId: string, replyText: string) {
  try {
    await connectToDatabase();
    
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return { success: false, message: "Vendor not found" };
    }
    if (vendor.is_bot_active === false) {
      return { success: false, message: "Bot is paused for this vendor" };
    }

    const parsedData = await parseVendorReply(replyText);
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    const allocationIndex = order.allocations.findIndex((a: any) => a.vendor_id.toString() === vendorId);
    
    if (allocationIndex === -1) {
      throw new Error('Allocation not found for vendor');
    }

    const allocation = order.allocations[allocationIndex];
    const originalQty = allocation.allocated_qty;
    const availableQty = parsedData.available_qty || 0;
    const finalQty = availableQty > 0 && availableQty < originalQty ? availableQty : originalQty;

    const isOverPriced = (parsedData.negotiated_price || 0) > order.max_price_het;
    const isPartial = availableQty > 0 && availableQty < originalQty;

    if (parsedData.is_accepted && parsedData.dp_required && !isOverPriced && !isPartial) {
      order.allocations[allocationIndex].agreed_price = parsedData.negotiated_price || 0;
      order.allocations[allocationIndex].status = 'WAITING_FOR_DP';
      order.allocations[allocationIndex].dp_required = true;
      order.allocations[allocationIndex].dp_amount = parsedData.dp_amount || 0;
      order.allocations[allocationIndex].allocated_qty = finalQty;
      await order.save();
      
      await sendReply(vendor.whatsapp_number, `Baik, pesanan sejumlah ${finalQty} telah kami konfirmasi. Mohon informasikan rekening/cara pembayaran untuk proses DP (Tanda Jadi) sebesar Rp ${parsedData.dp_amount.toLocaleString('id-ID')}.`);
      return order;
    }

    if (isPartial || isOverPriced) {
      order.allocations[allocationIndex].agreed_price = parsedData.negotiated_price || 0;
      order.allocations[allocationIndex].status = 'NEEDS_REVIEW';
      order.allocations[allocationIndex].allocated_qty = availableQty > 0 ? availableQty : originalQty;
      await order.save();
      
      let replyMsg = `Baik, penawaran sebagian sejumlah ${availableQty} sedang kami teruskan ke manajemen untuk ditinjau.`;
      if (isOverPriced && isPartial) {
        replyMsg = `Baik, penawaran harga (Rp ${parsedData.negotiated_price?.toLocaleString('id-ID')}) dan jumlah sebagian (${availableQty}) Anda sedang kami teruskan ke manajemen untuk ditinjau.`;
      } else if (isOverPriced) {
        replyMsg = `Baik, karena penawaran harga Anda (Rp ${parsedData.negotiated_price?.toLocaleString('id-ID')}) di atas standar kami, pengajuan ini sedang kami teruskan ke manajemen untuk ditinjau.`;
      }
      
      await sendReply(vendor.whatsapp_number, replyMsg);
      await reallocateDeficit(orderId);
    } else if (!parsedData.is_accepted && availableQty === 0) {
      order.allocations[allocationIndex].status = 'REJECTED';
      await order.save();
      
      await sendReply(vendor.whatsapp_number, `Baik, terima kasih atas informasinya.`);
      await reallocateDeficit(orderId);
    } else {
      order.allocations[allocationIndex].agreed_price = parsedData.negotiated_price || 0;
      
      if (availableQty >= originalQty) {
        order.allocations[allocationIndex].allocated_qty = originalQty;
      }
      order.allocations[allocationIndex].status = 'ACCEPTED';
      await order.save();
      
      await sendReply(vendor.whatsapp_number, `Baik, pesanan penuh sejumlah ${originalQty} telah dikonfirmasi. Mohon segera disiapkan.`);
    }

    return await Order.findById(orderId);
  } catch (error) {
    throw error;
  }
}
