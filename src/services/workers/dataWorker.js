// Data Worker for loading and processing CSV datasets
// Runs in background to prevent UI blocking

const CHUNK_SIZE = 10000; // Process data in chunks

self.onmessage = async function(event) {
  if (event.data.type === 'loadData') {
    try {
      await loadAllDatasets();
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }
};

async function loadAllDatasets() {
  const datasets = [
    { name: 'forestfires.csv', url: '/data/forestfires.csv' },
    { name: 'wildfire.csv', url: '/data/wildfire.csv' },
    { name: 'fire_nrt_SV-C2_565336.csv', url: '/data/fire_nrt_SV-C2_565336.csv' },
    { name: 'fire_nrt_M-C61_565334.csv', url: '/data/fire_nrt_M-C61_565334.csv' },
    { name: 'fire_nrt_J1V-C2_565335.csv', url: '/data/fire_nrt_J1V-C2_565335.csv' }
  ];

  let totalProcessed = 0;
  let totalSamples = 0;
  let fireSamples = 0;
  let successfulLoads = 0;

  for (const dataset of datasets) {
    self.postMessage({
      type: 'progress',
      progress: (datasets.indexOf(dataset) / datasets.length) * 0.8,
      message: `Loading ${dataset.name}...`
    });

    try {
      const data = await loadDataset(dataset.url);
      const processed = processDataset(data, dataset.name);
      
      totalProcessed += processed.length;
      totalSamples += processed.length;
      fireSamples += processed.filter(d => d.fireOccurred).length;
      successfulLoads++;

      self.postMessage({
        type: 'progress',
        progress: ((datasets.indexOf(dataset) + 1) / datasets.length) * 0.8,
        message: `Processed ${dataset.name} (${processed.length} samples)`
      });
    } catch (error) {
      console.warn(`Failed to load ${dataset.name}:`, error);
      self.postMessage({
        type: 'progress',
        progress: ((datasets.indexOf(dataset) + 1) / datasets.length) * 0.8,
        message: `Skipped ${dataset.name} (not available)`
      });
    }
  }

  // If no datasets loaded successfully, generate synthetic data
  if (successfulLoads === 0) {
    self.postMessage({
      type: 'progress',
      progress: 0.9,
      message: 'Generating synthetic fallback data...'
    });

    const syntheticData = generateSyntheticData(10000);
    totalSamples = syntheticData.length;
    fireSamples = syntheticData.filter(d => d.fireOccurred).length;
    totalProcessed = syntheticData.length;

    self.postMessage({
      type: 'progress',
      progress: 1.0,
      message: `Generated ${syntheticData.length} synthetic data points`
    });
  }

  self.postMessage({
    type: 'complete',
    result: {
      totalSamples,
      fireSamples,
      fireRate: (fireSamples / totalSamples) * 100,
      processedData: totalProcessed,
      dataSource: successfulLoads > 0 ? 'real' : 'synthetic'
    }
  });
}

async function loadDataset(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text.split('\n').filter(line => line.trim());
}

function processDataset(lines, datasetName) {
  if (lines.length === 0) return [];

  const processed = [];
  const headers = lines[0].split(',');

  // Process in chunks to prevent blocking
  for (let i = 1; i < lines.length; i += CHUNK_SIZE) {
    const chunk = lines.slice(i, i + CHUNK_SIZE);
    
    for (const line of chunk) {
      if (!line.trim()) continue;
      
      const values = line.split(',');
      const processedRow = processRow(values, headers, datasetName);
      if (processedRow) {
        processed.push(processedRow);
      }
    }

    // Allow other operations to run
    if (i % (CHUNK_SIZE * 5) === 0) {
      yield();
    }
  }

  return processed;
}

function processRow(values, headers, datasetName) {
  try {
    if (datasetName === 'forestfires.csv') {
      return processForestfiresRow(values, headers);
    } else if (datasetName === 'wildfire.csv') {
      return processWildfireRow(values, headers);
    } else if (datasetName.startsWith('fire_nrt_')) {
      return processFireNRTRow(values, headers);
    }
  } catch (error) {
    console.warn('Error processing row:', error);
    return null;
  }
}

function processForestfiresRow(values, headers) {
  const row = {};
  headers.forEach((header, index) => {
    row[header.trim()] = values[index];
  });

  return {
    latitude: parseFloat(row.X) || 0,
    longitude: parseFloat(row.Y) || 0,
    temperature: parseFloat(row.temp) || 0,
    humidity: parseFloat(row.RH) || 0,
    windSpeed: parseFloat(row.wind) || 0,
    rainfall: parseFloat(row.rain) || 0,
    FFMC: parseFloat(row.FFMC) || 0,
    DMC: parseFloat(row.DMC) || 0,
    DC: parseFloat(row.DC) || 0,
    ISI: parseFloat(row.ISI) || 0,
    month: row.month || 'jan',
    day: row.day || '1',
    area: parseFloat(row.area) || 0,
    fireOccurred: parseFloat(row.area) > 0,
    brightness: 0,
    frp: 0,
    confidence: 0.8
  };
}

function processWildfireRow(values, headers) {
  return {
    latitude: parseFloat(values[0]) || 0,
    longitude: parseFloat(values[1]) || 0,
    temperature: parseFloat(values[2]) || 0,
    humidity: parseFloat(values[3]) || 0,
    windSpeed: parseFloat(values[4]) || 0,
    pressure: parseFloat(values[5]) || 0,
    rainfall: parseFloat(values[6]) || 0,
    brightness: parseFloat(values[7]) || 0,
    frp: parseFloat(values[8]) || 0,
    fireClass: values[9] || 'h',
    fireOccurred: values[9] === 'h',
    FFMC: 0,
    DMC: 0,
    DC: 0,
    ISI: 0,
    month: 'jan',
    day: '1',
    area: 0
  };
}

function processFireNRTRow(values, headers) {
  const row = {};
  headers.forEach((header, index) => {
    row[header.trim()] = values[index];
  });

  return {
    latitude: parseFloat(row.latitude) || 0,
    longitude: parseFloat(row.longitude) || 0,
    brightness: parseFloat(row.brightness) || 0,
    frp: parseFloat(row.frp) || 0,
    confidence: parseFloat(row.confidence) || 0,
    acq_date: row.acq_date || '',
    acq_time: row.acq_time || '',
    fireOccurred: true,
    temperature: 0,
    humidity: 0,
    windSpeed: 0,
    rainfall: 0,
    FFMC: 0,
    DMC: 0,
    DC: 0,
    ISI: 0,
    month: 'jan',
    day: '1',
    area: 0
  };
}

function yield() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function generateSyntheticData(numSamples = 10000) {
  const syntheticData = [];
  const fireRate = 0.15; // 15% fire rate for realistic data
  
  for (let i = 0; i < numSamples; i++) {
    const latitude = 32.0 + Math.random() * 10; // California latitude range
    const longitude = -125.0 + Math.random() * 11; // California longitude range
    const temperature = 15 + Math.random() * 25; // 15-40°C
    const humidity = 20 + Math.random() * 60; // 20-80%
    const windSpeed = 0 + Math.random() * 30; // 0-30 m/s
    const pressure = 1000 + Math.random() * 50; // 1000-1050 hPa
    const rainfall = Math.random() * 20; // 0-20 mm
    const FFMC = 70 + Math.random() * 30; // Fine Fuel Moisture Code
    const DMC = 50 + Math.random() * 150; // Duff Moisture Code
    const DC = 200 + Math.random() * 600; // Drought Code
    const ISI = 3 + Math.random() * 20; // Initial Spread Index
    const brightness = 300 + Math.random() * 200;
    const frp = Math.random() * 100; // Fire Radiative Power
    const confidence = 70 + Math.random() * 30;
    
    const fireOccurred = Math.random() < fireRate;
    const area = fireOccurred ? Math.random() * 1000 : 0; // 0-1000 acres if fire occurred
    
    syntheticData.push({
      latitude,
      longitude,
      temperature,
      humidity,
      windSpeed,
      pressure,
      rainfall,
      FFMC,
      DMC,
      DC,
      ISI,
      brightness,
      frp,
      confidence,
      fireOccurred,
      area,
      seasonalRisk: 0.5 + Math.random() * 0.5,
      droughtIndex: 0.3 + Math.random() * 0.7,
      fireIntensity: fireOccurred ? Math.random() * 10 : 0
    });
  }
  
  return syntheticData;
}
