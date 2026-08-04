import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Vendor } from '@/models/Vendor';
import { parseVendorReply } from '@/services/gemini';
import { allocateRemainingQuantity } from '@/services/orchestrator';

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

    if (parsedData.is_accepted && parsedData.dp_required) {
      order.allocations[allocationIndex].agreed_price = parsedData.negotiated_price || 0;
      order.allocations[allocationIndex].status = 'WAITING_FOR_DP';
      order.allocations[allocationIndex].dp_required = true;
      order.allocations[allocationIndex].dp_amount = parsedData.dp_amount || 0;
      order.allocations[allocationIndex].allocated_qty = finalQty;
      await order.save();
      return order;
    }

    if (availableQty > 0 && availableQty < originalQty) {
      order.allocations[allocationIndex].agreed_price = parsedData.negotiated_price || 0;
      order.allocations[allocationIndex].status = 'PARTIAL_ACCEPTED';
      order.allocations[allocationIndex].allocated_qty = availableQty;
      const diff = originalQty - availableQty;
      await order.save();
      await allocateRemainingQuantity(orderId, diff);
    } else if (!parsedData.is_accepted && availableQty === 0) {
      order.allocations[allocationIndex].status = 'REJECTED';
      await order.save();
      await allocateRemainingQuantity(orderId, originalQty);
    } else {
      order.allocations[allocationIndex].agreed_price = parsedData.negotiated_price || 0;
      
      if (availableQty >= originalQty) {
        order.allocations[allocationIndex].allocated_qty = originalQty;
      }
      order.allocations[allocationIndex].status = 'ACCEPTED';
      await order.save();
    }

    return await Order.findById(orderId);
  } catch (error) {
    throw error;
  }
}
