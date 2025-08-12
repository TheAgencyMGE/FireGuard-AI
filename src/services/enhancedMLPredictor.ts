// Enhanced ML Predictor Service
// Uses pretrained models for consistent and accurate wildfire predictions

import * as tf from '@tensorflow/tfjs';
import EnhancedMLTrainer from './enhancedMLTrainer';

export interface EnhancedPredictionInput {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  rainfall: number;
  elevation: number;
  slope: number;
  vegetationType: string;
  fuelMoisture: number;
  fireHistory: number;
  seasonalRisk: number;
  droughtIndex: number;
  timestamp: string;
}

export interface EnhancedPredictionResult {
  fireRisk: number; // 0-100
  confidence: number; // 0-100
  timeToIgnition: number; // hours
  spreadRate: number; // km/h
  intensity: number; // MW/m²
  evacuationUrgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
  factors: {
    weather: number;
    terrain: number;
    vegetation: number;
    human: number;
    historical: number;
  };
  recommendations: string[];
  modelVersion: string;
  predictionTimestamp: string;
  modelPredictions: {
    risk: number;
    spread: number;
    ignition: number;
    intensity: number;
    evacuation: number;
  };
}

export interface ModelMetadata {
  name: string;
  version: string;
  accuracy: number;
  lastUpdated: string;
  features: string[];
  description: string;
}

class EnhancedMLPredictor {
  private static instance: EnhancedMLPredictor;
  private mlTrainer: EnhancedMLTrainer;
  private isInitialized = false;
  private modelCache: Map<string, any> = new Map();

  private constructor() {
    this.mlTrainer = EnhancedMLTrainer.getInstance();
  }

  public static getInstance(): EnhancedMLPredictor {
    if (!EnhancedMLPredictor.instance) {
      EnhancedMLPredictor.instance = new EnhancedMLPredictor();
    }
    return EnhancedMLPredictor.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Enhanced ML Predictor...');
    
    try {
      // Initialize the ML trainer which will load data and train models
      await this.mlTrainer.initialize();
      
      // Cache the trained models for faster access
      const models = this.mlTrainer.getAllTrainedModels();
      for (const model of models) {
        this.modelCache.set(model.name, model);
      }
      
      this.isInitialized = true;
      console.log(`✅ Enhanced ML Predictor initialized with ${models.length} trained models`);
    } catch (error) {
      console.error('❌ Error initializing Enhanced ML Predictor:', error);
      throw error;
    }
  }

  public async initializeWithModels(modelResults: any): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Enhanced ML Predictor with trained models...');
    
    try {
      // Cache the trained models from Web Worker results
      if (modelResults && modelResults.models) {
        for (const [name, modelData] of modelResults.models) {
          this.modelCache.set(name, modelData);
        }
      }
      
      this.isInitialized = true;
      console.log(`✅ Enhanced ML Predictor initialized with ${this.modelCache.size} trained models`);
    } catch (error) {
      console.error('❌ Error initializing Enhanced ML Predictor with models:', error);
      throw error;
    }
  }

  public async predict(input: EnhancedPredictionInput): Promise<EnhancedPredictionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Prepare input features for each model
      const riskFeatures = this.prepareFeaturesForModel(input, 'risk');
      const spreadFeatures = this.prepareFeaturesForModel(input, 'spread');
      const ignitionFeatures = this.prepareFeaturesForModel(input, 'ignition');
      const intensityFeatures = this.prepareFeaturesForModel(input, 'intensity');
      const evacuationFeatures = this.prepareFeaturesForModel(input, 'evacuation');

      // Get predictions from all models
      const [riskPrediction, spreadPrediction, ignitionPrediction, intensityPrediction, evacuationPrediction] = 
        await Promise.all([
          this.mlTrainer.predict('wildfire-risk-v3', riskFeatures),
          this.mlTrainer.predict('fire-spread-v2', spreadFeatures),
          this.mlTrainer.predict('ignition-probability-v4', ignitionFeatures),
          this.mlTrainer.predict('fire-intensity-v1', intensityFeatures),
          this.mlTrainer.predict('evacuation-urgency-v1', evacuationFeatures)
        ]);

      // Combine predictions for final result
      const fireRisk = riskPrediction * 100; // Convert to percentage
      const spreadRate = spreadPrediction * 50; // km/h (max 50 km/h)
      const timeToIgnition = ignitionPrediction > 0.5 ? (1 - ignitionPrediction) * 48 : 72; // hours
      const intensity = intensityPrediction * 1000; // MW/m²
      const evacuationLevel = Math.floor(evacuationPrediction * 5); // 0-4

      // Determine evacuation urgency
      let evacuationUrgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
      switch (evacuationLevel) {
        case 0: evacuationUrgency = 'none'; break;
        case 1: evacuationUrgency = 'low'; break;
        case 2: evacuationUrgency = 'medium'; break;
        case 3: evacuationUrgency = 'high'; break;
        case 4: evacuationUrgency = 'critical'; break;
        default: evacuationUrgency = 'none';
      }

      // Calculate confidence based on model agreement
      const confidence = this.calculateConfidence([
        riskPrediction, spreadPrediction, ignitionPrediction, intensityPrediction, evacuationPrediction
      ]);

      // Calculate factors
      const factors = this.calculateFactors(input, {
        risk: riskPrediction,
        spread: spreadPrediction,
        ignition: ignitionPrediction,
        intensity: intensityPrediction,
        evacuation: evacuationPrediction
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations(fireRisk, evacuationUrgency, factors);

      return {
        fireRisk,
        confidence,
        timeToIgnition,
        spreadRate,
        intensity,
        evacuationUrgency,
        factors,
        recommendations,
        modelVersion: '3.0.0',
        predictionTimestamp: new Date().toISOString(),
        modelPredictions: {
          risk: riskPrediction,
          spread: spreadPrediction,
          ignition: ignitionPrediction,
          intensity: intensityPrediction,
          evacuation: evacuationPrediction
        }
      };
    } catch (error) {
      console.error('❌ Error making prediction:', error);
      throw new Error('Failed to make prediction. Please try again.');
    }
  }

  private prepareFeaturesForModel(input: EnhancedPredictionInput, modelType: string): number[] {
    const baseFeatures = [
      input.latitude,
      input.longitude,
      input.temperature,
      input.humidity,
      input.windSpeed,
      input.windDirection,
      input.pressure,
      input.rainfall,
      this.estimateFFMC(input.temperature, input.humidity, input.rainfall),
      this.estimateDMC(input.temperature, input.humidity, input.rainfall),
      this.estimateDC(input.temperature, input.humidity, input.rainfall),
      this.estimateISI(input.windSpeed, this.estimateFFMC(input.temperature, input.humidity, input.rainfall)),
      this.estimateBrightness(input.temperature, input.humidity),
      this.estimateFRP(input.temperature, input.windSpeed),
      input.seasonalRisk,
      input.droughtIndex,
      this.estimateFireIntensity(input.temperature, input.windSpeed, input.humidity)
    ];

    switch (modelType) {
      case 'risk':
        return baseFeatures;
      case 'spread':
        return [
          input.windSpeed,
          input.windDirection,
          input.temperature,
          input.humidity,
          this.estimateFFMC(input.temperature, input.humidity, input.rainfall),
          this.estimateDMC(input.temperature, input.humidity, input.rainfall),
          this.estimateDC(input.temperature, input.humidity, input.rainfall),
          this.estimateISI(input.windSpeed, this.estimateFFMC(input.temperature, input.humidity, input.rainfall))
        ];
      case 'ignition':
        return [
          input.temperature,
          input.humidity,
          input.windSpeed,
          this.estimateFFMC(input.temperature, input.humidity, input.rainfall),
          this.estimateDMC(input.temperature, input.humidity, input.rainfall),
          this.estimateDC(input.temperature, input.humidity, input.rainfall),
          input.seasonalRisk,
          input.droughtIndex
        ];
      case 'intensity':
        return [
          this.estimateBrightness(input.temperature, input.humidity),
          this.estimateFRP(input.temperature, input.windSpeed),
          input.temperature,
          input.windSpeed,
          this.estimateFFMC(input.temperature, input.humidity, input.rainfall),
          this.estimateDC(input.temperature, input.humidity, input.rainfall),
          this.estimateFireIntensity(input.temperature, input.windSpeed, input.humidity)
        ];
      case 'evacuation':
        return [
          this.estimateFireIntensity(input.temperature, input.windSpeed, input.humidity),
          input.windSpeed,
          input.temperature,
          input.humidity,
          input.seasonalRisk,
          input.droughtIndex
        ];
      default:
        return baseFeatures;
    }
  }

  private estimateFFMC(temperature: number, humidity: number, rainfall: number): number {
    // Simplified FFMC estimation
    let ffmc = 85; // Base value
    ffmc += (temperature - 20) * 0.5; // Temperature effect
    ffmc -= (humidity - 50) * 0.3; // Humidity effect
    ffmc -= rainfall * 2; // Rainfall effect
    return Math.max(0, Math.min(100, ffmc));
  }

  private estimateDMC(temperature: number, humidity: number, rainfall: number): number {
    // Simplified DMC estimation
    let dmc = 50; // Base value
    dmc += (temperature - 20) * 2; // Temperature effect
    dmc -= (humidity - 50) * 0.5; // Humidity effect
    dmc -= rainfall * 5; // Rainfall effect
    return Math.max(0, Math.min(800, dmc));
  }

  private estimateDC(temperature: number, humidity: number, rainfall: number): number {
    // Simplified DC estimation
    let dc = 300; // Base value
    dc += (temperature - 20) * 10; // Temperature effect
    dc -= (humidity - 50) * 2; // Humidity effect
    dc -= rainfall * 20; // Rainfall effect
    return Math.max(0, Math.min(1000, dc));
  }

  private estimateISI(windSpeed: number, ffmc: number): number {
    // Simplified ISI estimation
    return Math.max(0, Math.min(50, windSpeed * 0.5 + ffmc * 0.1));
  }

  private estimateBrightness(temperature: number, humidity: number): number {
    // Estimate brightness based on temperature and humidity
    return 300 + (temperature - 20) * 5 - (humidity - 50) * 2;
  }

  private estimateFRP(temperature: number, windSpeed: number): number {
    // Estimate Fire Radiative Power
    return Math.max(0, (temperature - 15) * 2 + windSpeed * 3);
  }

  private estimateFireIntensity(temperature: number, windSpeed: number, humidity: number): number {
    // Estimate fire intensity
    return Math.max(0, (temperature - 20) * 5 + windSpeed * 2 - (humidity - 50) * 0.5);
  }

  private calculateConfidence(predictions: number[]): number {
    // Calculate confidence based on model agreement
    const mean = predictions.reduce((sum, p) => sum + p, 0) / predictions.length;
    const variance = predictions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / predictions.length;
    const stdDev = Math.sqrt(variance);
    
    // Higher confidence when models agree (low standard deviation)
    const agreementScore = Math.max(0, 1 - stdDev);
    return Math.min(100, agreementScore * 100);
  }

  private calculateFactors(input: EnhancedPredictionInput, predictions: any): any {
    return {
      weather: (input.temperature / 40) * 0.3 + ((100 - input.humidity) / 100) * 0.3 + (input.windSpeed / 30) * 0.4,
      terrain: (input.elevation / 3000) * 0.5 + (input.slope / 45) * 0.5,
      vegetation: (100 - input.fuelMoisture) / 100,
      human: input.fireHistory / 10,
      historical: input.seasonalRisk / 100
    };
  }

  private generateRecommendations(fireRisk: number, evacuationUrgency: string, factors: any): string[] {
    const recommendations: string[] = [];

    if (fireRisk > 75) {
      recommendations.push('Immediate evacuation recommended');
      recommendations.push('Monitor emergency channels continuously');
    } else if (fireRisk > 50) {
      recommendations.push('Prepare evacuation plan');
      recommendations.push('Stay alert for evacuation orders');
    } else if (fireRisk > 25) {
      recommendations.push('Increase vigilance');
      recommendations.push('Check fire restrictions');
    } else {
      recommendations.push('Monitor weather conditions');
      recommendations.push('Maintain defensible space');
    }

    if (factors.weather > 0.7) {
      recommendations.push('Extreme weather conditions detected');
    }

    if (factors.vegetation > 0.8) {
      recommendations.push('High vegetation dryness - avoid outdoor burning');
    }

    if (evacuationUrgency === 'critical') {
      recommendations.push('CRITICAL: Evacuate immediately');
      recommendations.push('Follow all emergency instructions');
    }

    return recommendations;
  }

  public getModelMetadata(): ModelMetadata[] {
    const models = this.mlTrainer.getAllTrainedModels();
    return models.map(model => ({
      name: model.name,
      version: model.version,
      accuracy: model.accuracy,
      lastUpdated: model.trainingDate,
      features: model.features,
      description: `Trained model for ${model.name} with ${model.accuracy.toFixed(2)}% accuracy`
    }));
  }

  public getModelStatistics(): any {
    return this.mlTrainer.getModelStatistics();
  }

  public async batchPredict(inputs: EnhancedPredictionInput[]): Promise<EnhancedPredictionResult[]> {
    const results: EnhancedPredictionResult[] = [];
    
    for (const input of inputs) {
      try {
        const result = await this.predict(input);
        results.push(result);
      } catch (error) {
        console.error('Error in batch prediction:', error);
        // Add fallback result
        results.push({
          fireRisk: 0,
          confidence: 0,
          timeToIgnition: 72,
          spreadRate: 0,
          intensity: 0,
          evacuationUrgency: 'none',
          factors: { weather: 0, terrain: 0, vegetation: 0, human: 0, historical: 0 },
          recommendations: ['Unable to make prediction'],
          modelVersion: '3.0.0',
          predictionTimestamp: new Date().toISOString(),
          modelPredictions: { risk: 0, spread: 0, ignition: 0, intensity: 0, evacuation: 0 }
        });
      }
    }
    
    return results;
  }
}

export default EnhancedMLPredictor;
