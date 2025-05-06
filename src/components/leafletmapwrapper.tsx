'use client'
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading map...</div>
});

export default function LeafletMapWrapper() {
  return <LeafletMap />;
}