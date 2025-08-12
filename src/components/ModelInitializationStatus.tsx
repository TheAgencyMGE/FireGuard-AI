import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Loader2, Database, Brain, Zap } from 'lucide-react';

interface ModelInitializationStatusProps {
  onInitializationComplete?: () => void;
}

interface ModelStatus {
  isInitialized: boolean;
  totalModels: number;
  loadedModels: number;
  initializationTime: number;
  errors: string[];
  modelStats: {
    totalParameters: number;
    averageAccuracy: number;
    modelNames: string[];
  };
  currentStep: string;
  progress: number;
}

const ModelInitializationStatus: React.FC<ModelInitializationStatusProps> = ({ 
  onInitializationComplete 
}) => {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initializeModels = async () => {
      setIsInitializing(true);
      
      try {
        // Import the model initializer
        const ModelInitializer = (await import('../services/modelInitializer')).default;
        const initializer = ModelInitializer.getInstance();
        
        // Set up status updates
        initializer.onStatusUpdate((newStatus) => {
          setStatus(newStatus);
          
          if (newStatus.isInitialized) {
            setIsInitializing(false);
            onInitializationComplete?.();
          }
        });
        
        // Start initialization
        const result = await initializer.initializeAllModels();
        setStatus(result);
        
        if (result.isInitialized) {
          setIsInitializing(false);
          onInitializationComplete?.();
        }
      } catch (error) {
        console.error('Model initialization error:', error);
        setStatus({
          isInitialized: false,
          totalModels: 0,
          loadedModels: 0,
          initializationTime: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          modelStats: { totalParameters: 0, averageAccuracy: 0, modelNames: [] },
          currentStep: 'Initialization failed',
          progress: 0
        });
        setIsInitializing(false);
      }
    };

    // Start initialization when component mounts
    initializeModels();
  }, [onInitializationComplete]);

  if (!status) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Initializing ML Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={0} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Preparing to load wildfire datasets and train prediction models...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.isInitialized ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : isInitializing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          ML Model Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(status.progress)}%</span>
            </div>
            <Progress value={status.progress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {status.currentStep}
            </p>
          </div>

          {/* Status Overview */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={status.isInitialized ? "default" : isInitializing ? "secondary" : "destructive"}>
              {status.isInitialized ? "Ready" : isInitializing ? "Initializing" : "Failed"}
            </Badge>
          </div>

          {/* Model Statistics */}
          {status.isInitialized && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="text-sm font-medium">Models Loaded:</span>
                  <Badge variant="outline">{status.loadedModels}/{status.totalModels}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Total Parameters:</span>
                  <Badge variant="outline">{status.modelStats.totalParameters.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Average Accuracy:</span>
                  <Badge variant="outline">{status.modelStats.averageAccuracy.toFixed(1)}%</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Model Names:</div>
                <div className="space-y-1">
                  {status.modelStats.modelNames.map((name, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Initialization Time */}
          {status.initializationTime > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Initialization Time:</span>
              <Badge variant="outline">
                {(status.initializationTime / 1000).toFixed(1)}s
              </Badge>
            </div>
          )}

          {/* Errors */}
          {status.errors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {status.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600">
                      {error}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {status.isInitialized && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All models have been successfully trained and loaded using Web Workers. The wildfire prediction system is now ready to provide accurate, consistent predictions without blocking the UI.
              </AlertDescription>
            </Alert>
          )}

          {/* Initialization in Progress */}
          {isInitializing && !status.isInitialized && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Models are being trained in the background using Web Workers. This process won't block the UI and you'll see real-time progress updates.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelInitializationStatus;
