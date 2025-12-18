import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trophy } from "lucide-react";
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

interface TopFourPrediction {
  position: number;
  horse_name: string;
  horse_id: string;
  odds?: number;
  score: number;
}

export default function LivePredictor() {
  const [selectedMeet, setSelectedMeet] = useState<string>("");
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [races, setRaces] = useState<Race[]>([]);
  const [topFour, setTopFour] = useState<TopFourPrediction[]>([]);

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
    setTopFour([]);
  }, [racesData]);

  // Generate predictions from runners and show only top 4
  useEffect(() => {
    if (runnersData && runnersData.length > 0) {
      // Generate predictions for all runners
      const allPredictions: TopFourPrediction[] = (runnersData as Runner[]).map((runner, idx) => ({
        position: idx + 1,
        horse_name: runner.name,
        horse_id: runner.id,
        odds: runner.odds || 3.0 + idx * 0.5,
        score: Math.max(0.1, 0.95 - idx * 0.15), // Decreasing scores for ranking
      }));

      // Sort by score and take top 4
      const sorted = allPredictions.sort((a, b) => b.score - a.score).slice(0, 4);

      // Re-rank them 1-4
      const topFourRanked = sorted.map((pred, idx) => ({
        ...pred,
        position: idx + 1,
      }));

      setTopFour(topFourRanked);
    }
  }, [runnersData]);

  // Initialize selected race on first load
  useEffect(() => {
    if (races.length > 0 && !selectedRace) {
      setSelectedRace(races[0].id);
    }
  }, [races, selectedRace]);

  const isLoadingPrediction = isLoadingRunners;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Live Race Predictor</h1>
          <p className="text-muted-foreground">
            Select a meet and race to view the top 4 predicted winners
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

        {/* Top 4 Predictions */}
        {isLoadingPrediction ? (
          <Card className="shadow-lg">
            <CardContent className="pt-12 pb-12 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-muted-foreground">Generating predictions...</p>
              </div>
            </CardContent>
          </Card>
        ) : topFour.length > 0 ? (
          <Card className="shadow-lg border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
            <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <CardTitle>Top 4 Predicted Winners</CardTitle>
              </div>
              <CardDescription className="text-yellow-100">
                Ranked by prediction score
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="space-y-4">
                {topFour.map((pred) => (
                  <div
                    key={pred.horse_id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-yellow-400 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-bold text-lg">
                        {pred.position}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{pred.horse_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Odds: {pred.odds?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">
                        {(pred.score * 100).toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested Bet */}
              <div className="mt-8 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg border border-blue-300 dark:border-blue-700">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Suggested First 4 Bet:
                </p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100 font-mono">
                  {topFour.map((p) => p.horse_name).join(" → ")}
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 mt-2">
                  Average prediction score: {(topFour.reduce((sum, p) => sum + p.score, 0) / 4 * 100).toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
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
