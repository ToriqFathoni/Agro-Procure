'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Eye, MoreVertical, Power, Bot } from 'lucide-react';
import Link from 'next/link';
import { calculateDistance } from '@/utils/distance';

interface IVendor {
  _id: string;
  name: string;
  whatsapp_number: string;
  commodities: string[];
  fulfillment_score: number;
  status: string;
  is_bot_active: boolean;
  location?: { latitude: number; longitude: number; };
  dynamicScore?: number;
}

export default function VendorDirectory() {
  const { data: session } = useSession();
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vendors');
      const data = await res.json();
      if (res.ok && data.success) {
        try {
          const restoRes = await fetch('/api/settings/restaurant');
          const restoData = await restoRes.json();
          const defaultAddr = restoData?.data?.addresses?.find((a: any) => a.is_default);

          let finalVendors = data.data.map((v: any) => {
            let dynamicScore = v.fulfillment_score;
            if (v.location?.latitude && v.location?.longitude && defaultAddr?.location?.latitude && defaultAddr?.location?.longitude) {
              const dist = calculateDistance(defaultAddr.location.latitude, defaultAddr.location.longitude, v.location.latitude, v.location.longitude);
              const penalty = Math.min(dist * 0.001, 0.3);
              dynamicScore = parseFloat(Math.max(0.1, v.fulfillment_score - penalty).toFixed(2));
            } else {
              dynamicScore = parseFloat(v.fulfillment_score.toFixed(2));
            }
            return { ...v, dynamicScore };
          });

          finalVendors.sort((a: any, b: any) => b.dynamicScore - a.dynamicScore);
          setVendors(finalVendors);
        } catch (e) {
          setVendors(data.data);
        }
      } else {
        setError(data.error || 'Failed to fetch vendors');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchVendors();
    }
  }, [session]);

  const handleToggleVendorStatus = async (vendorId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setVendors(prev => prev.map(v => v._id === vendorId ? { ...v, status: newStatus } : v));
    setOpenMenuId(null);
    try {
      await fetch(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Failed to update vendor status');
    }
  };

  const handleToggleBotStatus = async (vendorId: string, currentBotStatus: boolean) => {
    const newBotStatus = !currentBotStatus;
    setVendors(prev => prev.map(v => v._id === vendorId ? { ...v, is_bot_active: newBotStatus } : v));
    setOpenMenuId(null);
    try {
      await fetch(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_bot_active: newBotStatus })
      });
    } catch (error) {
      console.error('Failed to update bot status');
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 0.9) return 'bg-emerald-500';
    if (score >= 0.8) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone || phone.trim() === '') {
      return <span className="italic text-slate-400 text-xs">Belum ada kontak</span>;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const prefix = cleanPhone.startsWith('62') ? '+62 ' + cleanPhone.slice(2, 5) : '+62 ' + cleanPhone.slice(1, 4);
    return `${prefix} •••• ••••`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          ACTIVE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20">
        INACTIVE
      </span>
    );
  };

  const renderCommodities = (commodities: string[]) => {
    if (!commodities || commodities.length === 0) return null;

    const displayed = commodities.slice(0, 2);
    const extraCount = commodities.length - 2;

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {displayed.map((item, index) => (
          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
            {item}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="inline-flex items-center px-1.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-semibold">
            +{extraCount}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Vendor Directory
            </h1>
            <p className="text-sm text-slate-500 max-w-xl">
              A complete list of registered farmers, their specialized commodities, and fulfillment scores.
            </p>
          </div>
          <Link href="/vendors/new" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <Plus className="w-4 h-4" />
            Add New Vendor
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto pb-32 min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Vendor Info
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Commodities
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">
                    Fulfillment
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                      Loading vendors...
                    </td>
                  </tr>
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                      No vendors registered yet.
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => {
                    const score = vendor.dynamicScore !== undefined ? vendor.dynamicScore : vendor.fulfillment_score;
                    const percentage = Math.round(score * 100) || 0;
                    const barColor = getProgressBarColor(score);

                    return (
                      <tr key={vendor._id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{vendor.name}</span>
                            <span className="text-xs text-slate-400 mt-0.5">{formatPhoneNumber(vendor.whatsapp_number)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderCommodities(vendor.commodities)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-slate-700">{percentage}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getStatusBadge(vendor.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === vendor._id ? null : vendor._id)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="More Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === vendor._id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-6 mt-1 w-48 bg-white shadow-lg rounded-xl border border-slate-100 py-1 z-50 text-left">
                                <Link
                                  href={`/vendors/${vendor._id}`}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  Lihat Detail
                                </Link>
                                <button
                                  onClick={() => handleToggleVendorStatus(vendor._id, vendor.status)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                >
                                  <Power className={`w-3.5 h-3.5 ${vendor.status === 'ACTIVE' ? 'text-red-400' : 'text-emerald-500'}`} />
                                  {vendor.status === 'ACTIVE' ? 'Nonaktifkan Vendor' : 'Aktifkan Vendor'}
                                </button>
                                <button
                                  onClick={() => handleToggleBotStatus(vendor._id, vendor.is_bot_active)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                >
                                  <Bot className={`w-3.5 h-3.5 ${vendor.is_bot_active ? 'text-red-400' : 'text-emerald-500'}`} />
                                  {vendor.is_bot_active ? 'Nonaktifkan AI' : 'Aktifkan AI'}
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}