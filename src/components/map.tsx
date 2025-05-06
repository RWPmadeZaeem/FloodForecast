"use client"

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import { FeatureCollection, Feature, Polygon } from 'geojson';
import { LeafletMouseEvent } from 'leaflet';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import Legend from './legend';

// Define TypeScript interfaces
interface GridCellProperties {
  id: string;
  risk: string;
  prediction: number | null;
  rainfall?: number;
  population?: number;
  elevation?: number;
}

interface ProvinceProperties {
  name: string;
  [key: string]: unknown;
}

type GridFeature = Feature<Polygon, GridCellProperties>;
type ProvinceFeature = Feature<any, ProvinceProperties>;
type GridFeatureCollection = FeatureCollection<Polygon, GridCellProperties>;
type ProvinceFeatureCollection = FeatureCollection<any, ProvinceProperties>;

// Pakistan's approximate bounds
const PAKISTAN_BOUNDS: [[number, number], [number, number]] = [
  [23.5, 60.5], // Southwest corner: latitude, longitude
  [37.0, 77.5]  // Northeast corner: latitude, longitude
];

// Component to fit map to bounds
const FitBoundsToData: React.FC<{
  provincesData: ProvinceFeatureCollection | null;
}> = ({ provincesData }) => {
  const map = useMap();
  
  useEffect(() => {
    if (provincesData) {
      try {
        // Try to fit to GeoJSON bounds
        const geoJsonLayer = L.geoJSON(provincesData);
        const bounds = geoJsonLayer.getBounds();
        map.fitBounds(bounds);
      } catch (e) {
        // Fallback to Pakistan bounds if something goes wrong
        map.fitBounds(PAKISTAN_BOUNDS);
      }
    } else {
      // Use default Pakistan bounds if no data available
      map.fitBounds(PAKISTAN_BOUNDS);
    }
  }, [map, provincesData]);
  
  return null;
};

const Map: React.FC = () => {
  const router = useRouter();
  const [gridData, setGridData] = useState<GridFeatureCollection | null>(null);
  const [provincesData, setProvincesData] = useState<ProvinceFeatureCollection | null>(null);
  const [selectedCell, setSelectedCell] = useState<GridCellProperties | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
    
        const [gridResponse, provincesResponse] = await Promise.all([
          fetch('/pakistan-grid.geojson'),
          fetch('/geoBoundaries-PAK-ADM1.geojson'),
        ]);
    
        if (!gridResponse.ok) throw new Error('Failed to load grid data');
        if (!provincesResponse.ok) throw new Error('Failed to load province data');
    
        const gridJson = await gridResponse.json();
        const provincesJson = await provincesResponse.json();
    
        const multiFeature = turf.combine(provincesJson); // combine into one MultiPolygon
        const [first, ...rest] = multiFeature.features;

        const pakistanBoundary = rest.reduce(
          (acc, curr) => turf.union(acc, curr),
          first
        );
        // Filter grid cells that intersect with Pakistan boundary
        const filteredFeatures = gridJson.features.filter((feature: GridFeature) =>
          turf.booleanIntersects(turf.polygon(feature.geometry.coordinates), pakistanBoundary)
        );
    
        // Add random data to filtered features
        // Add random data to filtered features
        const assignRandomRisk = () => {
          const rand = Math.random();
          if (rand < 0.1) return 'High';      // 10%
          else if (rand < 0.35) return 'Moderate'; // 25%
          else return 'Low';                  // 65%
        };
        const enhancedGridData: GridFeatureCollection = {
          type: 'FeatureCollection',
          features: filteredFeatures.map((feature: GridFeature) => ({
            ...feature,
            properties: {
              ...feature.properties,
              risk: assignRandomRisk(),
              rainfall: Math.round(Math.random() * 100),
              population: Math.round(Math.random() * 50000),
              elevation: Math.round(Math.random() * 2000),
            }
          }))
        };
        

    
        setGridData(enhancedGridData);
        setProvincesData(provincesJson);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError((error as Error).message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Style functions for GeoJSON layers
  const provinceStyle = {
    color: '#E97451', // Blue border for provinces
    weight: 2,
    opacity: 0.7,
    fillOpacity: 0.02,
    fillColor: '#60a5fa',
    dashArray: '3, 5'
  };
  
  const getGridCellStyle = (feature: GridFeature) => {
    const risk = feature.properties?.risk;
    const isHovered = hoveredCellId === feature.properties.id;
    const isSelected = selectedCell?.id === feature.properties.id;
    
    // Default style
    const baseStyle = {
      weight: isHovered || isSelected ? 2 : 0.5,
      opacity: isHovered || isSelected ? 1 : 0.7,
      color: isHovered || isSelected ? '#2563eb' : '#9ca3af', // Blue border when hovered/selected
      fillOpacity: isHovered ? 0.75 : 0.65
    };

    // Risk-based colors with improved palette
    if (risk) {
      if (risk === 'High') {
        return {
          ...baseStyle,
          fillColor: '#dc2626', // Deeper red
          fillOpacity: isHovered ? 0.85 : 0.7
        };
      } else if (risk === 'Moderate') {
        return {
          ...baseStyle,
          fillColor: '#ea580c', // Deeper orange
          fillOpacity: isHovered ? 0.8 : 0.65
        };
      } else if (risk === 'Low') {
        return {
          ...baseStyle,
          fillColor: '#16a34a', // Deeper green
          fillOpacity: isHovered ? 0.75 : 0.6
        };
      }
    }
    
    // Default for unknown risk
    return {
      ...baseStyle,
      fillColor: '#94a3b8', // Slate gray
      fillOpacity: isHovered ? 0.5 : 0.2
    };
  };
  
  const onEachGridCell = (feature: GridFeature, layer: any) => {
    const tooltipContent = `
      <div class="custom-tooltip">
        <div class="tooltip-header">${feature.properties.id}</div>
        <div class="tooltip-risk">
          <span class="risk-indicator ${getRiskClass(feature.properties.risk)}"></span>
          ${feature.properties.risk || 'Unknown'} Risk
        </div>
        <div class="tooltip-data">
          <div>Rainfall: ${feature.properties.rainfall}mm</div>
          <div>Population: ${feature.properties.population?.toLocaleString()}</div>
        </div>
      </div>
    `;
    
    layer.bindTooltip(tooltipContent, {
      permanent: false,
      direction: 'top',
      className: 'custom-leaflet-tooltip'
    });
    
    layer.on({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mouseover: (e: LeafletMouseEvent) => {
        setHoveredCellId(feature.properties.id);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mouseout: (e: LeafletMouseEvent) => {
        setHoveredCellId(null);
      },
      click: (e: LeafletMouseEvent) => {
        setSelectedCell(feature.properties);
        e.originalEvent?.stopPropagation();
      }
    });
  };

  const getRiskClass = (risk?: string) => {
    switch (risk) {
      case 'High': return 'risk-high';
      case 'Moderate': return 'risk-moderate';
      case 'Low': return 'risk-low';
      default: return 'risk-unknown';
    }
  };

  // Navigate to cell detail page
  const navigateToCellDetail = (cellId: string) => {
    router.push(`/cell/${cellId}`);
  };

  // Handle map click to clear selection
  const handleMapClick = () => {
    setSelectedCell(null);
  };

  // Fix for Next.js hydration issues with Leaflet
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    // Import Leaflet dynamically only on client side
    if (typeof window !== 'undefined') {
      // This is needed to fix 'L is not defined' error
      window.L = require('leaflet');
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-slate-700">Loading map...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-slate-700">Loading map data...</p>
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
              <p className="text-sm text-red-700">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] z-0 bg-slate-50">
      {/* Title & Controls Bar */}
      <div className="absolute top-20 right-6 z-[500]">
        <Legend />
      </div>

      <MapContainer 
        bounds={PAKISTAN_BOUNDS}
        maxBounds={[
          [18, 55], // Southwest corner with padding
          [42, 82]  // Northeast corner with padding
        ]}
        center={[30, 69]} 
        zoom={6}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full bg-slate-100"
        onClick={handleMapClick}
      >
        {/* Better styled tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
          bounds={PAKISTAN_BOUNDS}
          className="map-tiles"
        />
        
        {/* Outside Pakistan areas with reduced opacity */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
          opacity={1}
        />

        {/* Add custom position for zoom controls */}
        <ZoomControl position="bottomright" />
        
        {provincesData && (
          <GeoJSON 
            data={provincesData} 
            style={provinceStyle}
          />
        )}
        
        {gridData && (
          <GeoJSON 
            data={gridData} 
            style={getGridCellStyle}
            onEachFeature={onEachGridCell}
          />
        )}
        
        <FitBoundsToData provincesData={provincesData} />
      </MapContainer>
      
      {/* Improved info panel for clicked cell */}
      {selectedCell && (
        <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-xl z-[500] border border-slate-200 w-72 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-lg">Cell {selectedCell.id}</h3>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Risk level banner */}
          <div className={`px-4 py-2 ${selectedCell.risk === 'High' ? 'bg-red-600' : selectedCell.risk === 'Moderate' ? 'bg-orange-600' : 'bg-green-600'} text-white`}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.5a1 1 0 001 1h.5a1 1 0 100-2H11V5zm2 3a1 1 0 10-2 0v3a1 1 0 102 0V8zm-2-6a1 1 0 10-2 0v.5a1 1 0 001 1h.5a1 1 0 100-2H11V2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{selectedCell.risk || 'Unknown'} Risk Level</span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-xs text-slate-500 uppercase font-medium">Rainfall</div>
                <div className="text-lg font-semibold text-slate-800">{selectedCell.rainfall} mm</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-xs text-slate-500 uppercase font-medium">Elevation</div>
                <div className="text-lg font-semibold text-slate-800">{selectedCell.elevation} m</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-xs text-slate-500 uppercase font-medium">Population</div>
                <div className="text-lg font-semibold text-slate-800">{selectedCell.population?.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-xs text-slate-500 uppercase font-medium">Prediction</div>
                <div className="text-lg font-semibold text-slate-800">{selectedCell.prediction || 'N/A'}</div>
              </div>
            </div>
            
            <button 
              onClick={() => navigateToCellDetail(selectedCell.id)}
              className="mt-4 w-full py-2 bg-slate-800 text-white rounded font-medium transition-colors flex items-center justify-center"
            >
              <span>View Detailed Analysis</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Improved Legend */}
      

      {/* CSS for custom tooltips and map styling */}
      <style jsx global>{`
        .custom-leaflet-tooltip {
          background: rgba(15, 23, 42, 0.85);
          border: none;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 0;
          font-family: 'Inter', system-ui, sans-serif;
          color: white;
          max-width: 220px;
        }
        
        .custom-leaflet-tooltip:before {
          display: none;
        }
        
        .custom-tooltip {
          padding: 8px 12px;
        }
        
        .tooltip-header {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
          color: white;
        }
        
        .tooltip-risk {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          font-size: 12px;
        }
        
        .risk-indicator {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 6px;
        }
        
        .risk-high { background-color: #dc2626; }
        .risk-moderate { background-color: #ea580c; }
        .risk-low { background-color: #16a34a; }
        .risk-unknown { background-color: #94a3b8; }
        
        .tooltip-data {
          font-size: 11px;
          color: #e2e8f0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2px;
        }
        
        .map-tiles {
          filter: brightness(1.02) contrast(1.05) saturate(0.9);
        }
      `}</style>
    </div>
  );
};

export default Map;