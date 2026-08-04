'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Store, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  MessageCircle,
  ShieldCheck,
  Building
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Profile State
  const [initialProfile, setInitialProfile] = useState({ name: '', contact_person: '', email: '', phone: '' });
  const [profile, setProfile] = useState({ name: '', contact_person: '', email: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDetailedAddress, setNewDetailedAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  
  // WhatsApp State
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [qrCodeData, setQrCodeData] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchProfileAndAddress = async () => {
      try {
        const res = await fetch('/api/settings/restaurant');
        const data = await res.json();
        if (res.ok && data.data) {
          setAddresses(data.data.addresses || []);
          const fetchedProfile = {
            name: data.data.name || '',
            contact_person: data.data.contact_person || '',
            email: data.data.email || '',
            phone: data.data.phone || ''
          };
          setInitialProfile(fetchedProfile);
          setProfile(fetchedProfile);
        }
      } catch (err) {}
    };
    fetchProfileAndAddress();

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/whatsapp/status');
        const data = await res.json();
        
        if (res.ok) {
          setConnectionStatus(data.status);
          setQrCodeData(data.qr || '');
          
          if (data.status === 'AUTHENTICATED') {
            setIsConnecting(false);
          }
        }
      } catch (err) {
        setConnectionStatus('ERROR');
      }
    };

    if (isConnecting || connectionStatus === 'INITIALIZING' || connectionStatus === 'QR_READY') {
      fetchStatus();
      intervalId = setInterval(fetchStatus, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isConnecting, connectionStatus]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/settings/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setInitialProfile(profile);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newAddress) return;
    
    setSavingAddress(true);
    try {
      const res = await fetch('/api/settings/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel, full_address: newAddress, detailed_address: newDetailedAddress }),
      });
      if (res.ok) {
        setNewLabel('');
        setNewAddress('');
        setNewDetailedAddress('');
        const refreshRes = await fetch('/api/settings/restaurant');
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.data?.addresses) {
          setAddresses(refreshData.data.addresses);
        }
      }
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefault = async (address_id: string) => {
    try {
      const res = await fetch('/api/settings/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_id }),
      });
      if (res.ok) {
        const refreshRes = await fetch('/api/settings/restaurant');
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.data?.addresses) {
          setAddresses(refreshData.data.addresses);
        }
      }
    } catch (err) {}
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await fetch('/api/whatsapp/init');
      setConnectionStatus('INITIALIZING');
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Please log in to view settings.
      </div>
    );
  }

  const hasChanges = 
    profile.name !== initialProfile.name ||
    profile.contact_person !== initialProfile.contact_person ||
    profile.email !== initialProfile.email ||
    profile.phone !== initialProfile.phone;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col gap-4">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors focus:outline-none rounded-lg py-1 pr-3 w-fit -ml-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Manage your profile, delivery addresses, and third-party integrations.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Profile Information</h2>
            <p className="text-sm text-slate-500 mt-1">Update your restaurant details and account credentials.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Restaurant Name</label>
              <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                <Store className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Contact Person (Username)</label>
              <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  name="contact_person"
                  value={profile.contact_person}
                  onChange={handleProfileChange}
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email Address</label>
              <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone Number</label>
              <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="tel" 
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSaveProfile}
              disabled={!hasChanges || savingProfile}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                hasChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Address Management</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your delivery locations for procurement orders.</p>
          </div>

          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr._id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-xl gap-4 transition-colors ${addr.is_default ? 'border-2 border-emerald-500/20 bg-emerald-50/10' : 'border border-slate-200 bg-white hover:border-blue-200'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 sm:mt-0 ${addr.is_default ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    {addr.is_default ? <MapPin className="w-5 h-5 text-emerald-600" /> : <Building className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-900">{addr.label}</h3>
                      {addr.is_default && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 uppercase tracking-wide">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {addr.full_address}
                    </p>
                    {addr.detailed_address && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        {addr.detailed_address}
                      </p>
                    )}
                  </div>
                </div>
                
                {addr.is_default ? (
                  <div className="flex items-center gap-2 text-emerald-600 sm:self-center self-start pl-14 sm:pl-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <button onClick={() => handleSetDefault(addr._id)} className="text-sm text-blue-600 hover:text-blue-700 font-semibold focus:outline-none transition-colors sm:self-center self-start pl-14 sm:pl-0">
                    Set as Primary
                  </button>
                )}
              </div>
            ))}
            
            {addresses.length === 0 && (
              <p className="text-sm text-slate-500">No addresses saved yet.</p>
            )}
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-6 pt-2">
            <h3 className="text-lg font-bold tracking-tight text-slate-900">Add New Address</h3>
            
            <form onSubmit={handleAddAddress} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Location Name</label>
                <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                  <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="e.g., Warehouse Central or Cabang 3"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    required
                    className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Address</label>
                <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                  <textarea 
                    rows={3}
                    placeholder="Complete street address, district, city, and postal code..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    required
                    className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 w-full resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Detailed Address (For Courier/AI)</label>
                <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden group">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-focus-within:text-blue-500 transition-colors" />
                  <textarea 
                    rows={2}
                    placeholder="E.g. pagar hijau, masuk gang sebelah masjid..."
                    value={newDetailedAddress}
                    onChange={(e) => setNewDetailedAddress(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm ml-3 font-medium text-slate-900 placeholder:text-slate-400 p-0 m-0 w-full resize-none leading-relaxed"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={savingAddress}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {savingAddress ? 'Adding...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Integrations</h2>
            <p className="text-sm text-slate-500 mt-1">Connect third-party apps for seamless automation and alerts.</p>
          </div>

          <div className="flex flex-col items-start p-5 border border-slate-200 rounded-xl bg-slate-50/50 gap-5">
            <div className="flex items-center gap-4 w-full justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0 border border-[#25D366]/20">
                  <MessageCircle className="w-6 h-6 text-[#25D366] fill-[#25D366]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">WhatsApp Business API</h3>
                  <p className="text-sm text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    {connectionStatus === 'AUTHENTICATED' ? 'Connected and receiving updates.' : 'Receive real-time AI negotiation updates.'}
                  </p>
                </div>
              </div>
              
              {connectionStatus === 'AUTHENTICATED' ? (
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Connected
                </div>
              ) : connectionStatus === 'QR_READY' && qrCodeData ? (
                null
              ) : (
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting || connectionStatus === 'INITIALIZING'}
                  className="hidden sm:block w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 whitespace-nowrap disabled:opacity-50"
                >
                  {isConnecting || connectionStatus === 'INITIALIZING' ? 'Initializing...' : 'Connect WhatsApp'}
                </button>
              )}
            </div>

            {connectionStatus !== 'AUTHENTICATED' && (
              <button 
                onClick={handleConnect}
                disabled={isConnecting || connectionStatus === 'INITIALIZING'}
                className="sm:hidden w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 whitespace-nowrap disabled:opacity-50"
              >
                {isConnecting || connectionStatus === 'INITIALIZING' ? 'Initializing...' : 'Connect WhatsApp'}
              </button>
            )}

            {connectionStatus === 'QR_READY' && qrCodeData && (
              <div className="flex flex-col items-start p-6 bg-white rounded-lg border border-slate-200 mt-4 w-full sm:w-auto">
                <p className="mb-4 text-sm font-medium text-slate-900">Scan this QR code with your WhatsApp</p>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100 self-center sm:self-start">
                  <QRCodeSVG value={qrCodeData} size={200} />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
