'use client';

import React, { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Sprout, LayoutDashboard, Users, Settings, LogOut, ChevronDown, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-1.5 shrink-0">
                <Image src="/Logo_Agro_No_Name.svg" alt="Agro-Procure Logo" width={32} height={32} className="object-contain scale-125" />
              </div>
              <span className="text-xl flex items-center">
                <span className="text-blue-700 font-bold tracking-tight">AGRO-</span><span className="text-emerald-600 font-bold tracking-tight">PROCURE</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              <Link href="/orders" className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors ${pathname?.startsWith('/orders') ? 'bg-slate-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/vendors" className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors ${pathname?.startsWith('/vendors') ? 'bg-slate-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                <Users className="w-4 h-4" />
                Vendors
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-900">{session?.user?.name || session?.user?.email || 'User'}</span>
                  <span className="text-xs text-slate-500">Restaurant Admin</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl border border-slate-100 py-1 z-50">
                  <Link href="/settings" className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
