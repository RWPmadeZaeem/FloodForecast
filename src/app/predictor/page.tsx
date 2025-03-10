'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const riskColors: Record<string, string> = {
  Low: "#4ade80",
  Medium: "#facc15",
  High: "#f97316",
  Severe: "#ef4444"
};

interface PredictionData {
  risk_level: string;
  risk_percentage: number;
  predicted_discharge: number;
  threshold_value: number;
}

export default function PredictorPage() {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }
      const data: PredictionData = await response.json();
      setPredictionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Flood Risk Predictor</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Get Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Click below to fetch the latest flood risk prediction.</p>
          <Button onClick={fetchPrediction} disabled={loading}>
            {loading ? "Fetching..." : "Get Prediction"}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {predictionData && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Flood risk assessment based on river discharge data.</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Current Risk Level</h3>
                <div
                  className="text-white font-bold text-center py-3 rounded-md"
                  style={{ backgroundColor: riskColors[predictionData.risk_level] }}
                >
                  {predictionData.risk_level} Risk
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Risk Percentage</span>
                  <span className="text-sm font-medium">{predictionData.risk_percentage}%</span>
                </div>
                <Progress value={predictionData.risk_percentage} className="h-2.5" />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Discharge Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gray-100 p-3 rounded-md">
                    <CardContent>
                      <div className="text-sm text-gray-500">Predicted Discharge</div>
                      <div className="text-xl font-bold">{predictionData.predicted_discharge.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-100 p-3 rounded-md">
                    <CardContent>
                      <div className="text-sm text-gray-500">Threshold Value</div>
                      <div className="text-xl font-bold">{predictionData.threshold_value.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}