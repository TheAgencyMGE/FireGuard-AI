import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, ExternalLink, AlertCircle, Loader2, Globe, Flame, CloudRain, Clock } from 'lucide-react';

interface LiveDataItem {
  source: string;
  title: string;
  content: string;
  timestamp: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  location: string;
}

export const WebScraper: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [liveData, setLiveData] = useState<LiveDataItem[]>([]);
  const { toast } = useToast();

  const defaultUrls = [
    { 
      name: 'InciWeb (Wildfire Info)', 
      url: 'https://inciweb.nwcg.gov/',
      category: 'incidents',
      icon: Flame
    },
    { 
      name: 'CAL FIRE News', 
      url: 'https://www.fire.ca.gov/incidents/',
      category: 'incidents',
      icon: Flame
    },
    { 
      name: 'National Weather Service', 
      url: 'https://www.weather.gov/fire/',
      category: 'weather',
      icon: CloudRain
    },
    { 
      name: 'Watch Duty', 
      url: 'https://app.watchduty.org/',
      category: 'incidents',
      icon: Flame
    }
  ];

  useEffect(() => {
    loadLiveFireData();
    const interval = setInterval(loadLiveFireData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadLiveFireData = async () => {
    try {
      // Simulate fetching live data from multiple sources
      const mockLiveData: LiveDataItem[] = [
        {
          source: 'InciWeb',
          title: 'Active Fire Incidents',
          content: `${Math.floor(Math.random() * 25) + 15} active wildfire incidents currently being monitored across the western United States`,
          timestamp: new Date().toISOString(),
          severity: 'high',
          location: 'Western US'
        },
        {
          source: 'CAL FIRE',
          title: 'Red Flag Warning Active',
          content: 'Extreme fire weather conditions with low humidity and strong winds expected through the weekend',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'critical',
          location: 'Southern California'
        },
        {
          source: 'NOAA',
          title: 'Fire Weather Forecast',
          content: 'Dry conditions and gusty winds forecast. Fire danger remains elevated across multiple regions',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          severity: 'moderate',
          location: 'Pacific Northwest'
        },
        {
          source: 'Watch Duty',
          title: 'New Fire Detection',
          content: 'Satellite imagery shows new thermal anomaly detected in high-risk area. Ground crews dispatched',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          severity: 'high',
          location: 'Central California'
        }
      ];
      
      setLiveData(mockLiveData);
    } catch (error) {
      console.error('Error loading live data:', error);
    }
  };

  const handleScrape = async (targetUrl?: string) => {
    const scrapeUrl = targetUrl || url;
    if (!scrapeUrl) {
      toast({
        title: "Error",
        description: "Please enter a URL to scrape",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate scraping - in production this would use a real scraping service
      const mockResult = {
        success: true,
        data: {
          title: 'Wildfire Information Portal',
          content: 'Latest wildfire updates and emergency information from official sources',
          extractedData: {
            activeIncidents: Math.floor(Math.random() * 50) + 10,
            alertLevel: Math.random() > 0.5 ? 'High' : 'Moderate',
            lastUpdated: new Date().toISOString(),
            keyAlerts: [
              'Red Flag Warning in effect for multiple counties',
              'Evacuation orders issued for high-risk areas',
              'Air quality degraded due to smoke'
            ]
          }
        }
      };
      
      setScrapedData(mockResult.data);
      toast({
        title: "Success",
        description: "Website data retrieved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retrieve website data",
        variant: "destructive",
      });
      console.error('Scraping error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Fire Intelligence Feed */}
      <Card className="p-4 bg-card/90 backdrop-blur">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm">🌐 Live Fire Intelligence</h3>
          <Badge variant="secondary" className="ml-auto animate-pulse">
            LIVE
          </Badge>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {liveData.map((item, index) => (
            <div key={index} className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getSeverityColor(item.severity)}`} />
                  <span className="font-medium text-xs">{item.source}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.location}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(item.timestamp)}
                </div>
              </div>
              <h4 className={`font-semibold text-sm mb-1 ${getSeverityTextColor(item.severity)}`}>
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Manual URL Scraper */}
      <Card className="p-4 bg-card/90 backdrop-blur">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm">🔍 Fire Information Scraper</h3>
        </div>
        
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Enter URL to scrape fire information..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={() => handleScrape()} 
            disabled={loading}
            variant="default"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Access URLs */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {defaultUrls.map((site, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="justify-start h-auto p-2"
              onClick={() => handleScrape(site.url)}
              disabled={loading}
            >
              <site.icon className="h-3 w-3 mr-2" />
              <div className="text-left">
                <p className="font-medium text-xs">{site.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {site.url}
                </p>
              </div>
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          ))}
        </div>

        {/* Scraped Results */}
        {scrapedData && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Scraped Information</span>
              <Badge variant="fire" className="text-xs">
                {scrapedData.extractedData?.alertLevel || 'Data'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{scrapedData.title}</h4>
              <p className="text-xs text-muted-foreground">{scrapedData.content}</p>
              
              {scrapedData.extractedData && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-center p-2 bg-background rounded">
                    <p className="text-lg font-bold text-fire-warning">
                      {scrapedData.extractedData.activeIncidents}
                    </p>
                    <p className="text-xs text-muted-foreground">Active Incidents</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <p className="text-lg font-bold text-fire-danger">
                      {scrapedData.extractedData.alertLevel}
                    </p>
                    <p className="text-xs text-muted-foreground">Alert Level</p>
                  </div>
                </div>
              )}

              {scrapedData.extractedData?.keyAlerts && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-1">Key Alerts:</p>
                  {scrapedData.extractedData.keyAlerts.map((alert: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 bg-fire-warning rounded-full" />
                      {alert}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
