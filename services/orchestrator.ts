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
    
    const activeVendors = await Vendor.find({
      status: 'ACTIVE',
      commodities: { $regex: new RegExp(`^${escapedName}$`, 'i') }
    });

    const existingVendorIds = order.allocations.map((a: any) => a.vendor_id.toString());
    const availableVendors = activeVendors.filter(v => !existingVendorIds.includes(v._id.toString()));

    const orderAddrParts = order.delivery_address.split(',');
    const orderProvince = orderAddrParts.length > 1 ? orderAddrParts[orderAddrParts.length - 1].trim().toLowerCase() : '';

    let matchedVendors = availableVendors.map(v => {
      let dynamicScore = v.fulfillment_score;
      
      if (orderProvince && v.address) {
        const vendorAddrParts = v.address.split(',');
        const vendorProvince = vendorAddrParts.length > 1 ? vendorAddrParts[vendorAddrParts.length - 1].trim().toLowerCase() : '';
        if (vendorProvince && vendorProvince !== orderProvince) {
          dynamicScore -= 0.4;
        }
      }

      if (order.delivery_location?.latitude !== undefined && order.delivery_location?.longitude !== undefined && v.location?.latitude && v.location?.longitude) {
        const toRad = (val: number) => val * (Math.PI / 180);
        const R = 6371;
        const dLat = toRad(v.location.latitude - order.delivery_location.latitude);
        const dLon = toRad(v.location.longitude - order.delivery_location.longitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(order.delivery_location.latitude)) * Math.cos(toRad(v.location.latitude)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        const penalty = Math.min(dist * 0.001, 0.3);
        dynamicScore -= penalty;
      }
      
      dynamicScore = parseFloat(Math.max(0.1, dynamicScore).toFixed(2));
      return { vendor: v, dynamicScore };
    });

    matchedVendors.sort((a, b) => b.dynamicScore - a.dynamicScore);

    if (matchedVendors.length > 0) {
      const nextVendor = matchedVendors[0].vendor;
      order.allocations.push({
        vendor_id: nextVendor._id,
        allocated_qty: remainingQty,
        status: 'NEGOTIATING',
        agreed_price: 0
      });
      await order.save();

      let phone = nextVendor.whatsapp_number.replace(/\D/g, '');
      if (phone.startsWith('0')) phone = '62' + phone.substring(1);
      if (!phone.endsWith('@c.us')) phone += '@c.us';
      const message = `Halo, kami dari Agro-Procurement. Kami membutuhkan pasokan ${order.item_name} sebanyak ${remainingQty}. Apakah Anda dapat memenuhinya? Jika ya, mohon informasikan berapa harga per ${order.unit || 'Kg'} yang Anda tawarkan.`;
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/api/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: phone, message })
        }).catch(err => console.error(err));
      } catch (e) {}
    }
    
    return order;
  } catch (error) {
    throw error;
  }
}

export async function reallocateDeficit(orderId: string) {
  try {
    await connectToDatabase();
    const order = await Order.findById(orderId);
    if (!order) return null;

    let fulfilledQty = 0;
    order.allocations.forEach((a: any) => {
      if (['ACCEPTED', 'PARTIAL_ACCEPTED', 'WAITING_FOR_DP', 'ON_DELIVERY', 'COMPLETED', 'NEEDS_REVIEW', 'NEGOTIATING', 'PENDING'].includes(a.status)) {
        fulfilledQty += a.allocated_qty;
      }
    });

    const deficit = order.total_quantity - fulfilledQty;
    if (deficit > 0) {
      return await allocateRemainingQuantity(orderId, deficit);
    }
    return order;
  } catch (error) {
    console.error(error);
    return null;
  }
}
