import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import { Vendor } from '@/models/Vendor';
import { Restaurant } from '@/models/Restaurant';
import Link from 'next/link';
import { calculateDistance } from '@/utils/distance';

export default async function VendorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const vendorId = resolvedParams.id;

  await connectToDatabase();
  const vendor = await Vendor.findById(vendorId).lean();
  const restaurant = await Restaurant.findById("6a5b972d2668d5fa87b17553").lean();

  const defaultAddress = restaurant?.addresses?.find((a: any) => a.is_default);

  let distanceDisplay = "Calculating...";
  let dynamicScore = vendor?.fulfillment_score || 0;
  
  const hasRestoCoords = !!(defaultAddress?.location?.latitude && defaultAddress?.location?.longitude);
  const hasVendorCoords = !!(vendor?.location?.latitude && vendor?.location?.longitude);

  if (hasRestoCoords && hasVendorCoords) {
    const calcDist = calculateDistance(
      defaultAddress.location.latitude,
      defaultAddress.location.longitude,
      vendor.location.latitude,
      vendor.location.longitude
    );
    distanceDisplay = `${calcDist} km`;
    const penalty = Math.min(calcDist * 0.001, 0.3);
    dynamicScore = parseFloat(Math.max(0.1, vendor.fulfillment_score - penalty).toFixed(2));
  } else if (!hasRestoCoords && !hasVendorCoords) {
    distanceDisplay = "N/A (Resto & Vendor coordinates missing)";
  } else if (!hasRestoCoords) {
    distanceDisplay = "N/A (Restaurant coordinates not found. Try a simpler default address in Settings)";
  } else if (!hasVendorCoords) {
    distanceDisplay = "N/A (Vendor coordinates not found. Edit vendor address to be simpler)";
  }

  if (!vendor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Vendor Not Found</h2>
          <p className="mt-2 text-zinc-500">The vendor you are looking for does not exist.</p>
          <div className="mt-6">
            <Link href="/vendors" className="text-blue-600 hover:text-blue-500">
              &larr; Back to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/vendors" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
          &larr; Back to Directory
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg leading-6 font-medium text-zinc-900 dark:text-white">
            Vendor Profile
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Comprehensive details and analytics for {vendor.name}.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-zinc-200 dark:sm:divide-zinc-800">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Full name</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white sm:mt-0 sm:col-span-2">{vendor.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">WhatsApp Number</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white sm:mt-0 sm:col-span-2">{vendor.whatsapp_number}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Commodities</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white sm:mt-0 sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {vendor.commodities.map((item: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                      {item}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Fulfillment Score</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <span className="font-semibold">{Math.round(dynamicScore * 100)}%</span>
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Bot Status</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white sm:mt-0 sm:col-span-2">
                {vendor.is_bot_active !== false ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    AI Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Manual
                  </span>
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Location</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white sm:mt-0 sm:col-span-2">
                <p>{vendor.address || 'Pending ERP Integration (Geospatial Address)'}</p>
                <p className="text-sm text-gray-700"><strong>Distance to Warehouse:</strong> {distanceDisplay}</p>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Historical Capacity</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white sm:mt-0 sm:col-span-2">Pending ERP Integration</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
