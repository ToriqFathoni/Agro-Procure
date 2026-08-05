"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  MessageCircle, 
  TrendingUp, 
  Shield, 
  Layers, 
  Activity, 
  Menu,
  X,
  Store,
  Truck,
  Smartphone,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sessionContext = useSession();
  const session = sessionContext?.data;
  const router = useRouter();

  const handleCTA = () => {
    if (session) {
      router.push('/orders');
    } else {
      router.push('/login');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans bg-blue-50 text-slate-800 selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/85 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-1.5 shrink-0 transition-colors">
                <Image src="/Logo_Agro_No_Name.svg" alt="Agro-Procure Logo" width={32} height={32} className="object-contain scale-125" />
              </div>
              <span className={`font-bold tracking-tight text-xl transition-colors ${isScrolled ? 'text-blue-900' : 'text-white'}`}>
                AGRO-PROCURE
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#solusi" className={`font-medium text-sm hover:opacity-75 transition-opacity ${isScrolled ? 'text-slate-600' : 'text-blue-50'}`}>Solusi</a>
              <a href="#cara-kerja" className={`font-medium text-sm hover:opacity-75 transition-opacity ${isScrolled ? 'text-slate-600' : 'text-blue-50'}`}>Cara Kerja</a>
              <a href="#ekosistem" className={`font-medium text-sm hover:opacity-75 transition-opacity ${isScrolled ? 'text-slate-600' : 'text-blue-50'}`}>Ekosistem</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={handleCTA} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-[0_8px_16px_-6px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all duration-200">
                Login
              </button>
            </div>

            <button 
              className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-blue-900' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-4 flex flex-col gap-4 md:hidden">
          <a href="#solusi" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-slate-800 py-2 border-b border-slate-100">Solusi</a>
          <a href="#cara-kerja" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-slate-800 py-2 border-b border-slate-100">Cara Kerja</a>
          <a href="#ekosistem" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-slate-800 py-2 border-b border-slate-100">Ekosistem</a>
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => { setMobileMenuOpen(false); handleCTA(); }} className="w-full bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md">Login</button>
          </div>
        </div>
      )}

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-blue-600 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px] opacity-50 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-700 rounded-full blur-[100px] opacity-50 -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-50 text-sm font-semibold mb-6 backdrop-blur-sm shadow-inner">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                Sistem AI Orchestrator Aktif
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Revolusi Rantai <br className="hidden lg:block" />
                Pasok F&B.
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Langsung dari petani, tanpa perantara. Platform B2B otonom yang menyeimbangkan permintaan restoran dengan kapasitas panen secara transparan dan instan.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                <button onClick={handleCTA} className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-3.5 rounded-full font-semibold text-base hover:bg-emerald-400 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_24px_-6px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2">
                  Mulai Transformasi <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-full lg:h-[500px] mt-10 lg:mt-0">
              <div className="relative z-0 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl shadow-blue-900/40 aspect-[4/3] lg:absolute lg:top-0 lg:right-12 lg:w-[480px]">
                <img 
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop" 
                  alt="Farmer showing produce" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
              </div>

              <div className="relative z-10 -mt-16 lg:mt-0 mx-auto w-11/12 lg:w-[340px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden lg:absolute lg:-bottom-8 lg:-left-4 animate-[bounce_6s_infinite]">
                <div className="bg-emerald-500 px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Image src="/Logo_Agro_No_Name.svg" alt="Agro-Procure Logo" width={24} height={24} className="object-contain scale-125" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm leading-tight">Agro-Procure AI</h4>
                    <span className="text-emerald-100 text-xs">Online</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 flex flex-col gap-3 h-[240px] overflow-hidden relative">
                  <div className="bg-slate-200/60 rounded-xl rounded-tl-none p-3 max-w-[85%] self-start border border-slate-200">
                    <p className="text-sm text-slate-700 font-medium">Permintaan baru: 500kg Cabai Merah Keriting dari Union Group.</p>
                  </div>
                  <div className="bg-emerald-100 rounded-xl rounded-tr-none p-3 max-w-[85%] self-end border border-emerald-200 shadow-sm">
                    <p className="text-sm text-emerald-800 font-medium">Siap! Kami sanggup 200kg di Rp 45.000/kg. Panen besok pagi.</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[10px] text-emerald-600">09:41</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                  </div>
                  <div className="bg-slate-200/60 rounded-xl rounded-tl-none p-3 max-w-[85%] self-start border border-slate-200">
                    <p className="text-sm text-slate-700 font-medium">Tawaran diterima. Sisa 300kg dialihkan ke Kelompok Tani Mekar.</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <svg className="absolute bottom-0 w-full h-12 lg:h-24 text-blue-50 drop-shadow-sm" preserveAspectRatio="none" viewBox="0 0 1440 120" fill="currentColor">
          <path d="M0,60 C480,180 960,-60 1440,60 L1440,120 L0,120 Z"></path>
        </svg>
      </section>

      <section id="ekosistem" className="bg-blue-50 py-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">
            Dipercaya oleh Ekosistem F&B Terdepan
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xl"><Store className="w-6 h-6 text-blue-600" /> Boga Group</div>
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xl"><Layers className="w-6 h-6 text-emerald-500" /> Ismaya</div>
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xl"><Activity className="w-6 h-6 text-blue-500" /> Union Group</div>
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xl"><TrendingUp className="w-6 h-6 text-emerald-600" /> Kopi Kenangan</div>
          </div>
        </div>
      </section>

      <section id="solusi" className="py-24 bg-gradient-to-b from-blue-50 via-white to-slate-50 relative overflow-hidden">
        
        <div className="absolute top-40 left-0 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl opacity-50 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-blue-200/40 rounded-full blur-3xl opacity-50 translate-x-1/3 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Infrastruktur Cerdas, <span className="text-blue-600">Hasil Nyata</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Sistem orkestrasi yang bekerja di latar belakang, merampingkan operasional Anda tanpa mengubah kebiasaan harian mitra petani.
            </p>
          </div>

          <div className="space-y-32">
            
            <div id="cara-kerja" className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Smartphone className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Zero-Friction Onboarding</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                  Lupakan aplikasi rumit. Petani cukup membalas pesan WhatsApp. Sistem AI kami membaca, memproses, dan memperbarui ketersediaan stok secara otomatis dalam hitungan detik.
                </p>
                <ul className="space-y-3 text-slate-700 font-medium">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Tanpa perlu install aplikasi baru</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Konfirmasi instan via Chat</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Natural Language Processing untuk negosiasi</li>
                </ul>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] transform rotate-3 scale-105 opacity-10"></div>
                <div className="bg-white border border-slate-100 p-2 rounded-[2rem] shadow-xl relative z-10">
                  <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Broadcast AI</p>
                        <p className="text-xs font-semibold text-emerald-500">Menjangkau 142 Petani</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-800">Pak Sunaryo - Lembang</span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Respon: 2mnt</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">"Ada 50kg tomat cherry besok pagi, harga 15rb/kg ya."</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-800">Koperasi Tani Maju</span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Respon: 5mnt</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">"Siap suplai 200kg kubis, harga cocok."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-1 lg:order-1 relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-[2.5rem] transform -rotate-3 scale-105 opacity-10"></div>
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] shadow-xl relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="font-bold text-slate-900 text-lg">Load Distribution</h4>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">Optimal</span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-semibold mb-2">
                        <span className="text-slate-700">Target Order: 1000 kg Bawang</span>
                        <span className="text-blue-600">100% Terpenuhi</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-600 w-[45%] border-r-2 border-white relative group">
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="h-full bg-emerald-500 w-[30%] border-r-2 border-white relative group">
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="h-full bg-sky-400 w-[25%] relative group">
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-3 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Sektor Utara (450kg)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Koperasi A (300kg)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sky-400"></div> Petani B (250kg)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-2 lg:order-2">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <BarChart3 className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Intelligent Load Balancing</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                  Distribusi pesanan skala besar secara cerdas. Sistem memecah order enterprise ke ratusan petani kecil untuk mencegah kegagalan suplai dan meratakan kesejahteraan.
                </p>
                <ul className="space-y-3 text-slate-700 font-medium">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Jaminan Supply Rate 99.9%</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Mitigasi risiko gagal panen otomatis</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Pemberdayaan merata untuk petani kecil</li>
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Shield className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Threshold Bidding</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                  Mekanisme lelang otomatis yang menguntungkan kedua belah pihak. Sistem menolak harga manipulatif dan menjaga rentang harga wajar sesuai data pasar real-time.
                </p>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] transform rotate-3 scale-105 opacity-10"></div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-xl relative z-10 text-center">
                  <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-bold text-sm mb-6 border border-blue-100">
                    Perbandingan Harga Real-time
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-600">Tengkulak Tradisional</span>
                      <span className="font-bold text-slate-900 text-lg strike">Rp 52.000/kg</span>
                    </div>
                    <div className="flex justify-between items-center p-5 rounded-xl bg-blue-600 border border-blue-500 shadow-lg transform scale-105">
                      <span className="font-bold text-white flex items-center gap-2 tracking-tight">
                        <div className="w-8 h-8 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-1 shrink-0">
                          <Image src="/Logo_Agro_No_Name.svg" alt="Agro-Procure Logo" width={24} height={24} className="object-contain scale-125" />
                        </div>
                        AGRO-PROCURE
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-emerald-300 text-2xl drop-shadow-md">Rp 45.000/kg</span>
                        <p className="text-xs text-blue-200 font-medium">Petani terima 100%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Siap Memutus Rantai Pasok Panjang?</h2>
          <p className="text-xl text-blue-100 mb-10 font-medium">Gabung dengan puluhan enterprise F&B yang telah menghemat biaya hingga 25% sambil menyejahterakan petani lokal.</p>
          <button onClick={handleCTA} className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-200">
            Mulai Sekarang
          </button>
        </div>
      </section>

      <footer className="bg-slate-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-1.5 shrink-0">
                  <Image src="/Logo_Agro_No_Name.svg" alt="Agro-Procure Logo" width={32} height={32} className="object-contain scale-125" />
                </div>
                <span className="text-2xl text-white font-bold tracking-tight">AGRO-PROCURE</span>
              </div>
              <p className="text-slate-400 max-w-sm font-medium leading-relaxed mb-6">
                Mendigitalisasi rantai pasok F&B dengan AI dan orkestrasi WhatsApp tanpa batas untuk masa depan agrikultur yang lebih adil.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Solusi</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Untuk Restoran</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Untuk Petani</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Enterprise API</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Keamanan Data</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Perusahaan</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Karir</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Hubungi Kami</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 font-medium text-sm">
              &copy; {new Date().getFullYear()} Agro-Procure Inc. Hak cipta dilindungi.
            </p>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
