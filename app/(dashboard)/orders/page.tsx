'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, ArrowRight, X, MapPin, Package, Hash, Banknote, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface IOrder {
  _id: string;
  item_name: string;
  total_quantity: number;
  max_price_het: number;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('All Requests');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    total_quantity: '',
    unit: 'Kg',
    max_price_het: '',
    delivery_address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        const res = await fetch('/api/settings/restaurant');
        const data = await res.json();
        if (res.ok && data.data?.addresses) {
          setAddresses(data.data.addresses);
          const defaultAddr = data.data.addresses.find((a: any) => a.is_default) || data.data.addresses[0];
          if (defaultAddr) {
            setFormData(prev => ({
              ...prev,
              delivery_address: `${defaultAddr.label} - ${defaultAddr.full_address}`
            }));
          }
        }
      } catch (err) {}
    };

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (res.ok && data.success) {
          setOrders(data.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDefaultAddress();
      fetchOrders();
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: formData.item_name,
          total_quantity: Number(formData.total_quantity),
          unit: formData.unit,
          max_price_het: Number(formData.max_price_het),
          delivery_address: formData.delivery_address,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setFormData(prev => ({ ...prev, item_name: '', total_quantity: '', max_price_het: '', unit: 'Kg' }));
        router.push('/orders/' + data.data._id);
      }
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'NEGOTIATING') {
      return (
        <span className="bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center">
          {s}
        </span>
      );
    }
    if (s === 'COMPLETED') {
      return (
        <span className="bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center">
          {s}
        </span>
      );
    }
    if (s === 'WAITING_FOR_DP') {
      return (
        <span className="bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center">
          WAITING FOR DP
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center">
          {s}
        </span>
      );
    }
    return (
      <span className="bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center">
        {s}
      </span>
    );
  };

  const filteredOrders = activeTab === 'All Requests' 
    ? orders 
    : orders.filter(order => order.status.toUpperCase() === activeTab.replace(' ', '_').toUpperCase());

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <main className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Procurement Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              A list of all your procurement orders, their quantities, maximum prices (HET), and current statuses.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {['All Requests', 'Draft', 'Negotiating', 'Waiting for DP', 'Completed', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap transition-colors focus:outline-none ${
                activeTab === tab
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-4 py-2 text-sm font-medium border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Item Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Total Qty
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Max Price (HET)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group cursor-default">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{order.item_name}</span>
                          <span className="text-xs text-slate-400 mt-0.5">{order._id.slice(-8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {order.total_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        Rp {order.max_price_het.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link href={`/orders/${order._id}`} className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center justify-end gap-1 focus:outline-none">
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans selection:bg-blue-100 selection:text-blue-900">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 relative">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create New Request</h2>
              <p className="text-sm text-slate-500 mt-1">Define your raw material needs and maximum price.</p>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="p-6 space-y-5">
                {/* Delivery Address (Custom Dropdown) */}
                <div className="relative">
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Delivery Address</label>
                  <div 
                    onClick={() => setIsAddressOpen(!isAddressOpen)}
                    className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all cursor-pointer"
                  >
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm font-medium text-slate-700 whitespace-normal break-words ml-3">
                      {formData.delivery_address || "Pilih alamat pengiriman..."}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 ml-2 transition-transform ${isAddressOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Custom Dropdown Menu */}
                  {isAddressOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden flex flex-col">
                      <div className="max-h-48 overflow-y-auto">
                        {addresses.length > 0 ? (
                          addresses.map((addr: any, index: number) => {
                            const fullAddr = `${addr.label} - ${addr.full_address}`;
                            return (
                              <div 
                                key={index}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, delivery_address: fullAddr }));
                                  setIsAddressOpen(false);
                                }}
                                className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                              >
                                {fullAddr}
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-500">Belum ada alamat.</div>
                        )}
                      </div>
                      <Link 
                        href="/settings"
                        className="px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center justify-center bg-slate-50 border-t border-slate-100 transition-colors"
                      >
                        + Tambah Alamat Baru
                      </Link>
                    </div>
                  )}
                </div>

                {/* Item Name */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Item Name</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden">
                    <Package className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      type="text" 
                      name="item_name"
                      required
                      value={formData.item_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Tomat, Daging Ayam"
                      className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 shadow-none w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Total Quantity */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Total Quantity</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-2 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden">
                      <Hash className="w-5 h-5 text-slate-400 shrink-0" />
                      <input 
                        type="number" 
                        name="total_quantity"
                        required
                        min="1"
                        value={formData.total_quantity}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="flex-1 min-w-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 shadow-none w-full"
                      />
                      <div className="w-px h-5 bg-slate-300 shrink-0 mx-2"></div>
                      <select 
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-600 font-semibold text-sm cursor-pointer p-0 pr-6 shrink-0 shadow-none"
                      >
                        <option value="Kg">Kg</option>
                        <option value="Gram">Gram</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Ekor">Ekor</option>
                        <option value="Liter">Liter</option>
                        <option value="Ikat">Ikat</option>
                      </select>
                    </div>
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Max Price (HET)</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden">
                      <Banknote className="w-5 h-5 text-slate-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-500 ml-3 shrink-0">Rp</span>
                      <input 
                        type="number" 
                        name="max_price_het"
                        required
                        min="1"
                        value={formData.max_price_het}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="flex-1 min-w-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-1 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 shadow-none w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-xl flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-md"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Create Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
