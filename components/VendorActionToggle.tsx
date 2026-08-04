'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorActionToggle({ vendorId, currentStatus, onSuccess }: { vendorId: string, currentStatus: string, onSuccess?: () => void }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setIsPending(true);
    try {
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  };

  if (currentStatus === 'ACTIVE') {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="!bg-red-500 hover:!bg-red-600 !text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? '...' : 'Suspend'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="!bg-green-500 hover:!bg-green-600 !text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? '...' : 'Activate'}
    </button>
  );
}
