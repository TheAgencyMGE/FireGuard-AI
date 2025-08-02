// Test script to verify ML training functionality
import WildfireMLTrainer, { MLTrainingConfig } from './mlTrainer';

async function testMLTraining() {
  console.log('🧪 Testing ML Training System...');
  
  const trainer = new WildfireMLTrainer();
  
  const config: MLTrainingConfig = {
    modelType: 'neural_network',
    trainingDataSize: 1000, // Small dataset for testing
    validationSplit: 0.2,
    testSplit: 0.1,
    epochs: 10, // Few epochs for quick testing
    learningRate: 0.001,
    batchSize: 32,
    features: [
      'temperature', 'humidity', 'windSpeed', 'pressure', 'rainfall',
      'elevation', 'slope', 'vegetationType', 'fuelMoisture',
      'fireHistory', 'seasonalRisk', 'droughtIndex'
    ],
    targetVariable: 'fireRisk'
  };
  
  try {
    console.log('Starting training...');
    const performance = await trainer.trainModels(config);
    
    console.log('✅ Training completed!');
    console.log(`📊 Accuracy: ${(performance.accuracy * 100).toFixed(2)}%`);
    console.log(`🎯 Precision: ${(performance.precision * 100).toFixed(2)}%`);
    console.log(`📈 Recall: ${(performance.recall * 100).toFixed(2)}%`);
    console.log(`⏱️  Training time: ${performance.trainingTime}ms`);
    
    // Test prediction
    const testLocation = { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' };
    const prediction = await trainer.predict(testLocation, '24hours');
    
    console.log('🔮 Test prediction:');
    console.log(`🔥 Fire risk: ${(prediction.fireRisk * 100).toFixed(1)}%`);
    console.log(`🎯 Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
    console.log(`⚠️  Severity: ${prediction.severity}`);
    
    return true;
  } catch (error) {
    console.error('❌ Training failed:', error);
    return false;
  }
}

// Export for potential testing
export { testMLTraining };
