import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapboxToken, fetchFireData, fetchWeatherData, calculateFireRisk, generatePredictedFireLocations, FireData, PredictedFireLocation, US_STATES } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface FireMapProps {
  className?: string;
  selectedState?: string;
  onStateDataLoad?: (fireCount: number, predictionCount: number) => void;
}

export const FireMap: React.FC<FireMapProps> = ({ 
  className = '', 
  selectedState = 'CA',
  onStateDataLoad 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [fireData, setFireData] = useState<FireData[]>([]);
  const [predictedFires, setPredictedFires] = useState<PredictedFireLocation[]>([]);
  const [selectedFire, setSelectedFire] = useState<FireData | PredictedFireLocation | null>(null);

  // Listen for map centering messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CENTER_MAP' && map.current) {
        const { lat, lng, zoom } = event.data.payload;
        map.current.flyTo({
          center: [lng, lat],
          zoom: zoom,
          duration: 2000
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = getMapboxToken();
    if (!mapboxToken) {
      console.error('Mapbox token not found');
      setLoading(false);
      return;
    }

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    const stateData = US_STATES.find(state => state.code === selectedState);
    const mapCenter = stateData ? [stateData.center.lng, stateData.center.lat] : [-100, 40];
    const mapZoom = stateData ? stateData.zoom : 4;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe' as any,
      zoom: mapZoom,
      center: mapCenter as [number, number],
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Wait for map to load, then setup layers and load initial data
    map.current.on('load', async () => {
      if (!map.current) return;

      try {
        // Load fire data and predictions for the selected state
        const [fires, predictions] = await Promise.all([
          fetchFireData(selectedState),
          generatePredictedFireLocations(selectedState)
        ]);
        
        setFireData(fires);
        setPredictedFires(predictions);
        
        // Notify parent component of the data
        if (onStateDataLoad) {
          onStateDataLoad(fires.length, predictions.length);
        }

        // Add existing fires data source
        map.current.addSource('fires', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: fires.map(fire => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [fire.longitude, fire.latitude]
              },
              properties: {
                brightness: fire.brightness,
                confidence: fire.confidence,
                frp: fire.frp,
                satellite: fire.satellite,
                acq_date: fire.acq_date,
                acq_time: fire.acq_time,
                type: 'existing'
              }
            }))
          }
        });

        // Add predicted fires data source
        map.current.addSource('predicted-fires', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: predictions.map(prediction => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [prediction.longitude, prediction.latitude]
              },
              properties: {
                riskLevel: prediction.riskLevel,
                predictedDate: prediction.predictedDate,
                probability: prediction.probability,
                confidence: prediction.confidence,
                type: 'predicted'
              }
            }))
          }
        });

        // Add existing fire points layer
        map.current.addLayer({
          id: 'fires',
          type: 'circle',
          source: 'fires',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'brightness'],
              300, 6,
              400, 10,
              500, 14
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'brightness'],
              300, '#ffeb3b',
              350, '#ff9800',
              400, '#f44336',
              500, '#d32f2f'
            ],
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add predicted fire points layer
        map.current.addLayer({
          id: 'predicted-fires',
          type: 'circle',
          source: 'predicted-fires',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'riskLevel'],
              40, 8,
              60, 12,
              80, 16,
              100, 20
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'riskLevel'],
              40, '#ffd54f',
              60, '#ff8a65',
              80, '#e57373',
              100, '#f44336'
            ],
            'circle-opacity': 0.6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ff4444',
            'circle-stroke-opacity': 0.8
          }
        });

        // Add heat map layer
        map.current.addLayer({
          id: 'fire-heat',
          type: 'heatmap',
          source: 'fires',
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'brightness'],
              300, 0,
              500, 1
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              9, 3
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              9, 20
            ]
          }
        });

        // Click event for existing fire points
        map.current.on('click', 'fires', async (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const fire = e.features[0];
          const coordinates = (fire.geometry as any).coordinates.slice();
          const properties = fire.properties;
          
          // Get weather data and risk for this location
          const weatherData = await fetchWeatherData(coordinates[1], coordinates[0]);
          const riskData = await calculateFireRisk(coordinates[1], coordinates[0]);
          
          // Set the selected fire data
          const fireWithLocation = {
            ...properties,
            latitude: coordinates[1],
            longitude: coordinates[0]
          } as FireData;
          
          setSelectedFire(fireWithLocation);

          // Create popup
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-3 bg-card text-card-foreground rounded-lg border-l-4 border-red-500">
                <h3 class="font-bold text-sm mb-2">🔥 Active Fire</h3>
                <p class="text-xs"><strong>Brightness:</strong> ${properties.brightness}K</p>
                <p class="text-xs"><strong>Confidence:</strong> ${properties.confidence}</p>
                <p class="text-xs"><strong>Fire Power:</strong> ${properties.frp} MW</p>
                <p class="text-xs"><strong>Detected:</strong> ${properties.acq_date} ${properties.acq_time}</p>
                <p class="text-xs"><strong>Current Risk:</strong> ${riskData.riskLevel.toUpperCase()}</p>
              </div>
            `)
            .addTo(map.current!);
        });

        // Click event for predicted fire points
        map.current.on('click', 'predicted-fires', (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const prediction = e.features[0];
          const coordinates = (prediction.geometry as any).coordinates.slice();
          const properties = prediction.properties;
          
          // Create popup for predictions
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-3 bg-card text-card-foreground rounded-lg border-l-4 border-orange-500">
                <h3 class="font-bold text-sm mb-2">⚠️ Fire Risk Prediction</h3>
                <p class="text-xs"><strong>Location:</strong> ${properties.location || 'Unknown'}</p>
                <p class="text-xs"><strong>Risk Level:</strong> ${Math.round(properties.riskLevel)}%</p>
                <p class="text-xs"><strong>Confidence:</strong> ${properties.confidence}%</p>
                <p class="text-xs"><strong>Predicted Date:</strong> ${properties.predictedDate}</p>
                <p class="text-xs text-yellow-600 mt-1"><strong>⚠️ High risk conditions detected</strong></p>
              </div>
            `)
            .addTo(map.current!);
        });

        // Change cursor on hover for both layers
        ['fires', 'predicted-fires'].forEach(layerId => {
          map.current!.on('mouseenter', layerId, () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = 'pointer';
            }
          });

          map.current!.on('mouseleave', layerId, () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = '';
            }
          });
        });

      } catch (error) {
        console.error('Error loading fire data:', error);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Effect to reload data when state changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const reloadStateData = async () => {
      try {
        setLoading(true);
        
        // Center map on new state
        const stateData = US_STATES.find(state => state.code === selectedState);
        if (stateData) {
          map.current!.flyTo({
            center: [stateData.center.lng, stateData.center.lat],
            zoom: stateData.zoom,
            duration: 2000
          });
        }

        // Load new data for the selected state
        const [fires, predictions] = await Promise.all([
          fetchFireData(selectedState),
          generatePredictedFireLocations(selectedState)
        ]);
        
        setFireData(fires);
        setPredictedFires(predictions);
        
        // Notify parent component of the data
        if (onStateDataLoad) {
          onStateDataLoad(fires.length, predictions.length);
        }

        // Update map sources with new data
        const firesSource = map.current.getSource('fires') as mapboxgl.GeoJSONSource;
        if (firesSource) {
          firesSource.setData({
            type: 'FeatureCollection',
            features: fires.map(fire => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [fire.longitude, fire.latitude]
              },
              properties: {
                brightness: fire.brightness,
                confidence: fire.confidence,
                frp: fire.frp,
                satellite: fire.satellite,
                acq_date: fire.acq_date,
                acq_time: fire.acq_time,
                type: 'existing'
              }
            }))
          });
        }

        const predictedFiresSource = map.current.getSource('predicted-fires') as mapboxgl.GeoJSONSource;
        if (predictedFiresSource) {
          predictedFiresSource.setData({
            type: 'FeatureCollection',
            features: predictions.map(prediction => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [prediction.longitude, prediction.latitude]
              },
              properties: {
                riskLevel: prediction.riskLevel,
                predictedDate: prediction.predictedDate,
                probability: prediction.probability,
                confidence: prediction.confidence,
                type: 'predicted'
              }
            }))
          });
        }

      } catch (error) {
        console.error('Error reloading state data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure map has finished any ongoing transitions
    const timeoutId = setTimeout(reloadStateData, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedState]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Loading fire data...</span>
          </div>
        </div>
      )}
      
      {(fireData.length > 0 || predictedFires.length > 0) && (
        <Card className="absolute top-4 left-4 p-4 bg-card/90 backdrop-blur max-w-xs">
          <h3 className="font-bold text-sm mb-2">🔥 Fire Intelligence</h3>
          <div className="space-y-1 text-xs">
            <p><strong>Active Fires:</strong> {fireData.length}</p>
            <p><strong>High Confidence:</strong> {fireData.filter(f => f.confidence >= 80).length}</p>
            <p><strong>Predicted Risks:</strong> {predictedFires.length}</p>
            {fireData.length > 0 && (
              <p><strong>Avg Brightness:</strong> {Math.round(fireData.reduce((sum, f) => sum + f.brightness, 0) / fireData.length)}K</p>
            )}
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
              <span>Active Fires</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-orange-400 border-2 border-orange-600"></div>
              <span>High Risk Areas</span>
            </div>
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            <Badge variant="destructive" className="text-xs">Extreme</Badge>
            <Badge variant="secondary" className="text-xs bg-fire-warning">High</Badge>
            <Badge variant="secondary" className="text-xs bg-fire-yellow">Moderate</Badge>
            <Badge variant="secondary" className="text-xs bg-fire-safe">Low</Badge>
          </div>
        </Card>
      )}
    </div>
  );
};