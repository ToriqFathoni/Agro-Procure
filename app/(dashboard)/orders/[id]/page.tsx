import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Vendor } from '@/models/Vendor';
import OrderDetailsClient from './OrderDetailsClient';
import { calculateDistance } from '@/utils/distance';

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const resolvedParams = await props.params;

  await connectToDatabase();

  const order = await Order.findById(resolvedParams.id).lean();
  
  if (!order) {
    return <div className="p-8 text-center text-red-500 font-semibold">404 - Order not found</div>;
  }

  const vendorIds = order.allocations.map((a: any) => a.vendor_id);
  const vendors = await Vendor.find({ _id: { $in: vendorIds } }).lean();

  const vendorMap = vendors.reduce((acc: any, v: any) => {
    let dynamicScore = v.fulfillment_score;
    if (v.location?.latitude && v.location?.longitude && order.delivery_location?.latitude && order.delivery_location?.longitude) {
      const dist = calculateDistance(order.delivery_location.latitude, order.delivery_location.longitude, v.location.latitude, v.location.longitude);
      const penalty = Math.min(dist * 0.001, 0.3);
      dynamicScore = parseFloat(Math.max(0.1, v.fulfillment_score - penalty).toFixed(2));
    } else {
      dynamicScore = parseFloat(v.fulfillment_score?.toFixed(2) || '0');
    }

    acc[v._id.toString()] = {
      name: v.name,
      is_bot_active: v.is_bot_active,
      whatsapp_number: v.whatsapp_number,
      address: v.address,
      fulfillment_score: dynamicScore
    };
    return acc;
  }, {});

  const serializedOrder = {
    ...order,
    _id: order._id.toString(),
    restaurant_id: order.restaurant_id.toString(),
    allocations: order.allocations.map((a: any) => ({
      ...a,
      vendor_id: a.vendor_id.toString(),
      _id: a._id?.toString(),
    })),
  };

  return <OrderDetailsClient order={serializedOrder} vendorMap={vendorMap} />;
}
