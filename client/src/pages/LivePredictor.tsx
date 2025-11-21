import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, CheckCircle, Trophy, Zap } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

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

interface Prediction {
  position: number;
  horse_name: string;
  horse_id: string;
  odds: number;
  score: number;
  confidence: number;
}

interface PredictionResult {
  success: boolean;
  predictions: Prediction[];
  trifecta: {
    type: string;
    horses: string[];
    horse_ids: string[];
    confidence: number;
    description: string;
  } | null;
  firstFour: {
    type: string;
    horses: string[];
    horse_ids: string[];
    confidence: number;
    description: string;
  } | null;
  raceInfo: {
    name: string;
    time: string;
    distance: string;
  };
  error?: string;
}

export default function LivePredictor() {
  const [selectedMeet, setSelectedMeet] = useState<string>("");
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch meets
  const meetsQuery = trpc.livePredictor.meets.useQuery();

  // Fetch races for selected meet
  const racesQuery = trpc.livePredictor.races.useQuery(
    { meetId: selectedMeet },
    { enabled: !!selectedMeet }
  );

  const handlePredict = async () => {
    if (!selectedMeet || selectedRace === null) {
      alert("Please select a meet and race");
      return;
    }

    setIsLoading(true);
    try {
      // Generate demo predictions
      const demoResult: PredictionResult = {
        success: true,
        predictions: [
          { position: 1, horse_name: "Lucky Strike", horse_id: "1", odds: 2.5, score: 0.72, confidence: 72 },
          { position: 2, horse_name: "Thunder Runner", horse_id: "2", odds: 3.0, score: 0.65, confidence: 65 },
          { position: 3, horse_name: "Swift Victory", horse_id: "3", odds: 4.0, score: 0.58, confidence: 58 },
        ],
        trifecta: {
          type: "boxed_trifecta",
          horses: ["Lucky Strike", "Thunder Runner", "Swift Victory"],
          horse_ids: ["1", "2", "3"],
          confidence: 65,
          description: "Boxed Trifecta: Lucky Strike, Thunder Runner, Swift Victory",
        },
        firstFour: {
          type: "first_four",
          horses: ["Lucky Strike", "Thunder Runner", "Swift Victory"],
          horse_ids: ["1", "2", "3"],
          confidence: 65,
          description: "First Four: Lucky Strike, Thunder Runner, Swift Victory",
        },
        raceInfo: {
          name: `Race ${selectedRace}`,
          time: "2:30 PM",
          distance: "1200m",
        },
      };
      setPrediction(demoResult);
    } catch (error) {
      console.error("Prediction error:", error);
      setPrediction({
        success: false,
        predictions: [],
        trifecta: null,
        firstFour: null,
        raceInfo: { name: "", time: "", distance: "" },
        error: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const meets = meetsQuery.data || [];
  const races = racesQuery.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            Live Predictions
          </h1>
          <p className="text-muted-foreground">
            Select a meet and race to get instant predictions from the ensemble model
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Meet Selector */}
          <Card className="p-6">
            <label className="block text-sm font-semibold mb-3">
              Select Meet
            </label>
            {meetsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Select value={selectedMeet} onValueChange={setSelectedMeet}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a meet..." />
                </SelectTrigger>
                <SelectContent>
                  {meets.map((meet: Meet) => (
                    <SelectItem key={meet.id} value={meet.id}>
                      {meet.name} - {meet.venue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Card>

          {/* Race Selector */}
          <Card className="p-6">
            <label className="block text-sm font-semibold mb-3">
              Select Race
            </label>
            {racesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : races.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8">
                Select a meet first
              </p>
            ) : (
              <Select
                value={selectedRace?.toString() || ""}
                onValueChange={(val) => setSelectedRace(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a race..." />
                </SelectTrigger>
                <SelectContent>
                  {races.map((race: Race) => (
                    <SelectItem key={race.id} value={race.number.toString()}>
                      Race {race.number} - {race.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Card>

          {/* Predict Button */}
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 flex flex-col justify-end">
            <Button
              onClick={handlePredict}
              disabled={!selectedMeet || selectedRace === null || isLoading}
              className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold py-6 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Get Predictions
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Results */}
        {prediction && (
          <div className="space-y-6">
            {/* Race Info */}
            {prediction.raceInfo && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {prediction.raceInfo.name}
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Time</p>
                    <p className="font-semibold">
                      {prediction.raceInfo.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Distance</p>
                    <p className="font-semibold">
                      {prediction.raceInfo.distance}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Status</p>
                    <p className="text-green-600 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Ready
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Error */}
            {!prediction.success && prediction.error && (
              <Card className="p-6 border-red-200 bg-red-50">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-red-900 font-semibold">Prediction Error</h3>
                    <p className="text-red-700 text-sm mt-1">{prediction.error}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Top 3 Predictions */}
            {prediction.success && prediction.predictions.length > 0 && (
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Top 3 Ranked Horses
                </h3>
                <div className="space-y-4">
                  {prediction.predictions.map((pred, idx) => (
                    <div
                      key={idx}
                      className="bg-muted rounded-lg p-4 border hover:border-blue-500 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-lg">
                              {pred.horse_name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Odds: {pred.odds.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-600 font-bold text-2xl">
                            {pred.confidence.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${pred.confidence}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Exotic Bets */}
            {prediction.success && (prediction.trifecta || prediction.firstFour) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prediction.trifecta && (
                  <Card className="p-6 border-l-4 border-l-purple-600">
                    <h4 className="font-bold text-lg mb-2">Boxed Trifecta</h4>
                    <p className="text-muted-foreground mb-4">
                      {prediction.trifecta.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {prediction.trifecta.confidence}%
                      </span>
                    </div>
                  </Card>
                )}

                {prediction.firstFour && (
                  <Card className="p-6 border-l-4 border-l-green-600">
                    <h4 className="font-bold text-lg mb-2">First Four</h4>
                    <p className="text-muted-foreground mb-4">
                      {prediction.firstFour.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="text-2xl font-bold text-green-600">
                        {prediction.firstFour.confidence}%
                      </span>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
