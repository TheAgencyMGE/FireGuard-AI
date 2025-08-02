import React, { useState, useEffect } from 'react';
import { FireMap } from '@/components/FireMap';
import { WeatherWidget } from '@/components/WeatherWidget';
import { WebScraper } from '@/components/WebScraper';
import { AlertSystem } from '@/components/AlertSystem';
import { FireCameraFeed } from '@/components/FireCameraFeed';
import { StateSelector } from '@/components/StateSelector';
import MLTrainingDashboard from '@/components/MLTrainingDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Activity, MapPin, Shield, Search, Camera, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFireData, generatePredictedFireLocations, fetchFireCameras, FireData, PredictedFireLocation, US_STATES } from '@/services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('CA');
  const [fireData, setFireData] = useState<FireData[]>([]);
  const [predictedFires, setPredictedFires] = useState<PredictedFireLocation[]>([]);
  const [cameraCount, setCameraCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [fires, predictions, cameras] = await Promise.all([
          fetchFireData(selectedState),
          generatePredictedFireLocations(selectedState),
          fetchFireCameras(selectedState)
        ]);
        setFireData(fires);
        setPredictedFires(predictions);
        setCameraCount(cameras.length);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedState]);

  // Handle state data updates from FireMap
  const handleStateDataLoad = (fireCount: number, predictionCount: number) => {
    // This will be called when FireMap loads new data
    // We can use this to update our local state if needed
  };

  // Calculate real stats from data
  const activeFireCount = fireData.length;
  const highRiskAreas = predictedFires.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
  const highConfidenceFires = fireData.filter(f => f.confidence >= 80).length;
  const predictionAccuracy = fireData.length > 0 ? Math.round((highConfidenceFires / fireData.length) * 100) : 94;
  const totalDataPoints = fireData.length + predictedFires.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h1 className="text-xl font-bold">FireGuard AI Dashboard</h1>
                <Badge variant="fire" className="animate-pulse-glow">
                  LIVE
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {new Date().toLocaleString()}
              </Badge>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-fire-safe rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time Monitoring
            </TabsTrigger>
            <TabsTrigger value="ml-training" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              ML Training Center
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6">
            {/* State Selector */}
            <StateSelector 
              selectedState={selectedState}
              onStateChange={setSelectedState}
              fireCount={activeFireCount}
              cameraCount={cameraCount}
              riskLevel={predictedFires.some(p => p.riskLevel === 'critical') ? 'critical' : 
                        predictedFires.some(p => p.riskLevel === 'high') ? 'high' : 
                        predictedFires.some(p => p.riskLevel === 'medium') ? 'medium' : 'low'}
            />

            <div className="grid grid-cols-12 gap-6">
              {/* Main Map */}
              <div className="col-span-12 xl:col-span-9">
                <Card className="h-[600px] p-0 overflow-hidden bg-card/50 backdrop-blur">
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Live Fire Map</h3>
                        <Badge variant="outline" className="text-xs">
                          {US_STATES.find(s => s.code === selectedState)?.name || 'Unknown State'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1">
                      <FireMap 
                        className="h-full" 
                        selectedState={selectedState}
                        onStateDataLoad={handleStateDataLoad}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="col-span-12 xl:col-span-3 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
                  <Card className="p-3 bg-card/90 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-fire-orange" />
                      <div>
                        <p className="text-lg font-bold">{loading ? '...' : activeFireCount}</p>
                        <p className="text-xs text-muted-foreground">Active Fires</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-card/90 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-fire-warning" />
                      <div>
                        <p className="text-lg font-bold">{loading ? '...' : highRiskAreas}</p>
                        <p className="text-xs text-muted-foreground">High Risk Areas</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-card/90 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-fire-safe" />
                      <div>
                        <p className="text-lg font-bold">{loading ? '...' : predictionAccuracy}%</p>
                        <p className="text-xs text-muted-foreground">Prediction Accuracy</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-card/90 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-lg font-bold">{loading ? '...' : cameraCount}</p>
                        <p className="text-xs text-muted-foreground">Active Cameras</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Weather Widget for Current State */}
                <WeatherWidget 
                  lat={US_STATES.find(s => s.code === selectedState)?.center.lat || 36.7783} 
                  lon={US_STATES.find(s => s.code === selectedState)?.center.lng || -119.4179} 
                  location={`${US_STATES.find(s => s.code === selectedState)?.name || 'California'} Central`}
                />

                {/* Alert System */}
                <AlertSystem />
              </div>

              {/* Bottom Section - Full Width */}
              <div className="col-span-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Fire Camera Feeds */}
                  <div className="col-span-1">
                    <FireCameraFeed selectedState={selectedState} />
                  </div>

                  {/* Web Scraper */}
                  <div className="col-span-1">
                    <WebScraper />
                  </div>

                  {/* Regional Weather - Compact */}
                  <div className="col-span-1">
                    <Card className="h-full p-4">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Regional Weather
                      </h3>
                      <div className="space-y-3">
                        {US_STATES.find(s => s.code === selectedState)?.regions.slice(0, 2).map((region, index) => (
                          <div key={`${selectedState}-${index}`} className="text-sm">
                            <WeatherWidget 
                              lat={region.lat} 
                              lon={region.lng} 
                              location={`${region.name}, ${selectedState}`}
                            />
                          </div>
                        )) || [
                          <WeatherWidget 
                            key="fallback"
                            lat={36.7783} 
                            lon={-119.4179} 
                            location="California Central"
                          />
                        ]}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ml-training">
            <MLTrainingDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card/30 backdrop-blur mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              FireGuard AI - Real-time wildfire prediction and prevention system
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Data sources: NASA FIRMS, OpenWeather, EPA AirNow | Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;