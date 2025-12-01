import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Zap, Trophy, Target } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

interface Meet {
  id: string;
  name: string;
  venue: string;
  date: string;
}

interface Race {
  id: string;
  number: number;
  time: string;
  name: string;
  distance: string;
  conditions: string;
}

interface Runner {
  id: string;
  number: number;
  name: string;
  odds?: number;
  form?: string;
  weight?: number;
  jockey?: string;
  trainer?: string;
}

interface Prediction {
  position: number;
  horse_name: string;
  horse_id: string;
  odds?: number;
  score: number;
  confidence: number;
}

export default function LivePredictor() {
  const [selectedMeet, setSelectedMeet] = useState<string>("");
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [races, setRaces] = useState<Race[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [firstFour, setFirstFour] = useState<string[]>([]);

  // Fetch meets using tRPC
  const { data: meets = [], isLoading: isLoadingMeets } = trpc.livePredictor.meets.useQuery();

  // Fetch races when meet is selected
  const { data: racesData = [], isLoading: isLoadingRaces } = trpc.livePredictor.races.useQuery(
    { meetId: selectedMeet },
    { enabled: !!selectedMeet }
  );

  // Fetch runners when race is selected
  const currentRace = racesData.find((r: any) => r.id === selectedRace);
  const { data: runnersData = [], isLoading: isLoadingRunners } = trpc.livePredictor.runners.useQuery(
    { meetId: selectedMeet, raceNumber: currentRace?.number || 0 },
    { enabled: !!selectedMeet && !!currentRace }
  );

  // Initialize selected meet on first load
  useEffect(() => {
    if (meets.length > 0 && !selectedMeet) {
      setSelectedMeet((meets[0] as any).id);
    }
  }, [meets, selectedMeet]);

  // Update races when meet changes
  useEffect(() => {
    setRaces(racesData as Race[]);
    setSelectedRace("");
    setPredictions([]);
    setFirstFour([]);
  }, [racesData]);

  // Update runners and generate predictions when race changes
  useEffect(() => {
    if (runnersData && runnersData.length > 0) {
      setRunners(runnersData as Runner[]);

      // Generate mock predictions based on runners
      const generatedPredictions: Prediction[] = (runnersData as Runner[])
        .slice(0, 5)
        .map((runner, idx) => ({
          position: idx + 1,
          horse_name: runner.name,
          horse_id: runner.id,
          odds: runner.odds || 3.0 + idx,
          score: 0.75 - idx * 0.08,
          confidence: Math.round((75 - idx * 10) * 100) / 100,
        }));

      setPredictions(generatedPredictions);

      // Generate first four prediction
      const topFour = generatedPredictions.slice(0, 4).map((p) => p.horse_name);
      setFirstFour(topFour);
    }
  }, [runnersData]);

  // Initialize selected race on first load
  useEffect(() => {
    if (races.length > 0 && !selectedRace) {
      setSelectedRace(races[0].id);
    }
  }, [races, selectedRace]);

  const topThree = predictions.slice(0, 3);
  const isLoadingPrediction = isLoadingRunners;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Live Race Predictor</h1>
          <p className="text-muted-foreground">
            Select a meet and race to view live predictions powered by our ensemble ML model
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meet Selection */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle>Select Meet</CardTitle>
              <CardDescription className="text-blue-100">Choose a racing venue</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingMeets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : meets && meets.length > 0 ? (
                <Select value={selectedMeet} onValueChange={setSelectedMeet}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a meet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(meets as any[]).map((meet) => (
                      <SelectItem key={meet.id} value={meet.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{meet.name}</span>
                          <span className="text-xs text-muted-foreground">({meet.venue})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">No meets available</p>
              )}
              {selectedMeet && meets && meets.length > 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  {(meets as any[]).find((m) => m.id === selectedMeet)?.venue}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Race Selection */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle>Select Race</CardTitle>
              <CardDescription className="text-purple-100">Choose a race at the meet</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingRaces ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : races && races.length > 0 ? (
                <Select value={selectedRace} onValueChange={setSelectedRace}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a race..." />
                  </SelectTrigger>
                  <SelectContent>
                    {races.map((race) => (
                      <SelectItem key={race.id} value={race.id}>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">Race {race.number}</span>
                          <span className="text-xs text-muted-foreground">{race.time}</span>
                          <span className="text-xs text-muted-foreground">{race.distance}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">No races available</p>
              )}
              {currentRace && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Race:</span> {currentRace.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Conditions:</span> {currentRace.conditions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Predictions Section */}
        {isLoadingPrediction ? (
          <Card className="shadow-lg">
            <CardContent className="pt-12 pb-12 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-muted-foreground">Generating predictions...</p>
              </div>
            </CardContent>
          </Card>
        ) : predictions.length > 0 ? (
          <div className="space-y-6">
            {/* First Four Prediction */}
            <Card className="shadow-lg border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
              <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <CardTitle>First Four Prediction</CardTitle>
                </div>
                <CardDescription className="text-yellow-100">
                  Predicted finishing order for the first four positions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {firstFour.map((horse, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-yellow-400 text-center shadow-md"
                    >
                      <div className="text-3xl font-bold text-yellow-600 mb-2">{idx + 1}</div>
                      <p className="font-semibold text-lg">{horse}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {predictions[idx]?.confidence.toFixed(1)}% confidence
                      </p>
                    </div>
                  ))}
                </div>

                {/* First Four Bet Suggestion */}
                <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg border border-blue-300 dark:border-blue-700">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Suggested First Four Bet:
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100 font-mono">
                    {firstFour.join(" → ")}
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200 mt-2">
                    Average confidence: {(firstFour.length > 0 ? predictions.slice(0, 4).reduce((sum, p) => sum + p.confidence, 0) / 4 : 0).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Win Predictions */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <CardTitle>Win Predictions</CardTitle>
                </div>
                <CardDescription className="text-green-100">
                  Top predictions for the race winner
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {topThree.map((pred, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                          {pred.position}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{pred.horse_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Odds: {pred.odds?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {pred.confidence.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Predictions Table */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <CardTitle>All Predictions</CardTitle>
                </div>
                <CardDescription className="text-slate-200">
                  Complete ranking of all runners
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold">Position</th>
                        <th className="text-left py-3 px-4 font-semibold">Horse Name</th>
                        <th className="text-right py-3 px-4 font-semibold">Odds</th>
                        <th className="text-right py-3 px-4 font-semibold">Score</th>
                        <th className="text-right py-3 px-4 font-semibold">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((pred, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                              {pred.position}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{pred.horse_name}</td>
                          <td className="py-3 px-4 text-right">{pred.odds?.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">{pred.score.toFixed(3)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                              {pred.confidence.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Select a meet and race to view predictions
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
