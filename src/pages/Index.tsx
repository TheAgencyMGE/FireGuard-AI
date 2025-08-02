import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  MapPin, 
  Brain, 
  Satellite, 
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Target,
  Zap,
  Globe,
  BarChart3
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Prediction",
      description: "Advanced machine learning models analyze multiple data sources to predict fire risks 24-72 hours in advance."
    },
    {
      icon: <Satellite className="h-6 w-6" />,
      title: "Real-time Satellite Data",
      description: "Live satellite feeds from NASA FIRMS, MODIS, and VIIRS provide instant fire detection and monitoring."
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Multi-factor Analysis",
      description: "Combines weather patterns, vegetation moisture, human activity, and historical data for accurate predictions."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Prevention Focus",
      description: "Identifies ignition conditions before fires start, enabling proactive prevention measures."
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Smart Alert System",
      description: "Reduces false positives by 50% while providing early warnings to emergency services."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Coverage",
      description: "Monitors fire-prone regions worldwide with 1km resolution and continuous updates."
    }
  ];

  const stats = [
    { icon: <Target className="h-5 w-5" />, value: "94%", label: "Prediction Accuracy" },
    { icon: <Zap className="h-5 w-5" />, value: "72hr", label: "Advance Warning" },
    { icon: <BarChart3 className="h-5 w-5" />, value: "50%", label: "Fewer False Alarms" },
    { icon: <CheckCircle className="h-5 w-5" />, value: "24/7", label: "Monitoring" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-gradient-to-b from-fire-orange/20 via-transparent to-background"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-6xl animate-flicker">🔥</span>
              <Badge variant="fire" className="animate-pulse-glow">
                AI POWERED
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-fire-orange to-fire-yellow bg-clip-text text-transparent">
              FireGuard AI
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Next-Generation Wildfire Prediction & Prevention System
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Harness the power of artificial intelligence to predict wildfires before they ignite. 
              Our advanced system analyzes satellite data, weather patterns, and environmental factors 
              to provide 72-hour advance warnings with 94% accuracy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="text-lg px-8 py-6 h-auto"
              >
                Launch Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-card/30 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center bg-card/50 backdrop-blur hover:bg-card/70 transition-all duration-300">
                <div className="flex justify-center mb-3 text-fire-orange">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Revolutionary Fire Prevention Technology</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI system goes beyond fire detection to prevent disasters before they happen. 
              By analyzing complex environmental patterns, we provide unprecedented early warning capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur group hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-fire-orange/20 text-fire-orange group-hover:bg-fire-orange group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-20 bg-card/30 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Advanced Data Integration</h2>
              <p className="text-lg text-muted-foreground mb-6">
                FireGuard AI integrates multiple real-time data sources to create the most comprehensive 
                fire risk assessment system available.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-fire-safe" />
                  <span>NASA FIRMS & MODIS satellite data</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-fire-safe" />
                  <span>OpenWeather real-time meteorology</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-fire-safe" />
                  <span>EPA air quality monitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-fire-safe" />
                  <span>Vegetation moisture analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-fire-safe" />
                  <span>Historical fire pattern learning</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-fire-orange/20 to-fire-yellow/20 border-fire-orange/50">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse-glow">🛰️</div>
                  <h3 className="text-2xl font-bold mb-2">Real-Time Processing</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI processes over 8,000 data points every hour to maintain 
                    the most accurate fire risk predictions possible.
                  </p>
                  <Badge variant="fire" className="animate-pulse">
                    Live Data Stream
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Prevent the Next Wildfire?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join emergency services and fire departments worldwide who trust FireGuard AI 
              to protect communities and save lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="text-lg px-12 py-6 h-auto"
              >
                Access Live Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-12 py-6 h-auto">
                Request Enterprise Access
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔥</span>
                <span className="text-lg font-bold">FireGuard AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Next-generation wildfire prediction and prevention system powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3">Platform</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Live Dashboard</p>
                <p>API Access</p>
                <p>Mobile App</p>
                <p>Enterprise</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">Data Sources</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>NASA FIRMS</p>
                <p>OpenWeather</p>
                <p>EPA AirNow</p>
                <p>NOAA</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">Support</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Documentation</p>
                <p>API Reference</p>
                <p>Contact</p>
                <p>Emergency</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 FireGuard AI. Saving lives through intelligent fire prevention.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
