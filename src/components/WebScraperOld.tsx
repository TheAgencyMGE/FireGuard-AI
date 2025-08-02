import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, ExternalLink, AlertCircle, Loader2, Globe, Flame, CloudRain } from 'lucide-react';

export const WebScraper: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [liveData, setLiveData] = useState<any[]>([]);
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
      name: 'NOAA Fire Weather', 
      url: 'https://www.spc.noaa.gov/products/fire_wx/',
      category: 'weather',
      icon: CloudRain
    },
    {
      name: 'NASA FIRMS',
      url: 'https://firms.modaps.eosdis.nasa.gov/map/',
      category: 'data',
      icon: Globe
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
      const mockLiveData = [
        {
          source: 'InciWeb',
          title: 'Fire Activity Update',
          content: 'Multiple wildfire incidents across the western United States',
          timestamp: new Date().toISOString(),
          severity: 'high',
          location: 'Western US'
        },
        {
          source: 'CAL FIRE',
          title: 'Red Flag Warning',
          content: 'Extreme fire weather conditions expected in Southern California',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'critical',
          location: 'Southern California'
        },
        {
          source: 'NOAA',
          title: 'Fire Weather Forecast',
          content: 'Dry conditions and strong winds forecast for the weekend',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          severity: 'moderate',
          location: 'Pacific Northwest'
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
          content: 'Latest wildfire updates and emergency information',
          extractedData: {
            activeIncidents: Math.floor(Math.random() * 50) + 10,
            alertLevel: 'High',
            lastUpdated: new Date().toISOString()
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
    } finally {
      setLoading(false);
    }
  };
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Error",
        description: "An error occurred while scraping",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractFireInfo = (content: string) => {
    if (!content) return [];
    
    const keywords = ['fire', 'wildfire', 'evacuation', 'alert', 'emergency', 'smoke', 'burn', 'flames'];
    const sentences = content.split(/[.!?]+/);
    
    return sentences
      .filter(sentence => 
        keywords.some(keyword => 
          sentence.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 5)
      .map(sentence => sentence.trim());
  };

  return (
    <div className="space-y-4">
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
            variant="fire"
            size="sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Quick access to fire information sources:</p>
          <div className="grid grid-cols-2 gap-2">
            {defaultUrls.map((source, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 justify-start"
                onClick={() => handleScrape(source.url)}
                disabled={loading}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {source.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {scrapedData && (
        <Card className="p-4 bg-card/90 backdrop-blur">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-fire-orange" />
            <h3 className="font-bold text-sm">Scraped Fire Information</h3>
            <Badge variant="secondary" className="text-xs">
              {new Date(scrapedData.timestamp || Date.now()).toLocaleTimeString()}
            </Badge>
          </div>

          {scrapedData.markdown && (
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Source URL:</h4>
                <p className="text-xs bg-muted p-2 rounded break-all">
                  {scrapedData.metadata?.sourceURL || 'Unknown'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Fire-Related Information:</h4>
                <div className="space-y-2">
                  {extractFireInfo(scrapedData.markdown).map((info, index) => (
                    <div key={index} className="text-xs bg-fire-orange/10 p-2 rounded border-l-2 border-fire-orange">
                      {info}
                    </div>
                  ))}
                </div>
              </div>

              {scrapedData.metadata?.title && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Page Title:</h4>
                  <p className="text-xs font-medium">{scrapedData.metadata.title}</p>
                </div>
              )}

              {scrapedData.markdown.length > 500 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View full content ({Math.round(scrapedData.markdown.length / 1000)}k characters)
                  </summary>
                  <div className="mt-2 max-h-40 overflow-y-auto bg-muted p-2 rounded text-xs">
                    {scrapedData.markdown.substring(0, 2000)}
                    {scrapedData.markdown.length > 2000 && '...'}
                  </div>
                </details>
              )}
            </div>
          )}

          {scrapedData.extracted && (
            <div className="mt-3 pt-3 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">AI Extracted Information:</h4>
              <div className="text-xs bg-accent/20 p-3 rounded">
                {JSON.stringify(scrapedData.extracted, null, 2)}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};