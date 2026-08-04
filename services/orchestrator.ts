import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Vendor } from '@/models/Vendor';

export async function generateBroadcastList(orderId: string) {
  try {
    await connectToDatabase();

    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const escapedName = order.item_name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const vendors = await Vendor.find({
      status: 'ACTIVE',
      commodities: { $regex: new RegExp(`^${escapedName}$`, 'i') }
    }).sort({ fulfillment_score: -1 });

    if (vendors.length > 0) {
      order.allocations.push({
        vendor_id: vendors[0]._id,
        allocated_qty: order.total_quantity,
        status: 'PENDING',
        agreed_price: 0
      });
      await order.save();
    }

    return {
      order,
      vendors
    };
  } catch (error) {
    throw error;
  }
}

export async function allocateRemainingQuantity(orderId: string, remainingQty: number) {
  if (remainingQty <= 0) return null;

  try {
    await connectToDatabase();
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const escapedName = order.item_name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const vendors = await Vendor.find({
      status: 'ACTIVE',
      commodities: { $regex: new RegExp(`^${escapedName}$`, 'i') }
    }).sort({ fulfillment_score: -1 });

    const existingVendorIds = order.allocations.map((a: any) => a.vendor_id.toString());
    
    const availableVendors = vendors.filter(v => !existingVendorIds.includes(v._id.toString()));

    if (availableVendors.length > 0) {
      order.allocations.push({
        vendor_id: availableVendors[0]._id,
        allocated_qty: remainingQty,
        status: 'PENDING',
        agreed_price: 0
      });
      await order.save();
    }
    
    return order;
  } catch (error) {
    throw error;
  }
}
