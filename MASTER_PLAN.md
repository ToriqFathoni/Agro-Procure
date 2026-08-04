# MASTER_PLAN: Agro-Procurement ERP (Invisible Orchestrator)

## 0. Core Directives for the AI Agent
**CRITICAL INSTRUCTION**: As an AI coding agent executing this plan, you must strictly adhere to the following software engineering standards:

*   **High Cohesion & Loose Coupling**: Strictly separate business logic from UI components. Utilize modular Controller/Service layer patterns for all Next.js API Routes (Route Handlers).
*   **Clean Code & SOLID Principles**: Ensure functions have a single responsibility. Keep components small, reusable, and heavily typed with strict TypeScript interfaces. No implicit `any`.
*   **Error Handling**: Implement robust `try-catch` blocks across all backend logic. Return standardized, predictable JSON error responses from all API endpoints (e.g., `{ success: false, error: "Detailed message", code: 400 }`).

---

## 1. Project Overview & Architecture

"Agro-Procurement ERP (Invisible Orchestrator)" is a B2B SaaS web application engineered for Food & Beverage Managers. Its primary objective is to automate the procurement of raw materials from traditional vendors (farmers) without requiring vendors to download or use a dedicated application.

The core innovation lies in the **Invisible Orchestration**: the system interacts with vendors seamlessly via WhatsApp.

**System Architecture Flow:**
1.  **Frontend (Next.js App Router)**: UI for F&B Managers to manage vendors, initiate orders, and track fulfillment.
2.  **Backend (Next.js Route Handlers / Node.js)**: Handles business logic, API orchestration, and bidding algorithms.
3.  **Database (MongoDB via Mongoose)**: Persistent storage for system state, master data, and transaction ledgers.
4.  **Integration Layer (whatsapp-web.js)**: A simulated webhook/bot service running in the Node.js backend to send outbound WhatsApp messages to vendors and parse their conversational replies.

---

## 2. Database Schema Design (Mongoose)

Implement the following TypeScript interfaces and Mongoose schemas precisely.

### 2.1. Restaurant Model
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  password: string;
  location: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
}

const RestaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true },
  contact_person: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
}, { timestamps: true });

RestaurantSchema.index({ location: '2dsphere' });
export const Restaurant = mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
```

### 2.2. Vendor Model
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  whatsapp_number: string;
  commodities: string[];
  fulfillment_score: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

const VendorSchema = new Schema<IVendor>({
  name: { type: String, required: true },
  whatsapp_number: { type: String, required: true, unique: true },
  commodities: [{ type: String }],
  fulfillment_score: { type: Number, default: 0.8, min: 0, max: 1 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
}, { timestamps: true });

export const Vendor = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);
```

### 2.3. Order Model
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IAllocation {
  vendor_id: mongoose.Types.ObjectId;
  allocated_qty: number;
  agreed_price: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'DELIVERED' | 'QC_FAILED';
}

export interface IOrder extends Document {
  restaurant_id: mongoose.Types.ObjectId;
  item_name: string;
  total_quantity: number;
  max_price_het: number; // Harga Eceran Tertinggi (Highest Retail Price)
  status: 'DRAFT' | 'BROADCASTING' | 'ALLOCATED' | 'FULFILLED' | 'CANCELLED';
  allocations: IAllocation[];
}

const AllocationSchema = new Schema<IAllocation>({
  vendor_id: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  allocated_qty: { type: Number, required: true },
  agreed_price: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'DELIVERED', 'QC_FAILED'], default: 'PENDING' },
});

const OrderSchema = new Schema<IOrder>({
  restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  item_name: { type: String, required: true },
  total_quantity: { type: Number, required: true },
  max_price_het: { type: Number, required: true },
  status: { type: String, enum: ['DRAFT', 'BROADCASTING', 'ALLOCATED', 'FULFILLED', 'CANCELLED'], default: 'DRAFT' },
  allocations: [AllocationSchema],
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
```

---

## 3. Core Features Scope (MVP)

*   **Smart Vendor Discovery (Master Data)**:
    *   **UI**: A dashboard page (`/vendors`) to view a paginated list of vendors.
    *   **Action**: Form to input new vendor contacts (Name, WhatsApp Number, Commodities).
*   **Procurement Dashboard**:
    *   **UI**: Main interface (`/orders`) to create a new procurement order.
    *   **Input fields**: `item_name`, `total_quantity`, and critically, `max_price_het`.
    *   **View**: Status tracking for ongoing orders.
*   **WhatsApp Bot Integration (Simulated Webhook)**:
    *   **Engine**: Backend module leveraging `whatsapp-web.js`.
    *   **Capability**: Broadcast procurement requests to targeted vendors based on their registered `commodities`.
    *   **Listener**: Logic to parse incoming vendor conversational replies.
*   **Threshold Bidding Logic**:
    *   **Service**: Backend utility that intercepts parsed vendor replies (prices/quantities).
    *   **Algorithm**: Evaluates the vendor's offered price against the order's `max_price_het`.
    *   **Action**: Automatically accepts, rejects, or proceeds with logic based on the threshold. Updates `allocations` inside the Order document.
*   **Post-Delivery QC Ledger**:
    *   **UI**: Detailed order view allowing F&B managers to mark received vendor allocations as `DELIVERED` or `QC_FAILED`.
    *   **Verification**: Image upload feature for Proof of Transfer/Delivery. For the MVP, this will be handled via local storage/base64 strings to eliminate S3/cloud dependencies.

---

## 4. Step-by-Step Implementation Phases (The Action Plan)

The AI Agent must execute the following phases in strict chronological order. Check off the boxes as work progresses.

### Phase 1: Project Setup & Foundation
- [ ] Initialize a new Next.js project using App Router. Ensure TypeScript and Tailwind CSS are configured.
- [ ] Clean up default Next.js boilerplate and establish standard folder structures (`/app`, `/components`, `/lib`, `/models`, `/services`).
- [ ] Establish MongoDB connection utility (`lib/mongodb.ts`) using Mongoose.
- [ ] Configure environment variables (`.env.local`) for MongoDB URI.

### Phase 2: Database Layer & Models
- [ ] Create `models/Restaurant.ts` implementing the schema defined in Section 2.
- [ ] Create `models/Vendor.ts` implementing the schema defined in Section 2.
- [ ] Create `models/Order.ts` implementing the schema defined in Section 2.
- [ ] Write a seed script (`scripts/seed.ts`) to populate the database with a dummy Restaurant and 5 initial Vendors (ensure realistic test phone numbers).

### Phase 2.5: Authentication & User Management
- [ ] Install `next-auth`, `bcryptjs`.
- [ ] Configure NextAuth Credentials Provider in `app/api/auth/[...nextauth]/route.ts` and inject MongoDB `_id` into session.
- [ ] Create `/api/auth/register` to securely hash passwords and create new Restaurants.
- [ ] Create `middleware.ts` to protect `/vendors` and `/orders` routes (redirect to `/login`).

### Phase 3: Backend API Services (Controllers)
- [ ] **Vendors API**: Implement `GET /api/vendors` and `POST /api/vendors`. Ensure strictly typed Service functions handle the business logic, not the route handlers directly.
- [ ] **Orders API**: Implement `POST /api/orders` (creates order and triggers broadcast queue) and `GET /api/orders`.
- [ ] **Allocations API**: Implement `PATCH /api/orders/[orderId]/allocations/[vendorId]` for QC status updates and proof of transfer uploads.

### Phase 4: WhatsApp Bot Integration (Core Logic)
- [ ] Install and initialize `whatsapp-web.js` client in a background service or dedicated API route handler designed for long-polling/events.
- [ ] Implement QR code generation logic (logged to console for MVP authentication).
- [ ] Implement `broadcastOrder(orderId, vendors)` function to send formatted, structured WhatsApp messages to selected vendors.
- [ ] Implement message listener client.on('message', ...) that forwards incoming raw text to an LLM API (e.g., Gemini/OpenAI) configured with Structured Output (JSON Schema) to extract vendor intent, quantities, and proposed price points, strictly avoiding fragile Regex parsing.
- [ ] Integrate **Threshold Bidding Logic**: Hook the message listener to a service that automatically updates `IAllocation` status based on the HET algorithm.

### Phase 5: Frontend UI (Next.js App Router)
- [ ] **Layout**: Create a standard B2B administrative layout (Sidebar, Header, Main Content Area).
- [ ] **Vendors Page (`/vendors`)**: Build the Master Data table and "Add Vendor" modal form. Connect to API.
- [ ] **Procurement Page (`/orders`)**: Build the dashboard displaying active and historical orders. Connect to API.
- [ ] **New Order Flow**: Build a form component to initiate a new procurement request (Item, Qty, HET). Connect to API.
- [ ] **QC Ledger Page (`/orders/[id]`)**: Build the detailed view for an order, displaying allocations and enabling the status toggle (`DELIVERED`/`QC_FAILED`) with the base64 image uploader.

### Phase 6: Final Integration & Testing
- [ ] Run full E2E simulation: Create Order -> Broadcast via WhatsApp -> Mock Vendor Reply -> Auto-Allocation -> Final QC.
- [ ] Review all codebase against the **Core Directives** (SOLID, High Cohesion, Error Handling). Refactor any monolithic functions.
- [ ] Final polish of the UI/UX.
