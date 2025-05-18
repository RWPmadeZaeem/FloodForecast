/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import { FeatureCollection, Feature, Polygon } from 'geojson';
import { LeafletMouseEvent } from 'leaflet';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import Legend from './legend';

// Define TypeScript interfaces for our data structure
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
  province?: string; // New property for province name
}

interface ProvinceProperties {
  name: string;
  [key: string]: unknown;
}

type GridFeature = Feature<Polygon, GridCellProperties>;
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
  const [selectedCell, setSelectedCell] = useState<GridFeature | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);
  
  // State for time-based visualization
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dateIndex, setDateIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Enhanced grid data with province information
  const [enhancedGridData, setEnhancedGridData] = useState<GridFeatureCollection | null>(null);

  // Load data with performance improvements
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // Use Promise.all for parallel fetching
        const [gridResponse, provincesResponse] = await Promise.all([
          fetch('/pakistan-grid-with-predictions.geojson'),
          fetch('/geoBoundaries-PAK-ADM1.geojson'),
        ]);
  
        if (!gridResponse.ok) throw new Error('Failed to load grid data');
        if (!provincesResponse.ok) throw new Error('Failed to load province data');
  
        const gridJson = await gridResponse.json();
        const provincesJson = await provincesResponse.json();
  
        // Store the raw provinces data for rendering the province boundaries
        setProvincesData(provincesJson);
  
        // Combine all province geometries into one unified Pakistan boundary for clipping
        const multiFeature = turf.combine(provincesJson);
        const [first, ...rest] = multiFeature.features;
        const pakistanBoundary = rest.reduce(
          (acc, curr) => turf.union(acc, curr),
          first
        );
  
        // Filter grid cells that intersect with Pakistan boundary for performance
        const filteredFeatures = gridJson.features.filter((feature: GridFeature) =>
          turf.booleanIntersects(turf.polygon(feature.geometry.coordinates), pakistanBoundary)
        );
  
        // Create a cleaned grid collection with only relevant features
        const clippedGridJson: GridFeatureCollection = {
          ...gridJson,
          features: filteredFeatures,
        };
  
        // Extract available dates
        if (clippedGridJson.features.length > 0) {
          const firstCellWithDates = clippedGridJson.features.find(
            (feature) => feature.properties?.risk_by_day && Object.keys(feature.properties.risk_by_day).length > 0
          );
          
          if (firstCellWithDates && firstCellWithDates.properties.risk_by_day) {
            const dates = Object.keys(firstCellWithDates.properties.risk_by_day).sort();
            setAvailableDates(dates);
            if (dates.length > 0) {
              setSelectedDate(dates[0]);
            }
          }
        }
        
        // Set raw grid data first to get the UI rendering quickly
        setGridData(clippedGridJson);
        
        // Process the grid data to add province information (does not block UI rendering)
        setTimeout(() => {
          processGridDataWithProvinces(clippedGridJson, provincesJson);
        }, 100);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError((error as Error).message);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Process grid data to add province information
  const processGridDataWithProvinces = (
    gridData: GridFeatureCollection, 
    provincesData: ProvinceFeatureCollection
  ) => {
    // Create a worker or use chunked processing to avoid blocking the main thread
    const enhancedFeatures = gridData.features.map((feature: GridFeature) => {
      // Create a point from the center of the grid cell
      const center = turf.center(feature);
      
      // Find which province this point falls within
      let province = 'Unknown';
      for (const provinceFeature of provincesData.features) {
        if (turf.booleanPointInPolygon(center, provinceFeature)) {
          province = provinceFeature.properties.name;
          break;
        }
      }
      
      // Clone feature and add province information
      const enhancedFeature = {...feature};
      enhancedFeature.properties = {...feature.properties, province};
      
      // Clean up risk levels - ensure only Low, Medium, High exist
      // (convert "Very High" to "High" if present)
      if (enhancedFeature.properties.risk === 'Very High') {
        enhancedFeature.properties.risk = 'High';
      }
      
      // Do the same for daily risks
      if (enhancedFeature.properties.risk_by_day) {
        Object.keys(enhancedFeature.properties.risk_by_day).forEach(date => {
          if (enhancedFeature.properties.risk_by_day[date].risk === 'Very High') {
            enhancedFeature.properties.risk_by_day[date].risk = 'High';
          }
        });
      }
      
      return enhancedFeature;
    });
    
    const enhancedGridData: GridFeatureCollection = {
      ...gridData,
      features: enhancedFeatures
    };
    
    setEnhancedGridData(enhancedGridData);
  };

  // Animation loop for time-based visualization
  useEffect(() => {
    let animationTimer: NodeJS.Timeout | null = null;
    
    if (isPlaying && availableDates.length > 0) {
      animationTimer = setInterval(() => {
        setDateIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % availableDates.length;
          setSelectedDate(availableDates[nextIndex]);
          return nextIndex;
        });
      }, 1000); // Change date every 1 second
    }
    
    return () => {
      if (animationTimer) {
        clearInterval(animationTimer);
      }
    };
  }, [isPlaying, availableDates]);

  // Update selected date when date index changes
  useEffect(() => {
    if (availableDates.length > 0) {
      setSelectedDate(availableDates[dateIndex]);
    }
  }, [dateIndex, availableDates]);
  
  // Style functions for GeoJSON layers
  const provinceStyle = {
    color: '#E97451',
    weight: 2,
    opacity: 0.7,
    fillOpacity: 0.02,
    fillColor: '#60a5fa',
    dashArray: '3, 5'
  };
  
  // Get color based on risk level - using correct color mapping
  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'High':
        return '#dc2626'; // Red for High risk
      case 'Medium':
        return '#ea580c'; // Orange for Medium risk
      case 'Low': 
        return '#16a34a'; // Green for Low risk
      default:
        return '#94a3b8'; // Gray for unknown risk
    }
  };
  
  // Grid cell style function with corrected color mappings
  const getGridCellStyle = (feature: GridFeature) => {
    // If we have a selected date, use that day's risk level
    let risk = feature.properties?.risk; // Default to overall risk
    
    if (selectedDate && feature.properties?.risk_by_day && feature.properties.risk_by_day[selectedDate]) {
      risk = feature.properties.risk_by_day[selectedDate].risk;
    }
    
    // Ensure risk is only High, Medium, or Low
    if (risk === 'Very High') risk = 'High';
    
    const isHovered = hoveredCellId === feature.properties.id;
    const isSelected = selectedCell?.properties.id === feature.properties.id;
    
    // Default style
    const baseStyle = {
      weight: isHovered || isSelected ? 2 : 0.5,
      opacity: isHovered || isSelected ? 1 : 0.7,
      color: isHovered || isSelected ? '#2563eb' : '#9ca3af',
      fillOpacity: isHovered ? 0.75 : 0.65
    };
  
    return {
      ...baseStyle,
      fillColor: getRiskColor(risk),
      fillOpacity: isHovered ? 0.9 : 0.7
    };
  };
  
  const onEachGridCell = (feature: GridFeature, layer: any) => {
  layer.on({
    mouseover: (e: LeafletMouseEvent) => {
      const latlng = e.latlng;
      setHoveredCellId(feature.properties.id);

      // Get risk data
      let risk = feature.properties.risk;
      let probability = feature.properties.prediction;
      
      if (selectedDate && feature.properties.risk_by_day?.[selectedDate]) {
        risk = feature.properties.risk_by_day[selectedDate].risk;
        probability = feature.properties.risk_by_day[selectedDate].probability;
      }

      // PROVINCE DETECTION - SPECIFIC TO geoBoundaries-PAK-ADM1
      let provinceName = 'Pakistan';
      if (provincesData) {
        const point = turf.point([latlng.lng, latlng.lat]);
        
        for (const province of provincesData.features) {
          try {
            // geoBoundaries files use 'shapeName' for province names
            if (turf.booleanPointInPolygon(point, province)) {
              provinceName = province.properties?.shapeName || 
                            province.properties?.shapeName_1 || 
                            'Pakistan';
              break;
            }
          } catch (error) {
            console.error('Province detection error:', error);
          }
        }
      }

      // Tooltip with province info
      const tooltipContent = `
        <div class="custom-tooltip">
          <div class="tooltip-header">${feature.properties.id}</div>
          <div class="tooltip-province">${provinceName}</div>
          ${selectedDate ? `<div class="tooltip-date">${formatDate(selectedDate)}</div>` : ''}
          <div class="tooltip-risk">
            <span class="risk-indicator ${getRiskClass(risk)}"></span>
            ${risk || 'Unknown'} Risk
          </div>
          ${probability !== null ? `
            <div class="tooltip-probability">Probability: ${(probability * 100).toFixed(1)}%</div>
          ` : ''}
        </div>
      `;

      layer.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        className: 'custom-leaflet-tooltip'
      }).openTooltip();

      // Highlight the cell
      layer.setStyle({
        weight: 2,
        opacity: 1,
        color: '#2563eb',
        fillOpacity: 0.9
      });
      layer.bringToFront();
    },
    mouseout: () => {
      setHoveredCellId(null);
      layer.closeTooltip();
      layer.setStyle(getGridCellStyle(feature));
    },
    click: (e: LeafletMouseEvent) => {
      // Find the province for this cell
      let provinceName = 'Pakistan';
      if (provincesData) {
        // Calculate center of the feature for consistent province detection
        const center = turf.center(feature);
        
        for (const province of provincesData.features) {
          try {
            if (turf.booleanPointInPolygon(center, province)) {
              provinceName = province.properties?.shapeName || 
                             province.properties?.shapeName_1 || 
                             'Pakistan';
              break;
            }
          } catch (error) {
            console.error('Province detection error:', error);
          }
        }
      }
      
      // Create a copy of the feature with province information
      const enrichedFeature = {
        ...feature,
        properties: {
          ...feature.properties,
          province: provinceName
        }
      };
      
      // Set the enhanced feature as selected cell
      setSelectedCell(enrichedFeature);
      e.originalEvent?.stopPropagation();
    }
  });
};
  const getRiskClass = (risk?: string) => {
    // Normalize risk levels
    if (risk === 'Very High') risk = 'High';
    
    switch (risk) {
      case 'High': return 'risk-high';
      case 'Medium': return 'risk-medium';
      case 'Low': return 'risk-low';
      default: return 'risk-unknown';
    }
  };

  // Navigate to cell detail page with the selected cell data
  // In your map component's navigateToCellDetail function:
const navigateToCellDetail = () => {
  if (!selectedCell) return;
  
  // Get the province name dynamically (same method as in onEachGridCell)
  let provinceName = 'Pakistan';
  if (selectedCell && provincesData) {
    const center = turf.center(selectedCell);
    for (const province of provincesData.features) {
      if (turf.booleanPointInPolygon(center, province)) {
        provinceName = province.properties?.shapeName || 'Pakistan';
        break;
      }
    }
  }

  const cellData = {
    id: selectedCell.properties.id,
    properties: {
      ...selectedCell.properties,
      province: provinceName, // Add the province name here
    },
    geometry: selectedCell.geometry,
    selectedDate: selectedDate || null
  };
  
  const encodedData = encodeURIComponent(JSON.stringify(cellData));
  router.push(`/cell/${selectedCell.properties.id}?data=${encodedData}`);
};
  // Handle map click to clear selection
  const handleMapClick = () => {
    setSelectedCell(null);
  };

  // Handle date selector change
  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    // Update date index to match
    const newIndex = availableDates.indexOf(newDate);
    if (newIndex !== -1) {
      setDateIndex(newIndex);
    }
  };

  // Handle play/pause for time animation
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Use enhanced grid data if available, otherwise use the original grid data
  const displayGridData = useMemo(() => {
    return enhancedGridData || gridData;
  }, [enhancedGridData, gridData]);

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
      <div className="absolute top-4 left-4 right-4 z-[500] flex items-center justify-between bg-white shadow-md rounded-lg p-3">
        <h2 className="text-xl font-bold text-slate-800">Pakistan Flood Risk Forecast</h2>
        
        <div className="flex items-center space-x-4 z-[500]">
          {availableDates.length > 0 && (
            <>
              {/* Date text indicator */}
              <div className="text-slate-700 font-medium min-w-40">
                {selectedDate ? formatDate(selectedDate) : 'Select date'}
              </div>
            
              {/* Play/Pause Button */}
              <button 
                onClick={togglePlay} 
                className="bg-slate-700 hover:bg-slate-800 text-white rounded-full p-2 transition-colors"
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              {/* Date Slider */}
              <input 
                type="range" 
                min={0} 
                max={availableDates.length - 1} 
                value={dateIndex} 
                onChange={(e) => {
                  const newIndex = parseInt(e.target.value);
                  setDateIndex(newIndex);
                  setSelectedDate(availableDates[newIndex]);
                }}
                className="w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              
              {/* Date Selector */}
              <select 
                value={selectedDate} 
                onChange={handleDateChange}
                className="bg-white border border-slate-300 text-slate-700 rounded px-2 py-1"
              >
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

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
        preferCanvas={true} // Use Canvas renderer for better performance
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
        
        {displayGridData && (
          <GeoJSON 
            data={displayGridData} 
            style={getGridCellStyle}
            onEachFeature={onEachGridCell}
            key={selectedDate} // Force re-render when date changes
          />
        )}
        
        <FitBoundsToData provincesData={provincesData} />
      </MapContainer>
      
      {/* Improved info panel for clicked cell */}
      {selectedCell && (
        <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-xl z-[500] border border-slate-200 w-80 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-lg">Cell {selectedCell.properties.id}</h3>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Province information */}
          <div className="bg-slate-700 text-white px-4 py-2">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{selectedCell.properties.province || 'Unknown Province'}</span>
            </div>
          </div>
          
          {/* Risk level banner - use the day-specific risk if available */}
          {selectedDate && selectedCell.properties.risk_by_day && selectedCell.properties.risk_by_day[selectedDate] ? (
            <div className={`px-4 py-2 ${
              selectedCell.properties.risk_by_day[selectedDate].risk === 'High' ? 'bg-red-600' : 
              selectedCell.properties.risk_by_day[selectedDate].risk === 'Medium' ? 'bg-orange-600' : 
              'bg-green-600'} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.5a1 1 0 001 1h.5a1 1 0 100-2H11V5zm2 3a1 1 0 10-2 0v3a1 1 0 102 0V8zm-2-6a1 1 0 10-2 0v.5a1 1 0 001 1h.5a1 1 0 100-2H11V2z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">
                    {selectedCell.properties.risk_by_day[selectedDate].risk || 'Unknown'} Risk Level
                  </span>
                </div>
                <div className="text-sm">
                  {selectedCell.properties.risk_by_day[selectedDate].probability !== null ? 
                    `${(selectedCell.properties.risk_by_day[selectedDate].probability! * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <div className={`px-4 py-2 ${
              selectedCell.properties.risk === 'High' ? 'bg-red-600' :
              selectedCell.properties.risk === 'Medium' ? 'bg-orange-600' : 
              'bg-green-600'} text-white`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.5a1 1 0 001 1h.5a1 1 0 100-2H11V5zm2 3a1 1 0 10-2 0v3a1 1 0 102 0V8zm-2-6a1 1 0 10-2 0v.5a1 1 0 001 1h.5a1 1 0 100-2H11V2z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{selectedCell.properties.risk || 'Unknown'} Risk Level</span>
              </div>
            </div>
          )}
          
          <div className="p-4">
            {/* Basic cell info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {selectedCell.properties.rainfall !== undefined && (
                <div className="bg-slate-50 p-3 rounded">
                  <div className="text-xs text-slate-500 uppercase font-medium">Rainfall</div>
                  <div className="text-lg font-semibold text-slate-800">{selectedCell.properties.rainfall} mm</div>
                </div>
                
              )}
              {selectedCell.properties.elevation !== undefined && (
                <div className="bg-slate-50 p-3 rounded">
                  <div className="text-xs text-slate-500 uppercase font-medium">Elevation</div>
                  <div className="text-lg font-semibold text-slate-800">{selectedCell.properties.elevation} m</div>
                </div>
              )}
              {selectedCell.properties.population !== undefined && (
                <div className="bg-slate-50 p-3 rounded">
                  <div className="text-xs text-slate-500 uppercase font-medium">Population</div>
                  <div className="text-lg font-semibold text-slate-800">{selectedCell.properties.population?.toLocaleString()}</div>
                </div>
              )}
            </div>
            
            {/* Forecast risk trend */}
            {selectedCell.properties.risk_by_day && Object.keys(selectedCell.properties.risk_by_day).length > 0 && (
              <div className="mt-2">
                <h4 className="text-md font-semibold text-slate-700 mb-2">Risk Forecast</h4>
                
                <div className="text-xs text-slate-500 uppercase font-medium mb-1">Next 7 days</div>
                <div className="flex space-x-1 mb-4">
                {Object.keys(selectedCell.properties.risk_by_day)
  .sort()
  .slice(0, 7)
  .map((date) => {
    const risk = selectedCell.properties.risk_by_day[date].risk;
    // Swap Medium and Low risk colors
   
    const colorClass = 
      risk === 'High' ? 'bg-red-600' : 
      risk === 'Medium' ? 'bg-orange-500' : // Now green (was Low)
      risk === 'Low' ? 'bg-green-500' :  // Now orange (was Medium)
      'bg-gray-300';
    
    return (
      <div 
        key={date} 
        className={`flex-1 h-6 ${colorClass} rounded hover:opacity-90 cursor-pointer`}
        title={`${formatDate(date)}: ${risk} Risk`}
        onClick={() => setSelectedDate(date)}
      />
    );
  })}
                </div>
              </div>
            )}
            
            <button 
              onClick={navigateToCellDetail}
              className="mt-2 w-full py-2 bg-slate-800 text-white rounded font-medium transition-colors flex items-center justify-center"
            >
              <span>View Detailed Analysis</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
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
          margin-bottom: 2px;
          color: white;
        }
        
        .tooltip-date {
          font-size: 11px;
          color: #e2e8f0;
          margin-bottom: 4px;
        }
        
        .tooltip-risk {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          font-size: 12px;
        }
        
        .tooltip-probability {
          font-size: 11px;
          margin-bottom: 4px;
          color: #e2e8f0;
        }
        
        .risk-indicator {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 6px;
        }
        .risk-high { background: #dc2626; } /* Red for High risk */
        .risk-medium { background: #ea580c; } /* Orange for Medium risk */
        .risk-low { background: #16a34a; } /* Green for Low risk */
        .risk-unknown { background: #9ca3af; }


        .tooltip-data div {
          font-size: 11px;
          color: #f1f5f9;
          margin-bottom: 2px;
        }

        .map-tiles {
          filter: grayscale(30%) contrast(95%);
        }
      `}</style>
    </div>
  );
};

export default Map;


