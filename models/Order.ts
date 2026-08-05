import mongoose, { Document, Schema } from 'mongoose';

export interface IAllocation {
  vendor_id: mongoose.Types.ObjectId;
  allocated_qty: number;
  agreed_price: number;
  status: 'PENDING' | 'NEGOTIATING' | 'NEEDS_REVIEW' | 'ACCEPTED' | 'PARTIAL_ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELED' | 'WAITING_FOR_DP' | 'ON_DELIVERY';
  proof_image_url?: string;
  dp_required?: boolean;
  dp_amount?: number;
  dp_receipt_url?: string;
  fulfillment_score?: number;
}

export interface IOrder extends Document {
  restaurant_id: mongoose.Types.ObjectId;
  item_name: string;
  total_quantity: number;
  max_price_het: number; // Harga Eceran Tertinggi (Highest Retail Price)
  status: 'DRAFT' | 'NEGOTIATING' | 'BROADCASTING' | 'ALLOCATED' | 'FULFILLED' | 'CANCELLED';
  allocations: IAllocation[];
  delivery_address: string;
  delivery_location?: {
    latitude: number;
    longitude: number;
  };
  unit?: string;
}

const AllocationSchema = new Schema<IAllocation>({
  vendor_id: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  allocated_qty: { type: Number, required: true },
  agreed_price: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'NEGOTIATING', 'NEEDS_REVIEW', 'ACCEPTED', 'PARTIAL_ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELED', 'WAITING_FOR_DP', 'ON_DELIVERY'], default: 'PENDING' },
  proof_image_url: { type: String },
  dp_required: { type: Boolean, default: false },
  dp_amount: { type: Number, default: 0 },
  dp_receipt_url: { type: String },
  fulfillment_score: { type: Number },
});

const OrderSchema = new Schema<IOrder>({
  restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  item_name: { type: String, required: true },
  total_quantity: { type: Number, required: true },
  max_price_het: { type: Number, required: true },
  status: { type: String, enum: ['DRAFT', 'NEGOTIATING', 'BROADCASTING', 'ALLOCATED', 'FULFILLED', 'CANCELLED'], default: 'DRAFT' },
  allocations: [AllocationSchema],
  delivery_address: { type: String, required: true, default: "Gudang Utama: Jl. Margonda Raya, Depok" },
  delivery_location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  unit: { type: String },
}, { timestamps: true });

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}
export const Order = mongoose.model<IOrder>('Order', OrderSchema);
