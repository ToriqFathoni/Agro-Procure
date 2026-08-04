import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  password: string;
  addresses: {
    _id?: mongoose.Types.ObjectId;
    label: string;
    full_address: string;
    detailed_address: string;
    location: {
      latitude: number;
      longitude: number;
    };
    is_default: boolean;
  }[];
}

const AddressSchema = new Schema({
  label: { type: String, required: true },
  full_address: { type: String, required: true },
  detailed_address: { type: String, default: "" },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  is_default: { type: Boolean, default: false }
});

const RestaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true },
  contact_person: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  addresses: [AddressSchema],
}, { timestamps: true });

if (mongoose.models.Restaurant) {
  delete mongoose.models.Restaurant;
}
export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
