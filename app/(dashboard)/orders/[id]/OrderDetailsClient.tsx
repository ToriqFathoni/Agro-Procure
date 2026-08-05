'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Hash,
  Banknote,
  MapPin,
  Phone,
  Star,
  PauseCircle,
  PlayCircle,
  Clock,
  Upload,
  Check,
  X
} from 'lucide-react';

export default function OrderDetailsClient({ order, vendorMap }: { order: any, vendorMap: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);

  const handleUpdate = async (vendorId: string, status: string, form: HTMLFormElement) => {
    setLoading(vendorId);

    const formData = new FormData(form);
    formData.append('status', status);

    try {
      const res = await fetch(`/api/orders/${order._id}/allocations/${vendorId}`, {
        method: 'PATCH',
        body: formData,
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleToggleBot = async (vendorId: string) => {
    setLoading(`toggle-${vendorId}`);
    try {
      const res = await fetch(`/api/vendors/${vendorId}/toggle-bot`, {
        method: 'PATCH'
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleStartNegotiation = async () => {
    setBroadcasting(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/negotiate`, {
        method: 'POST'
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setBroadcasting(false);
    }
  };

  const handleCancelSearch = async () => {
    setLoading('cancel-search');
    try {
      const res = await fetch(`/api/orders/${order._id}/cancel`, { method: 'POST' });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <button onClick={() => router.push('/orders')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors focus:outline-none rounded-lg py-1 pr-3 -ml-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {order.status === 'DRAFT' && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-blue-900 font-bold text-lg flex items-center gap-2">
                AI Recommendation Draft
              </h2>
              <p className="text-blue-700/80 text-sm font-medium">
                Review the AI's vendor allocations before initiating the broadcast.
              </p>
            </div>
            <button
              onClick={handleStartNegotiation}
              disabled={broadcasting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {broadcasting ? 'Initiating...' : 'Confirm & Start AI Negotiation'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{order.item_name}</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Order ID: {order._id}</p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {order.status === 'NEGOTIATING' && (
                <button onClick={handleCancelSearch} disabled={loading === 'cancel-search'} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors focus:outline-none">
                  <X className="w-3.5 h-3.5" />
                  Cancel Search
                </button>
              )}
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10">
                {order.status}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 bg-slate-50/30">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Quantity</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Hash className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-xl font-bold text-slate-900">{order.total_quantity} <span className="text-base font-semibold text-slate-600">{order.unit || 'Kg'}</span></span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Max Price (HET)</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-xl font-bold text-slate-900">Rp {order.max_price_het?.toLocaleString('id-ID')} <span className="text-sm text-slate-500 font-medium">/{order.unit || 'Kg'}</span></span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Delivery Address</span>
                {(order.status === 'DRAFT' || order.status === 'PENDING') && (
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors focus:outline-none">
                    Edit
                  </button>
                )}
              </div>
              <div className="flex items-start gap-3 mt-1">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 leading-relaxed pt-1">
                  {order.delivery_address}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 px-1">Vendor Allocations</h3>

          <div className="space-y-4">
            {!order.allocations || order.allocations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center flex flex-col items-center justify-center">
                <p className="text-slate-500 font-medium text-lg">No active vendors found for this commodity.</p>
                <p className="text-sm text-slate-400 mt-2">Please ensure you have an ACTIVE vendor in your directory that matches this item.</p>
              </div>
            ) : (
              order.allocations.map((allocation: any) => {
                const vendor = vendorMap[allocation.vendor_id] || { name: 'Unknown Vendor', is_bot_active: true };
                const rawScore = vendor.fulfillment_score ?? allocation.fulfillment_score ?? 0;
                const fulfillmentScore = rawScore <= 1 && rawScore > 0 ? Math.round(rawScore * 100) : rawScore;

                return (
                  <div key={allocation.vendor_id} className="space-y-4">
                    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 justify-between md:items-center group">
                      
                      <div className="flex flex-col gap-3 flex-1">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {vendor.name}
                        </h4>
                        <div className="flex flex-col gap-2 text-sm text-slate-600 font-medium">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                            {vendor.whatsapp_number || 'No Number'}
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{vendor.address || 'No Address provided'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:block w-px h-16 bg-slate-100"></div>

                      <div className="flex flex-row md:flex-col items-center md:items-start justify-between gap-2 md:w-48 bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border md:border-none border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide md:mb-1">Allocated</span>
                          {order.status === 'DRAFT' ? (
                            <span className="text-2xl font-bold text-slate-300">-</span>
                          ) : allocation.status === 'PENDING' || allocation.status === 'NEGOTIATING' || allocation.status === 'NEEDS_REVIEW' ? (
                            <span className="text-lg font-bold text-amber-500">On Negotiation</span>
                          ) : (
                            <span className="text-2xl font-bold text-blue-600">
                              {allocation.allocated_qty} {order.unit || 'Kg'}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 items-end md:items-start">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-bold text-slate-700">
                              {fulfillmentScore}% <span className="hidden sm:inline font-medium text-slate-500">Score</span>
                            </span>
                          </div>
                          <div className="w-24 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${fulfillmentScore >= 95 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                              style={{ width: `${fulfillmentScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:block w-px h-16 bg-slate-100"></div>

                      <div className="flex flex-row md:flex-col items-center justify-between md:items-end gap-4 md:w-48 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          <Clock className="w-3.5 h-3.5" />
                          {order.status === 'DRAFT' ? 'DRAFT' : allocation.status}
                        </span>
                        
                        {vendor.is_bot_active !== false ? (
                          <button 
                            onClick={() => handleToggleBot(allocation.vendor_id)}
                            disabled={loading === `toggle-${allocation.vendor_id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-full sm:w-auto justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            <PauseCircle className="w-4 h-4" />
                            Take Over (Pause AI)
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleBot(allocation.vendor_id)}
                            disabled={loading === `toggle-${allocation.vendor_id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full sm:w-auto justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Resume AI
                          </button>
                        )}
                      </div>

                    </div>

                    {allocation.status === 'NEEDS_REVIEW' && (
                      <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mt-4 mx-6 mb-6">
                        <p className="text-sm font-medium text-blue-800 mb-3 leading-relaxed">
                          {vendor.name} mengajukan penawaran untuk <strong>{allocation.allocated_qty} {order.unit || 'Kg'}</strong> dengan harga <strong>Rp {allocation.agreed_price?.toLocaleString('id-ID')}</strong>. Silakan hubungi manual untuk negosiasi lebih lanjut. Mulai dari sini Anda bisa <em>take over</em> (Deal), atau membatalkan penawaran ini (Batal).
                        </p>
                        <div className="flex items-center gap-3">
                          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(allocation.vendor_id, 'PARTIAL_ACCEPTED', e.currentTarget); }}>
                            <button type="submit" disabled={loading === allocation.vendor_id} className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-70">
                              Deal (Terima)
                            </button>
                          </form>
                          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(allocation.vendor_id, 'REJECTED', e.currentTarget); }}>
                            <button type="submit" disabled={loading === allocation.vendor_id} className="px-5 py-2.5 bg-slate-200 text-slate-800 hover:bg-slate-300 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70">
                              Batal (Cari Vendor Lain)
                            </button>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* Payment sections */}
                    {((allocation.status === 'WAITING_FOR_DP' || allocation.dp_required) || allocation.proof_image_url || (allocation.status === 'ACCEPTED' || allocation.status === 'PARTIAL_ACCEPTED')) && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                        {(allocation.status === 'WAITING_FOR_DP' || allocation.dp_required) && (
                          <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Action Required: DP Rp {allocation.dp_amount?.toLocaleString('id-ID')} requested.
                          </div>
                        )}

                        {allocation.status === 'WAITING_FOR_DP' && (
                          <form
                            className="flex flex-col gap-3 p-5 bg-amber-50/50 rounded-xl border border-amber-100"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              if (form.checkValidity()) handleUpdate(allocation.vendor_id, 'ACCEPTED', form);
                              else form.reportValidity();
                            }}
                          >
                            <label className="text-sm font-semibold text-amber-900">Pembayaran DP (Upload Transfer Proof)</label>
                            <input
                              type="file"
                              name="file"
                              accept="image/*"
                              required
                              className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 transition-colors focus:outline-none w-full"
                            />
                            <button
                              type="submit"
                              disabled={loading === allocation.vendor_id}
                              className="self-start mt-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-5 rounded-xl text-sm transition-colors disabled:opacity-70 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            >
                              <Upload className="w-4 h-4" />
                              {loading === allocation.vendor_id ? 'Uploading...' : 'Upload Transfer Proof'}
                            </button>
                          </form>
                        )}

                        {allocation.proof_image_url && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold mb-2 text-slate-700">Proof of Delivery</p>
                            <img src={allocation.proof_image_url} alt="Proof" className="w-full max-w-sm h-48 object-cover rounded-xl border border-slate-200 shadow-sm" />
                          </div>
                        )}

                        {(allocation.status === 'ACCEPTED' || allocation.status === 'PARTIAL_ACCEPTED') && (
                          <form
                            className="flex flex-col gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 mt-4"
                            onSubmit={(e) => e.preventDefault()}
                          >
                            <label className="text-sm font-semibold text-slate-700">Final Payment (Upload Delivery Proof)</label>
                            <input
                              type="file"
                              name="file"
                              accept="image/*"
                              required
                              className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:border file:border-slate-200 file:text-slate-700 hover:file:bg-slate-100 transition-colors focus:outline-none w-full"
                            />
                            <div className="flex flex-col sm:flex-row gap-3 mt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  const form = e.currentTarget.closest('form');
                                  if (form?.checkValidity()) handleUpdate(allocation.vendor_id, 'COMPLETED', form);
                                  else form?.reportValidity();
                                }}
                                disabled={loading === allocation.vendor_id}
                                className="flex-1 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                              >
                                <Check className="w-4 h-4" />
                                {loading === allocation.vendor_id ? 'Uploading...' : 'Accept QC'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  const form = e.currentTarget.closest('form');
                                  if (form?.checkValidity()) handleUpdate(allocation.vendor_id, 'QC_FAILED', form);
                                  else form?.reportValidity();
                                }}
                                disabled={loading === allocation.vendor_id}
                                className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              >
                                <X className="w-4 h-4" />
                                Reject QC
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}