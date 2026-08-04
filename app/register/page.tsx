'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sprout, Store, User, Phone, Mail, Lock } from 'lucide-react';

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-200/20 blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 mx-auto w-fit mb-8 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-1.5 shrink-0">
            <Image src="/Logo_Agro_No_Name.svg" alt="Agro-Procure Logo" width={32} height={32} className="object-contain scale-125" />
          </div>
          <span className="text-2xl flex items-center">
            <span className="text-blue-700 font-bold tracking-tight">AGRO-</span><span className="text-emerald-600 font-bold tracking-tight">PROCURE</span>
          </span>
        </Link>

        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Register your Restaurant
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Restaurant Name</label>
              <div className="flex items-center w-full overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                <div className="flex items-center justify-center pl-4 pr-1 text-slate-400">
                  <Store className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full py-2.5 pl-2 pr-3 text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 sm:text-sm" 
                  placeholder="e.g. Kedai Nasi Kandar" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Contact Person</label>
              <div className="flex items-center w-full overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                <div className="flex items-center justify-center pl-4 pr-1 text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  name="contact_person"
                  required
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="w-full py-2.5 pl-2 pr-3 text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 sm:text-sm" 
                  placeholder="Full Name" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <div className="flex items-center w-full overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                <div className="flex items-center justify-center pl-4 pr-1 text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input 
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full py-2.5 pl-2 pr-3 text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 sm:text-sm" 
                  placeholder="+62 812 3456 7890" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="flex items-center w-full overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                <div className="flex items-center justify-center pl-4 pr-1 text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full py-2.5 pl-2 pr-3 text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 sm:text-sm" 
                  placeholder="admin@restaurant.com" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="flex items-center w-full overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                <div className="flex items-center justify-center pl-4 pr-1 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full py-2.5 pl-2 pr-3 text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 sm:text-sm" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:-translate-y-0"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
