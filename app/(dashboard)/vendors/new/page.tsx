'use client';

import React, { useState } from 'react';
import { ArrowLeft, Store, Phone, Tags, MapPin, Navigation, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddNewVendor() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    commodities: '',
    full_address: '',
    detailed_address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappError, setWhatsappError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    
    if (val.startsWith('0')) {
      val = '62' + val.substring(1);
    } else if (val.length > 0 && !val.startsWith('62')) {
      val = '62' + val;
    }
    
    setFormData(prev => ({ ...prev, whatsapp_number: val }));
    
    if (val.length > 0 && val.length < 10) {
      setWhatsappError('Nomor harus valid dan berisi angka minimal 10 digit');
    } else {
      setWhatsappError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.whatsapp_number.length < 10) {
      setWhatsappError('Nomor harus valid dan berisi angka minimal 10 digit');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedCommodities = formData.commodities
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          whatsapp_number: formData.whatsapp_number,
          commodities: parsedCommodities,
          address: formData.full_address,
          detailed_address: formData.detailed_address,
        }),
      });

      if (res.ok) {
        router.push('/vendors');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add vendor');
      }
    } catch (err) {
      alert('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        <Link href="/vendors" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors focus:outline-none rounded-lg py-1 pr-3 -ml-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Add New Vendor</h1>
            <p className="text-sm text-slate-500 mt-1">Register a new farmer or supplier to your directory.</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Vendor Name<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                <Store className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Koperasi Tani Makmur"
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 shadow-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                WhatsApp Number<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="tel" 
                  name="whatsapp_number"
                  required
                  value={formData.whatsapp_number}
                  onChange={handleWhatsappChange}
                  placeholder="e.g., 628123456789"
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 shadow-none w-full"
                />
              </div>
              {whatsappError && (
                <p className="text-xs font-semibold text-red-500 mt-1.5">{whatsappError}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Commodities<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                <Tags className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  name="commodities"
                  required
                  value={formData.commodities}
                  onChange={handleInputChange}
                  placeholder="Comma separated (e.g., Tomat, Cabai)"
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 shadow-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Full Address<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                <textarea 
                  name="full_address"
                  required
                  value={formData.full_address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Street address, neighborhood, city..."
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 shadow-none w-full resize-none leading-relaxed"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Detailed Address Instructions (For Courier/AI)<span className="text-slate-400 font-normal ml-1">(Opsional)</span>
              </label>
              <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                <Navigation className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                <textarea 
                  name="detailed_address"
                  value={formData.detailed_address}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g., Cat kuning, pagar hijau, gang masuk sebelah warung."
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 shadow-none w-full resize-none leading-relaxed"
                />
              </div>
            </div>

          </div>

          <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
            <Link href="/vendors" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:hover:shadow-md disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Vendor
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
