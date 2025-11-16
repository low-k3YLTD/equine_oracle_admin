import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PredictionForm {
  horseName: string;
  track: string;
  raceType: string;
  distance: string;
  raceDate: string;
  daysSinceLastRace: string;
  winningStreak: string;
  losingStreak: string;
}

export default function Predictor() {
  const { user } = useAuth();
  const [form, setForm] = useState<PredictionForm>({
    horseName: "",
    track: "",
    raceType: "Flat",
    distance: "1600",
    raceDate: new Date().toISOString().split("T")[0],
    daysSinceLastRace: "14",
    winningStreak: "0",
    losingStreak: "0",
  });

  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createPredictionMutation = trpc.predictions.create.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("Prediction generated successfully!");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate prediction");
      setIsLoading(false);
    },
  });

  const handleInputChange = (field: keyof PredictionForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        horseName: form.horseName,
        track: form.track,
        raceType: form.raceType,
        distance: parseInt(form.distance),
        raceDate: form.raceDate,
        daysSinceLastRace: form.daysSinceLastRace ? parseInt(form.daysSinceLastRace) : undefined,
        winningStreak: form.winningStreak ? parseInt(form.winningStreak) : undefined,
        losingStreak: form.losingStreak ? parseInt(form.losingStreak) : undefined,
      };

      await createPredictionMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Prediction error:", error);
    }
  };

  const confidenceColor = (confidence: string) => {
    if (confidence.includes("Very High")) return "text-green-600";
    if (confidence.includes("High")) return "text-green-500";
    if (confidence.includes("Medium-High")) return "text-yellow-600";
    if (confidence.includes("Medium")) return "text-yellow-500";
    return "text-red-500";
  };

  const probabilityToPercent = (prob: number) => {
    return (prob / 10000 * 100).toFixed(2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Prediction Tester</h1>
          <p className="text-muted-foreground">
            Test the ensemble ML model with race data and get detailed predictions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>Race Information</CardTitle>
              <CardDescription>Enter race details to generate a prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="horseName">Horse Name *</Label>
                  <Input
                    id="horseName"
                    placeholder="e.g., Thunder Runner"
                    value={form.horseName}
                    onChange={(e) => handleInputChange("horseName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="track">Track *</Label>
                  <Input
                    id="track"
                    placeholder="e.g., Flemington"
                    value={form.track}
                    onChange={(e) => handleInputChange("track", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="raceType">Race Type *</Label>
                  <Select value={form.raceType} onValueChange={(value) => handleInputChange("raceType", value)}>
                    <SelectTrigger id="raceType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="Hurdle">Hurdle</SelectItem>
                      <SelectItem value="Chase">Chase</SelectItem>
                      <SelectItem value="Steeplechase">Steeplechase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (meters) *</Label>
                  <Input
                    id="distance"
                    type="number"
                    placeholder="e.g., 1600"
                    value={form.distance}
                    onChange={(e) => handleInputChange("distance", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="raceDate">Race Date *</Label>
                  <Input
                    id="raceDate"
                    type="date"
                    value={form.raceDate}
                    onChange={(e) => handleInputChange("raceDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daysSinceLastRace">Days Since Last Race</Label>
                  <Input
                    id="daysSinceLastRace"
                    type="number"
                    placeholder="14"
                    value={form.daysSinceLastRace}
                    onChange={(e) => handleInputChange("daysSinceLastRace", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="winningStreak">Winning Streak</Label>
                    <Input
                      id="winningStreak"
                      type="number"
                      placeholder="0"
                      value={form.winningStreak}
                      onChange={(e) => handleInputChange("winningStreak", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="losingStreak">Losing Streak</Label>
                    <Input
                      id="losingStreak"
                      type="number"
                      placeholder="0"
                      value={form.losingStreak}
                      onChange={(e) => handleInputChange("losingStreak", e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Prediction
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-4">
            {result ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Prediction Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg">{result.horseName}</h3>
                    <p className={`text-sm font-medium ${confidenceColor(result.confidence)}`}>
                      {result.confidence} Confidence
                    </p>
                  </div>

                  <Tabs defaultValue="ensemble" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ensemble">Ensemble</TabsTrigger>
                      <TabsTrigger value="models">Models</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ensemble" className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Ensemble Probability</span>
                          <span className="text-sm font-bold text-blue-600">
                            {probabilityToPercent(result.ensembleProbability)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${probabilityToPercent(result.ensembleProbability)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">{result.modelExplanation}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="models" className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>LightGBM</span>
                          <span className="font-semibold">{probabilityToPercent(result.lightgbmProbability)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full"
                            style={{ width: `${probabilityToPercent(result.lightgbmProbability)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Random Forest</span>
                          <span className="font-semibold">{probabilityToPercent(result.randomForestProbability)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-600 h-1.5 rounded-full"
                            style={{ width: `${probabilityToPercent(result.randomForestProbability)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Gradient Boosting</span>
                          <span className="font-semibold">{probabilityToPercent(result.gradientBoostingProbability)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-orange-600 h-1.5 rounded-full"
                            style={{ width: `${probabilityToPercent(result.gradientBoostingProbability)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Logistic Regression</span>
                          <span className="font-semibold">{probabilityToPercent(result.logisticRegressionProbability)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-red-600 h-1.5 rounded-full"
                            style={{ width: `${probabilityToPercent(result.logisticRegressionProbability)}%` }}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setResult(null);
                      setForm({
                        horseName: "",
                        track: "",
                        raceType: "Flat",
                        distance: "1600",
                        raceDate: new Date().toISOString().split("T")[0],
                        daysSinceLastRace: "14",
                        winningStreak: "0",
                        losingStreak: "0",
                      });
                    }}
                  >
                    New Prediction
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full min-h-96">
                  <div className="text-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Fill in the form and submit to see prediction results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
