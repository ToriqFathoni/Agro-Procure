import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  whatsapp_number: string;
  commodities: string[];
  fulfillment_score: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  is_bot_active: boolean;
  associated_restaurants: string[];
  address: string;
  detailed_address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const VendorSchema = new Schema<IVendor>({
  name: { type: String, required: true },
  whatsapp_number: { type: String, required: true, unique: true },
  commodities: [{ type: String }],
  fulfillment_score: { type: Number, default: 0.85, min: 0, max: 1 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  is_bot_active: { type: Boolean, default: true },
  associated_restaurants: [{ type: String }],
  address: { type: String, required: true },
  detailed_address: { type: String, default: "" },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
}, { timestamps: true });

export const Vendor = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);
