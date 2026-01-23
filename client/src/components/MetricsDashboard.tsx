import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface ModelMetrics {
  ndcg4: number;
  calibrationError: number;
  latencyMs: number;
  accuracy: number;
  rocAuc: number;
  lastUpdated: Date;
  modelVersion: string;
  status: "healthy" | "degraded" | "critical";
}

interface MetricsDashboardProps {
  metrics?: ModelMetrics;
  historicalData?: Array<{
    timestamp: string;
    accuracy: number;
    rocAuc: number;
    latency: number;
  }>;
  modelBreakdown?: Array<{
    model: string;
    accuracy: number;
    rocAuc: number;
    weight: number;
  }>;
}

const DEFAULT_METRICS: ModelMetrics = {
  ndcg4: 0.9763,
  calibrationError: 0.0518,
  latencyMs: 93.3,
  accuracy: 0.78,
  rocAuc: 0.82,
  lastUpdated: new Date(),
  modelVersion: "1.0.0",
  status: "healthy",
};

const DEFAULT_HISTORICAL_DATA = [
  { timestamp: "00:00", accuracy: 0.75, rocAuc: 0.80, latency: 95 },
  { timestamp: "04:00", accuracy: 0.76, rocAuc: 0.81, latency: 92 },
  { timestamp: "08:00", accuracy: 0.77, rocAuc: 0.815, latency: 91 },
  { timestamp: "12:00", accuracy: 0.78, rocAuc: 0.82, latency: 93 },
  { timestamp: "16:00", accuracy: 0.78, rocAuc: 0.82, latency: 94 },
  { timestamp: "20:00", accuracy: 0.78, rocAuc: 0.82, latency: 93 },
];

const DEFAULT_MODEL_BREAKDOWN = [
  { model: "LightGBM", accuracy: 0.79, rocAuc: 0.83, weight: 0.25 },
  { model: "XGBoost", accuracy: 0.77, rocAuc: 0.81, weight: 0.20 },
  { model: "CatBoost", accuracy: 0.76, rocAuc: 0.80, weight: 0.20 },
  { model: "TabNet", accuracy: 0.75, rocAuc: 0.79, weight: 0.15 },
  { model: "Neural Net", accuracy: 0.74, rocAuc: 0.78, weight: 0.12 },
  { model: "Logistic Reg", accuracy: 0.72, rocAuc: 0.76, weight: 0.08 },
];

const RADAR_DATA = [
  { metric: "Accuracy", value: 78, fullMark: 100 },
  { metric: "ROC-AUC", value: 82, fullMark: 100 },
  { metric: "NDCG@4", value: 97.63, fullMark: 100 },
  { metric: "Latency", value: 90, fullMark: 100 }, // Inverted (lower is better)
  { metric: "Calibration", value: 94.82, fullMark: 100 }, // Inverted (lower error is better)
];

export default function MetricsDashboard({
  metrics = DEFAULT_METRICS,
  historicalData = DEFAULT_HISTORICAL_DATA,
  modelBreakdown = DEFAULT_MODEL_BREAKDOWN,
}: MetricsDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-300";
      case "degraded":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getMetricStatus = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100;
    if (percentage >= 80) return "excellent";
    if (percentage >= 60) return "good";
    if (percentage >= 40) return "fair";
    return "poor";
  };

  return (
    <div className="space-y-6">
      {/* System Status Card */}
      <Card className="shadow-lg border-2 border-blue-400">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6" />
              <div>
                <CardTitle>Model Performance Dashboard</CardTitle>
                <CardDescription className="text-blue-100">
                  Real-time metrics for God-Tier ensemble
                </CardDescription>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getStatusColor(metrics.status)}`}>
              {getStatusIcon(metrics.status)}
              <span className="font-semibold capitalize">{metrics.status}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="historical">Historical</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="radar">Performance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* NDCG@4 */}
                <div className="border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-muted-foreground">NDCG@4</p>
                    <Badge variant="outline" className="bg-blue-50">
                      Target: 0.98
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{metrics.ndcg4.toFixed(4)}</p>
                  <Progress
                    value={metrics.ndcg4 * 100}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {metrics.ndcg4 >= 0.98 ? "✓ Target achieved" : `${((0.98 - metrics.ndcg4) * 10000).toFixed(0)} basis points to target`}
                  </p>
                </div>

                {/* Accuracy */}
                <div className="border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-muted-foreground">Accuracy</p>
                    <Badge variant="outline" className="bg-green-50">
                      {getMetricStatus(metrics.accuracy, 0.5, 1.0)}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{(metrics.accuracy * 100).toFixed(1)}%</p>
                  <Progress
                    value={metrics.accuracy * 100}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Classification accuracy across all predictions
                  </p>
                </div>

                {/* ROC-AUC */}
                <div className="border-2 border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-muted-foreground">ROC-AUC</p>
                    <Badge variant="outline" className="bg-purple-50">
                      Excellent
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{metrics.rocAuc.toFixed(4)}</p>
                  <Progress
                    value={metrics.rocAuc * 100}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Area under ROC curve
                  </p>
                </div>

                {/* Calibration Error */}
                <div className="border-2 border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-muted-foreground">Calibration Error</p>
                    <Badge variant="outline" className="bg-orange-50">
                      Target: &lt;0.05
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{metrics.calibrationError.toFixed(4)}</p>
                  <Progress
                    value={(1 - metrics.calibrationError) * 100}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {metrics.calibrationError < 0.05 ? "✓ Within target" : "Above target - recalibration recommended"}
                  </p>
                </div>

                {/* Latency */}
                <div className="border-2 border-cyan-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-muted-foreground">Latency</p>
                    <Badge variant="outline" className="bg-cyan-50">
                      Target: &lt;150ms
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-cyan-600">{metrics.latencyMs.toFixed(1)}ms</p>
                  <Progress
                    value={Math.min((150 - metrics.latencyMs) / 150 * 100, 100)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    ✓ Excellent inference speed
                  </p>
                </div>

                {/* Model Version */}
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-muted-foreground">Model Version</p>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold text-gray-600">{metrics.modelVersion}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {metrics.lastUpdated.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Alert */}
              {metrics.status === "degraded" && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Model performance has degraded. Consider triggering retraining if accuracy drops &gt;5%.
                  </AlertDescription>
                </Alert>
              )}

              {metrics.status === "critical" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Critical performance issue detected. Immediate retraining recommended.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Historical Tab */}
            <TabsContent value="historical" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">24-Hour Performance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#10b981"
                      name="Accuracy"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="rocAuc"
                      stroke="#8b5cf6"
                      name="ROC-AUC"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="latency"
                      stroke="#06b6d4"
                      name="Latency (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* Models Tab */}
            <TabsContent value="models" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Individual Model Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modelBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#10b981" name="Accuracy" />
                    <Bar dataKey="rocAuc" fill="#8b5cf6" name="ROC-AUC" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {modelBreakdown.map((model) => (
                  <div key={model.model} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{model.model}</p>
                      <Badge variant="outline">
                        Weight: {(model.weight * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                        <p className="text-lg font-bold">{(model.accuracy * 100).toFixed(1)}%</p>
                        <Progress value={model.accuracy * 100} className="mt-1" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ROC-AUC</p>
                        <p className="text-lg font-bold">{model.rocAuc.toFixed(3)}</p>
                        <Progress value={model.rocAuc * 100} className="mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Radar Tab */}
            <TabsContent value="radar" className="space-y-4">
              <div className="border rounded-lg p-4 flex justify-center">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Comprehensive model performance visualization across all key metrics
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
