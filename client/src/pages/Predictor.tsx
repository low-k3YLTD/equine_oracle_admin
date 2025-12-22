import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RaceOption {
  id: string;
  number: number;
  time: string;
  name: string;
  distance: string;
  conditions: string;
}

interface RunnerOption {
  id: string;
  number: number;
  name: string;
  odds?: number;
}

export default function Predictor() {
  const [selectedMeet, setSelectedMeet] = useState<string>("");
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [selectedRunner, setSelectedRunner] = useState<string>("");
  const [races, setRaces] = useState<RaceOption[]>([]);
  const [runners, setRunners] = useState<RunnerOption[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch meets
  const { data: meets = [] } = trpc.livePredictor.meets.useQuery();

  // Fetch races when meet is selected
  const { data: racesData = [] } = trpc.livePredictor.races.useQuery(
    { meetId: selectedMeet },
    { enabled: !!selectedMeet }
  );

  // Fetch runners when race is selected
  const currentRace = (racesData as any[]).find((r) => r.id === selectedRace);
  const { data: runnersData = [] } = trpc.livePredictor.runners.useQuery(
    { meetId: selectedMeet, raceNumber: currentRace?.number || 0 },
    { enabled: !!selectedMeet && !!currentRace }
  );

  // Create prediction mutation
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

  // Initialize selected meet
  useEffect(() => {
    if ((meets as any[]).length > 0 && !selectedMeet) {
      setSelectedMeet((meets as any[])[0].id);
    }
  }, [meets, selectedMeet]);

  // Update races when meet changes
  useEffect(() => {
    setRaces(racesData as RaceOption[]);
    setSelectedRace("");
    setRunners([]);
    setSelectedRunner("");
  }, [racesData]);

  // Initialize selected race
  useEffect(() => {
    if (races.length > 0 && !selectedRace) {
      setSelectedRace(races[0].id);
    }
  }, [races, selectedRace]);

  // Update runners when race changes
  useEffect(() => {
    setRunners(runnersData as RunnerOption[]);
    setSelectedRunner("");
  }, [runnersData]);

  // Initialize selected runner
  useEffect(() => {
    if (runners.length > 0 && !selectedRunner) {
      setSelectedRunner(runners[0].id);
    }
  }, [runners, selectedRunner]);

  const handleGeneratePrediction = async () => {
    if (!selectedMeet || !selectedRace || !selectedRunner) {
      toast.error("Please select a meet, race, and runner");
      return;
    }

    setIsLoading(true);

    try {
      const selectedRunnerObj = runners.find((r) => r.id === selectedRunner);
      const selectedRaceObj = races.find((r) => r.id === selectedRace);
      const selectedMeetObj = (meets as any[]).find((m) => m.id === selectedMeet);

      if (!selectedRunnerObj || !selectedRaceObj || !selectedMeetObj) {
        throw new Error("Invalid selection");
      }

      const payload = {
        horseName: selectedRunnerObj.name,
        track: selectedMeetObj.venue,
        raceType: "Standard",
        distance: parseInt(selectedRaceObj.distance) || 1600,
        raceDate: new Date().toISOString().split("T")[0],
        daysSinceLastRace: 14,
        winningStreak: 0,
        losingStreak: 0,
      };

      await createPredictionMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error("Failed to generate prediction");
      setIsLoading(false);
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
            Select a meet, race, and runner to generate a prediction
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Selection Section */}
          <Card>
            <CardHeader>
              <CardTitle>Select Race & Runner</CardTitle>
              <CardDescription>Choose from available races and runners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meet Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Meet</label>
                <Select value={selectedMeet} onValueChange={setSelectedMeet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a meet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(meets as any[]).map((meet) => (
                      <SelectItem key={meet.id} value={meet.id}>
                        {meet.name} - {meet.venue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Race Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Race</label>
                <Select value={selectedRace} onValueChange={setSelectedRace}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a race..." />
                  </SelectTrigger>
                  <SelectContent>
                    {races.map((race) => (
                      <SelectItem key={race.id} value={race.id}>
                        Race {race.number} - {race.time} ({race.distance}m)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Runner Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Runner</label>
                <Select value={selectedRunner} onValueChange={setSelectedRunner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a runner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {runners.map((runner) => (
                      <SelectItem key={runner.id} value={runner.id}>
                        {runner.number}. {runner.name}
                        {runner.odds && ` (${runner.odds.toFixed(2)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Race Details */}
              {currentRace && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Race Name</p>
                    <p className="font-semibold">{currentRace.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conditions</p>
                    <p className="font-semibold">{currentRace.conditions}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleGeneratePrediction}
                className="w-full"
                disabled={isLoading || !selectedRunner}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Prediction
              </Button>
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
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
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
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
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
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
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
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-red-600 h-1.5 rounded-full"
                            style={{ width: `${probabilityToPercent(result.logisticRegressionProbability)}%` }}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center space-y-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Select a meet, race, and runner to generate a prediction
                    </p>
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
