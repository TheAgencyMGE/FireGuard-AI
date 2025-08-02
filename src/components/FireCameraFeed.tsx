import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Play, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { fetchFireCameras, FireCamera } from '@/services/api';

interface FireCameraFeedProps {
  className?: string;
  selectedLocation?: [number, number] | null;
  selectedState?: string;
}

export const FireCameraFeed: React.FC<FireCameraFeedProps> = ({ 
  className = '', 
  selectedLocation,
  selectedState = 'CA'
}) => {
  const [cameras, setCameras] = useState<FireCamera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<FireCamera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCameras();
  }, [selectedState]);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const cameraData = await fetchFireCameras(selectedState);
      setCameras(cameraData);
      if (cameraData.length > 0) {
        setSelectedCamera(cameraData[0]);
      }
    } catch (err) {
      setError('Failed to load camera feeds');
      console.error('Error loading cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearestCameras = () => {
    if (!selectedLocation) return cameras;
    
    return cameras
      .map(camera => ({
        ...camera,
        distance: calculateDistance(
          selectedLocation[1], 
          selectedLocation[0], 
          camera.latitude, 
          camera.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'LIVE';
      case 'inactive': return 'OFFLINE';
      case 'maintenance': return 'MAINTENANCE';
      default: return 'UNKNOWN';
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Camera className="h-12 w-12 animate-pulse text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading camera feeds...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error || cameras.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {error || 'No camera feeds available'}
            </p>
            <Button onClick={loadCameras} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const nearestCameras = getNearestCameras();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Camera Selection */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Live Fire Cameras</h3>
          <Badge variant="secondary" className="ml-auto">
            {cameras.filter(c => c.status === 'active').length} Active
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {nearestCameras.slice(0, 6).map((camera) => (
            <Button
              key={camera.id}
              variant={selectedCamera?.id === camera.id ? "default" : "outline"}
              size="sm"
              className="justify-start h-auto p-3"
              onClick={() => setSelectedCamera(camera)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(camera.status)}`} />
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium truncate text-xs">{camera.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {camera.agency} - Elevation: {camera.elevation}m
                  </p>
                  {selectedLocation && 'distance' in camera && (
                    <p className="text-xs text-muted-foreground">
                      {Math.round((camera as any).distance)} km away
                    </p>
                  )}
                </div>
                <Badge 
                  variant={camera.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {getStatusText(camera.status)}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Camera Feed Display */}
      {selectedCamera && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">{selectedCamera.name}</h4>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {selectedCamera.agency} - {selectedCamera.type} camera
              </span>
            </div>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden">
            <div className="aspect-video">
              {selectedCamera.status === 'active' ? (
                <img
                  src={selectedCamera.streamUrl}
                  alt={`Live feed from ${selectedCamera.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="#1f2937"/>
                        <text x="50" y="45" text-anchor="middle" fill="#6b7280" font-size="12">Camera</text>
                        <text x="50" y="60" text-anchor="middle" fill="#6b7280" font-size="12">Offline</text>
                      </svg>
                    `);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Camera {selectedCamera.status === 'inactive' ? 'Offline' : 'Under Maintenance'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Live indicator */}
            {selectedCamera.status === 'active' && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}

            {/* Timestamp */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded text-xs">
              <Clock className="h-3 w-3" />
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Camera Info */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Coordinates:</span>
                <p className="font-medium">
                  {selectedCamera.latitude.toFixed(4)}, {selectedCamera.longitude.toFixed(4)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium capitalize">{selectedCamera.status}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Capture Screenshot
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <MapPin className="h-4 w-4 mr-2" />
              Show on Map
            </Button>
          </div>
        </Card>
      )}

      {/* Camera Network Status */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Camera Network Status</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {cameras.filter(c => c.status === 'active').length}
            </p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {cameras.filter(c => c.status === 'inactive').length}
            </p>
            <p className="text-xs text-muted-foreground">Offline</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {cameras.filter(c => c.status === 'maintenance').length}
            </p>
            <p className="text-xs text-muted-foreground">Maintenance</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
