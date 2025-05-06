"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';

// Import this when your API is ready
// import { fetchCellDetails } from '@/lib/api';

export default function CellDetailPage({ params }) {
  const { cellId } = use(params);
  const [cellData, setCellData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCellData = async () => {
      try {
        setLoading(true);
        
        // For now, create mock data - replace with actual API call later
        // const data = await fetchCellDetails(cellId);
        
        // Mock data
        const mockData = {
          id: cellId,
          risk: ['High', 'Moderate', 'Low'][Math.floor(Math.random() * 3)],
          rainfall: Math.round(Math.random() * 100),
          population: Math.round(Math.random() * 50000),
          elevation: Math.round(Math.random() * 2000),
          coordinates: {
            lat: 30 + (Math.random() - 0.5) * 5,
            lng: 69 + (Math.random() - 0.5) * 5
          },
          prediction: Math.random() > 0.3 ? Number((Math.random() * 100).toFixed(2)) : null,
          historicalData: [
            { year: 2020, rainfall: Math.round(Math.random() * 100) },
            { year: 2021, rainfall: Math.round(Math.random() * 100) },
            { year: 2022, rainfall: Math.round(Math.random() * 100) },
            { year: 2023, rainfall: Math.round(Math.random() * 100) },
            { year: 2024, rainfall: Math.round(Math.random() * 100) }
          ]
        };
        
        setCellData(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading cell data:', err);
        setError('Failed to load cell data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadCellData();
  }, [cellId]);

  const getRiskColorClass = (risk) => {
    switch (risk) {
      case 'High': return 'bg-red-600';
      case 'Moderate': return 'bg-orange-600';
      case 'Low': return 'bg-green-600';
      default: return 'bg-slate-400';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-slate-700">Loading cell data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <Link href="/predictor" className="text-orange-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Map
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-2">Cell {cellId} Details</h1>
          </div>
          
          {cellData && (
            <div className={`px-4 py-1 rounded-full ${getRiskColorClass(cellData.risk)} text-white flex items-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{cellData.risk} Risk</span>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {cellData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main info card */}
            <div className="bg-white shadow rounded-lg overflow-hidden col-span-2">
              <div className="px-6 py-5 border-b border-gray-400">
                <h3 className="text-lg font-medium text-gray-900">Cell Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded">
                    <div className="text-sm text-slate-500 uppercase font-medium">Coordinates</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {cellData.coordinates.lat.toFixed(4)}, {cellData.coordinates.lng.toFixed(4)}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded">
                    <div className="text-sm text-slate-500 uppercase font-medium">Elevation</div>
                    <div className="text-lg font-semibold text-slate-800">{cellData.elevation} meters</div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded">
                    <div className="text-sm text-slate-500 uppercase font-medium">Rainfall</div>
                    <div className="text-lg font-semibold text-slate-800">{cellData.rainfall} mm</div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded">
                    <div className="text-sm text-slate-500 uppercase font-medium">Population</div>
                    <div className="text-lg font-semibold text-slate-800">{cellData.population.toLocaleString()}</div>
                  </div>
                </div>
                
                {/* Placeholder for future charts/data */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Historical Rainfall Data</h4>
                  <div className="bg-slate-50 p-4 rounded h-64 flex items-center justify-center">
                    <p className="text-slate-500">
                      Chart will be displayed here when API integration is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Side panel */}
            <div className="space-y-6">
              {/* Risk assessment card */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-400">
                  <h3 className="text-lg font-medium text-gray-900">Risk Assessment</h3>
                </div>
                <div className="p-6">
                  <div className={`mb-4 p-3 rounded-lg border-gray-300 ${
                    cellData.risk === 'High' ? 'bg-red-50 text-red-800' :
                    cellData.risk === 'Moderate' ? 'bg-orange-50 text-orange-800' :
                    'bg-green-50 text-green-800'
                  }`}>
                    <div className="font-medium">Risk Level: {cellData.risk}</div>
                    <div className="text-sm mt-1">
                      {cellData.risk === 'High' ? 
                        'Immediate action recommended.' :
                        cellData.risk === 'Moderate' ? 
                        'Monitor conditions closely.' :
                        'Low probability of issues.'
                      }
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-slate-500 uppercase font-medium mb-2">Flood Prediction</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {cellData.prediction !== null ? 
                        `${cellData.prediction}%` : 
                        'Not available'
                      }
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Likelihood of flooding in next 30 days
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions card */}
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
}