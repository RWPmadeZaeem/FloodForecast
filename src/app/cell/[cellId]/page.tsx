"use client"

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface DailyRisk {
  probability: number | null;
  risk: string;
}

interface GridCellProperties {
  id: string;
  risk: string;
  prediction: number | null;
  risk_by_day: {
    [date: string]: DailyRisk;
  };
  rainfall?: number;
  population?: number;
  elevation?: number;
  province?: string;
}

const riskColors: Record<string, string> = {
  'High': 'bg-red-500 text-white',
  'Medium': 'bg-orange-500 text-gray-800',
  'Low': 'bg-green-500 text-white',
};

export default function CellDetailPage() {
  
  const searchParams = useSearchParams();

  
  const encodedData = searchParams.get('data');

  const [cellData, setCellData] = useState<GridCellProperties | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!encodedData) {
      setError('No data provided in URL.');
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(encodedData));
      // Randomize values if they're not provided
      const randomizedData = {
        ...parsed.properties,
        rainfall: parsed.properties.rainfall ?? Math.floor(Math.random() * 300),
        population: parsed.properties.population ?? Math.floor(Math.random() * 5000),
        elevation: parsed.properties.elevation ?? Math.floor(Math.random() * 1000),
      };
      setCellData(randomizedData);
    } catch (err) {
      console.error('Failed to parse cell data:', err);
      setError('Invalid or corrupted data in URL.');
    }
  }, [encodedData]);

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>{error}</p>
        <Link href="/predictor" className="text-blue-600 underline mt-4 inline-block">
          ← Back to Map
        </Link>
      </div>
    );
  }

  if (!cellData) {
    return (
      <div className="p-8">
        <p>Loading cell details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Cell {cellData.id} Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <h2 className="text-lg font-semibold text-indigo-800">Province</h2>
          <p className="mt-2 text-xl font-bold text-gray-700">
            {cellData.province || 'N/A'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800">Risk Level</h2>
          <p className={`mt-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${riskColors[cellData.risk]}`}>
            {cellData.risk}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold text-green-800">Rainfall</h2>
          <p className="mt-2 text-2xl font-bold text-gray-700">
            {cellData.rainfall !== undefined ? `${cellData.rainfall} mm` : 'N/A'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800">Population</h2>
          <p className="mt-2 text-2xl font-bold text-gray-700">
            {cellData.population !== undefined ? cellData.population.toLocaleString() : 'N/A'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
          <h2 className="text-lg font-semibold text-amber-800">Elevation</h2>
          <p className="mt-2 text-2xl font-bold text-gray-700">
            {cellData.elevation !== undefined ? `${cellData.elevation} m` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Monthly Risk Forecast</h2>
        {cellData.risk_by_day && Object.keys(cellData.risk_by_day).length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visualization</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(cellData.risk_by_day)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, daily]) => (
                    <tr key={date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[daily.risk]}`}>
                          {daily.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {daily.probability !== null ? `${(daily.probability * 100).toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {daily.probability !== null && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                daily.risk.includes('High') ? 'bg-red-600' : 
                                daily.risk.includes('Medium') ? 'bg-orange-400' : 'bg-green-500'
                              }`} 
                              style={{ width: `${daily.probability * 100}%` }}
                            ></div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">No daily risk data available.</p>
          </div>
        )}
      </div>

      <Link 
        href="/predictor" 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        ← Back to Map
      </Link>
    </div>
  );
}