# 🔥 FireGuard AI

**Advanced Real-time Wildfire Monitoring & Prediction System**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)

## 🌟 Overview

FireGuard AI is a comprehensive wildfire monitoring and prediction system that aggregates real-time data from thousands of sources including NASA FIRMS satellite data, government fire agencies, weather stations, and news feeds. The system uses machine learning to predict fire risk and provides early warning capabilities for wildfire threats.

## ✨ Key Features

### 🛰️ **Multi-Source Data Aggregation**
- **NASA FIRMS Integration**: Real-time satellite fire detection from MODIS and VIIRS sensors
- **Government APIs**: CAL FIRE, NIFC, InciWeb incident data
- **Weather Data**: NOAA, NWS alerts, RAWS weather stations
- **News & RSS Feeds**: Real-time fire incident reporting from news sources
- **Historical Data**: Archive of fire patterns and weather conditions

### 🤖 **Machine Learning Prediction Engine**
- **TensorFlow.js Implementation**: Browser-based neural network training
- **Risk Assessment**: Real-time fire danger level calculations
- **Pattern Recognition**: Historical fire behavior analysis
- **Weather Integration**: Temperature, humidity, wind speed correlation
- **Accuracy Metrics**: Confusion matrix and performance tracking

### 📊 **Real-time Dashboard**
- **Interactive Fire Map**: Live fire locations with satellite imagery
- **Weather Monitoring**: Current conditions and forecasts
- **Alert System**: Customizable notifications for high-risk areas
- **Data Visualization**: Charts and graphs of fire activity trends
- **Mobile Responsive**: Optimized for all device types

### 🔍 **Advanced Analytics**
- **Web Scraping**: Automated data collection from fire agencies
- **CORS Proxy Integration**: Bypass browser limitations for data access
- **Caching System**: Optimized performance with smart data caching
- **Error Handling**: Robust fallback mechanisms for data reliability

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/TheAgencyMGE/wildfire-sentinel.git

# Navigate to project directory
cd wildfire-sentinel

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Machine Learning**: TensorFlow.js, ml-matrix, simple-statistics
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom wildfire theme

### Project Structure
```
src/
├── components/          # React components
│   ├── AlertSystem.tsx  # Fire alert notifications
│   ├── FireMap.tsx      # Interactive fire map
│   ├── WeatherWidget.tsx # Weather display
│   └── WebScraper.tsx   # Data collection interface
├── services/           # Core services
│   ├── api.ts          # Fire data API integration
│   ├── mlTrainer.ts    # Machine learning engine
│   ├── dataAggregator.ts # Multi-source data collection
│   └── corsProxy.ts    # CORS handling service
├── pages/              # Application pages
│   ├── Dashboard.tsx   # Main monitoring dashboard
│   └── Index.tsx       # Landing page
└── lib/                # Utilities and helpers
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Keys (optional - system works with public data)
VITE_NASA_FIRMS_API_KEY=your_nasa_key_here
VITE_WEATHER_API_KEY=your_weather_key_here

# CORS Proxy Settings
VITE_CORS_PROXY_URL=https://api.allorigins.win/get?url=
```

### Data Sources Configuration
The system automatically aggregates data from:
- NASA FIRMS (Fire Information for Resource Management System)
- CAL FIRE incident APIs
- National Interagency Fire Center (NIFC)
- InciWeb incident information
- NOAA weather services
- Various state fire agency RSS feeds

## 🤖 Machine Learning Features

### Neural Network Architecture
- **Input Layer**: Weather data, historical fire patterns, satellite readings
- **Hidden Layers**: 128 → 64 → 32 neurons with dropout regularization
- **Output Layer**: Fire risk probability (0-1 scale)
- **Optimizer**: Adam with learning rate scheduling
- **Loss Function**: Binary cross-entropy for classification

### Training Data
- Historical fire incidents with location and timing
- Weather conditions at fire start times
- Satellite thermal anomaly data
- Terrain and vegetation indices

## 📈 Performance & Monitoring

### Real-time Capabilities
- **Data Refresh**: 5-minute intervals for critical sources
- **CORS Handling**: Multiple proxy services for reliability
- **Caching**: Intelligent caching with TTL management
- **Error Recovery**: Automatic fallback to cached or simulated data

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers supported

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/TheAgencyMGE/wildfire-sentinel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TheAgencyMGE/wildfire-sentinel/discussions)
- **Email**: support@theagencymge.com

## 🙏 Acknowledgments

- **NASA FIRMS** for satellite fire detection data
- **NOAA/NWS** for weather data and alerts
- **CAL FIRE** and other fire agencies for incident information
- **TensorFlow.js** team for machine learning capabilities
- **shadcn/ui** for beautiful UI components

---

**⚠️ Disclaimer**: This system is designed to assist in wildfire monitoring and should not be used as the sole source for emergency decision-making. Always follow official evacuation orders and emergency protocols from local authorities.
