import React from 'react';
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
    </AuthProvider>
  );
}
