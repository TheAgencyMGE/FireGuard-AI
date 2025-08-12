// Training Worker for ML model training
// Runs in background to prevent UI blocking during model training

importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js');

const MODEL_CONFIGS = [
  { name: 'wildfire-risk-v3', type: 'risk', inputSize: 12 },
  { name: 'fire-spread-v2', type: 'spread', inputSize: 10 },
  { name: 'ignition-probability-v4', type: 'ignition', inputSize: 8 },
  { name: 'fire-intensity-v1', type: 'intensity', inputSize: 6 },
  { name: 'evacuation-urgency-v1', type: 'evacuation', inputSize: 4 }
];

let trainedModels = new Map();

self.onmessage = async function(event) {
  if (event.data.type === 'trainModels') {
    try {
      await trainAllModels();
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }
};

async function trainAllModels() {
  self.postMessage({
    type: 'progress',
    progress: 0,
    message: 'Preparing training data...'
  });

  // Generate synthetic training data for demonstration
  const trainingData = generateTrainingData();
  
  for (let i = 0; i < MODEL_CONFIGS.length; i++) {
    const config = MODEL_CONFIGS[i];
    
    self.postMessage({
      type: 'progress',
      progress: (i / MODEL_CONFIGS.length) * 0.8,
      message: `Training ${config.name}...`
    });

    try {
      const model = await trainModel(config, trainingData);
      trainedModels.set(config.name, model);
      
      self.postMessage({
        type: 'progress',
        progress: ((i + 1) / MODEL_CONFIGS.length) * 0.8,
        message: `Completed ${config.name} (${model.accuracy.toFixed(1)}% accuracy)`
      });
    } catch (error) {
      console.error(`Error training ${config.name}:`, error);
    }
  }

  self.postMessage({
    type: 'complete',
    result: {
      models: Array.from(trainedModels.entries()),
      totalModels: trainedModels.size,
      averageAccuracy: calculateAverageAccuracy()
    }
  });
}

function generateTrainingData() {
  const samples = 10000;
  const features = [];
  const labels = [];

  for (let i = 0; i < samples; i++) {
    // Generate realistic wildfire data
    const sample = {
      temperature: Math.random() * 40 + 10, // 10-50°C
      humidity: Math.random() * 100, // 0-100%
      windSpeed: Math.random() * 30, // 0-30 m/s
      rainfall: Math.random() * 50, // 0-50 mm
      FFMC: Math.random() * 100, // 0-100
      DMC: Math.random() * 200, // 0-200
      DC: Math.random() * 800, // 0-800
      ISI: Math.random() * 50, // 0-50
      brightness: Math.random() * 500, // 0-500
      frp: Math.random() * 1000, // 0-1000
      pressure: Math.random() * 50 + 950, // 950-1000 hPa
      seasonalRisk: Math.random() * 10 // 0-10
    };

    // Determine fire risk based on conditions
    const fireRisk = calculateFireRisk(sample);
    const fireOccurred = Math.random() < fireRisk;

    features.push([
      sample.temperature,
      sample.humidity,
      sample.windSpeed,
      sample.rainfall,
      sample.FFMC,
      sample.DMC,
      sample.DC,
      sample.ISI,
      sample.brightness,
      sample.frp,
      sample.pressure,
      sample.seasonalRisk
    ]);

    labels.push(fireOccurred ? 1 : 0);
  }

  return { features, labels };
}

function calculateFireRisk(sample) {
  let risk = 0.1; // Base risk

  // Temperature factor
  if (sample.temperature > 30) risk += 0.3;
  else if (sample.temperature > 25) risk += 0.2;
  else if (sample.temperature > 20) risk += 0.1;

  // Humidity factor
  if (sample.humidity < 30) risk += 0.2;
  else if (sample.humidity < 50) risk += 0.1;

  // Wind factor
  if (sample.windSpeed > 20) risk += 0.2;
  else if (sample.windSpeed > 10) risk += 0.1;

  // Drought indices
  if (sample.FFMC > 80) risk += 0.2;
  if (sample.DMC > 150) risk += 0.15;
  if (sample.DC > 600) risk += 0.15;

  return Math.min(0.95, risk);
}

async function trainModel(config, trainingData) {
  const { features, labels } = trainingData;
  
  // Split data
  const splitIndex = Math.floor(features.length * 0.8);
  const trainFeatures = features.slice(0, splitIndex);
  const trainLabels = labels.slice(0, splitIndex);
  const testFeatures = features.slice(splitIndex);
  const testLabels = labels.slice(splitIndex);

  // Create model
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ units: 64, activation: 'relu', inputShape: [config.inputSize] }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 32, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' })
    ]
  });

  // Compile model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  // Convert to tensors
  const trainFeaturesTensor = tf.tensor2d(trainFeatures);
  const trainLabelsTensor = tf.tensor2d(trainLabels, [trainLabels.length, 1]);
  const testFeaturesTensor = tf.tensor2d(testFeatures);
  const testLabelsTensor = tf.tensor2d(testLabels, [testLabels.length, 1]);

  // Train model
  const history = await model.fit(trainFeaturesTensor, trainLabelsTensor, {
    epochs: 10,
    batchSize: 32,
    validationData: [testFeaturesTensor, testLabelsTensor],
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        // Allow UI updates between epochs
        if (epoch % 2 === 0) {
          yield();
        }
      }
    }
  });

  // Evaluate model
  const evaluation = model.evaluate(testFeaturesTensor, testLabelsTensor);
  const accuracy = evaluation[1].dataSync()[0] * 100;

  // Clean up tensors
  trainFeaturesTensor.dispose();
  trainLabelsTensor.dispose();
  testFeaturesTensor.dispose();
  testLabelsTensor.dispose();

  return {
    name: config.name,
    type: config.type,
    model: model,
    accuracy: accuracy,
    trainingHistory: history,
    inputSize: config.inputSize
  };
}

function calculateAverageAccuracy() {
  let totalAccuracy = 0;
  let count = 0;
  
  for (const [name, model] of trainedModels) {
    totalAccuracy += model.accuracy;
    count++;
  }
  
  return count > 0 ? totalAccuracy / count : 0;
}

function yield() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
