import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import WildfireMLTrainer, { MLTrainingConfig, ModelPerformance } from '../services/mlTrainer';
import WildfireDataAggregator from '../services/dataAggregator';

interface TrainingStatus {
  isTraining: boolean;
  progress: number;
  eta?: string;
  currentPhase?: string;
}

const MLTrainingDashboard: React.FC = () => {
  const [trainer] = useState(() => new WildfireMLTrainer());
  const [aggregator] = useState(() => new WildfireDataAggregator());
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
    isTraining: false,
    progress: 0
  });
  const [performance, setPerformance] = useState<ModelPerformance | null>(null);
  const [sourceSummary, setSourceSummary] = useState<any>(null);
  const [modelSummary, setModelSummary] = useState<any[]>([]);
  const [trainingConfig, setTrainingConfig] = useState<MLTrainingConfig>({
    modelType: 'ensemble',
    trainingDataSize: 100000,
    validationSplit: 0.2,
    testSplit: 0.1,
    epochs: 100,
    learningRate: 0.001,
    batchSize: 32,
    features: [
      'temperature', 'humidity', 'windSpeed', 'pressure', 'rainfall',
      'elevation', 'slope', 'vegetationType', 'fuelMoisture',
      'fireHistory', 'seasonalRisk', 'droughtIndex'
    ],
    targetVariable: 'fireRisk'
  });

  useEffect(() => {
    // Initialize data source summary
    setSourceSummary(aggregator.getSourceSummary());
    
    // Set up training progress polling
    const interval = setInterval(() => {
      if (trainingStatus.isTraining) {
        const progress = trainer.getTrainingProgress();
        setTrainingStatus(prev => ({
          ...prev,
          progress: progress.progress,
          eta: progress.eta
        }));
        
        if (progress.progress >= 100) {
          setTrainingStatus(prev => ({ ...prev, isTraining: false }));
          setModelSummary(trainer.getModelSummary());
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [trainingStatus.isTraining, trainer, aggregator]);

  const startTraining = async () => {
    try {
      setTrainingStatus({
        isTraining: true,
        progress: 0,
        currentPhase: 'Initializing...'
      });

      const result = await trainer.trainModels(trainingConfig);
      setPerformance(result);
      setModelSummary(trainer.getModelSummary());
    } catch (error) {
      console.error('Training failed:', error);
      alert('Training failed: ' + error.message);
    } finally {
      setTrainingStatus(prev => ({ ...prev, isTraining: false }));
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const getPhaseDescription = (progress: number): string => {
    if (progress < 30) return 'Collecting data from thousands of sources...';
    if (progress < 50) return 'Processing and cleaning massive datasets...';
    if (progress < 70) return 'Engineering advanced features...';
    if (progress < 95) return 'Training machine learning models...';
    return 'Validating model performance...';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">ML Training Center</h2>
          <p className="text-gray-600 mt-2">
            Train wildfire prediction models using data from thousands of sources
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={trainingStatus.isTraining ? "default" : "secondary"}>
            {trainingStatus.isTraining ? "Training" : "Ready"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">Data Sources</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {sourceSummary ? formatNumber(sourceSummary.total) : '0'}
                </div>
                <p className="text-xs text-gray-600">Active data sources</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Training Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(trainingConfig.trainingDataSize)}
                </div>
                <p className="text-xs text-gray-600">Data points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {performance ? `${(performance.accuracy * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-xs text-gray-600">Best model</p>
              </CardContent>
            </Card>
          </div>

          {trainingStatus.isTraining && (
            <Card>
              <CardHeader>
                <CardTitle>Training Progress</CardTitle>
                <CardDescription>
                  {getPhaseDescription(trainingStatus.progress)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={trainingStatus.progress} className="w-full" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{trainingStatus.progress.toFixed(1)}% Complete</span>
                  {trainingStatus.eta && <span>ETA: {trainingStatus.eta}</span>}
                </div>
              </CardContent>
            </Card>
          )}

          {performance && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Training Results</CardTitle>
                <CardDescription>
                  Model performance metrics from the most recent training session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(performance.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(performance.precision * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Precision</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {(performance.recall * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Recall</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(performance.f1Score * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">F1 Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Summary</CardTitle>
              <CardDescription>
                Comprehensive data collection from {sourceSummary?.total || 0} sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sourceSummary && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">By Category</h4>
                    {Object.entries(sourceSummary.byCategory).map(([category, count]) => (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">By Priority</h4>
                    {Object.entries(sourceSummary.byPriority).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between">
                        <span className="capitalize">{priority}</span>
                        <Badge 
                          variant={priority === 'critical' ? 'destructive' : priority === 'high' ? 'default' : 'secondary'}
                        >
                          {count as number}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Update Frequency</h4>
                    {Object.entries(sourceSummary.byFrequency).map(([frequency, count]) => (
                      <div key={frequency} className="flex justify-between">
                        <span className="capitalize">{frequency}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              <strong>Massive Data Integration:</strong> Our system connects to over {sourceSummary?.total || 0} data sources including NASA satellites, 
              government agencies, research institutions, weather stations, fire cameras, and historical databases 
              to provide the most comprehensive wildfire prediction training dataset available.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Configuration</CardTitle>
              <CardDescription>
                Configure and start model training with massive datasets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Model Type</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={trainingConfig.modelType}
                    onChange={(e) => setTrainingConfig(prev => ({ 
                      ...prev, 
                      modelType: e.target.value as any 
                    }))}
                    disabled={trainingStatus.isTraining}
                  >
                    <option value="ensemble">Ensemble (Recommended)</option>
                    <option value="neural_network">Neural Network</option>
                    <option value="random_forest">Random Forest</option>
                    <option value="gradient_boosting">Gradient Boosting</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Training Data Size</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={trainingConfig.trainingDataSize}
                    onChange={(e) => setTrainingConfig(prev => ({ 
                      ...prev, 
                      trainingDataSize: parseInt(e.target.value) 
                    }))}
                    disabled={trainingStatus.isTraining}
                  >
                    <option value={50000}>50,000 (Quick)</option>
                    <option value={100000}>100,000 (Standard)</option>
                    <option value={500000}>500,000 (Large)</option>
                    <option value={1000000}>1,000,000 (Massive)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={startTraining}
                  disabled={trainingStatus.isTraining}
                  className="px-8 py-2"
                  size="lg"
                >
                  {trainingStatus.isTraining ? 'Training in Progress...' : 'Start Training'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {performance && (
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>
                  Which factors contribute most to wildfire risk prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(performance.featureImportance)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([feature, importance]) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-32 text-sm font-medium">{feature}</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${importance * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-sm text-gray-600">
                          {(importance * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trained Models</CardTitle>
              <CardDescription>
                History of all trained wildfire prediction models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelSummary.length > 0 ? (
                <div className="space-y-4">
                  {modelSummary.map((model, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{model.type.replace('_', ' ')}</h4>
                        <Badge variant="outline">
                          {(model.accuracy * 100).toFixed(1)}% Accuracy
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Trained:</strong> {new Date(model.trainedAt).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Data Size:</strong> {formatNumber(model.dataSize)}
                        </div>
                        <div>
                          <strong>Training Time:</strong> {(model.trainingTime / 1000).toFixed(1)}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No models trained yet. Start your first training session to see results here.
                </div>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              <strong>Production-Ready AI:</strong> Our ensemble models combine multiple machine learning algorithms 
              trained on massive datasets to achieve industry-leading accuracy in wildfire risk prediction. 
              Models are continuously retrained with new data to maintain peak performance.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLTrainingDashboard;
