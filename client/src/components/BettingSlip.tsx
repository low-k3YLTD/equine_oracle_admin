import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BetRecommendation {
  type: "First 4" | "Exacta" | "Trifecta" | "Quinella" | "Win" | "Place";
  horses: string[];
  suggestedStake: number;
  expectedValue: number;
  odds?: number;
  probability?: number;
  kellyFraction?: number;
}

interface BettingSlipProps {
  recommendations: BetRecommendation[];
  totalBankroll?: number;
  raceId?: string;
  onPlaceBet?: (bet: BetRecommendation) => void;
}

export default function BettingSlip({
  recommendations,
  totalBankroll = 1000,
  raceId,
  onPlaceBet,
}: BettingSlipProps) {
  const calculateROI = (stake: number, expectedValue: number) => {
    return ((expectedValue - stake) / stake * 100).toFixed(1);
  };

  const getTotalStake = () => {
    return recommendations.reduce((sum, bet) => sum + bet.suggestedStake, 0);
  };

  const getTotalExpectedValue = () => {
    return recommendations.reduce((sum, bet) => sum + bet.expectedValue, 0);
  };

  const getRecommendationColor = (expectedValue: number, stake: number) => {
    const roi = (expectedValue - stake) / stake;
    if (roi > 0.25) return "text-green-600";
    if (roi > 0.1) return "text-green-500";
    if (roi > 0) return "text-yellow-600";
    return "text-red-500";
  };

  const highValueBets = recommendations.filter(
    (bet) => (bet.expectedValue - bet.suggestedStake) / bet.suggestedStake > 0.15
  );

  return (
    <Card className="shadow-lg border-2 border-blue-400">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Betting Slip
            </CardTitle>
            <CardDescription className="text-blue-100">
              {raceId && `Race ID: ${raceId}`}
              {!raceId && "Exotic bet recommendations from God-Tier ensemble"}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Bankroll</div>
            <div className="text-2xl font-bold">${totalBankroll.toFixed(2)}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {recommendations.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No betting recommendations available. Generate predictions first.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* High-Value Bets Alert */}
            {highValueBets.length > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {highValueBets.length} high-value bet{highValueBets.length !== 1 ? "s" : ""} identified
                  with expected ROI &gt; 15%
                </AlertDescription>
              </Alert>
            )}

            {/* Betting Recommendations Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Bets ({recommendations.length})</TabsTrigger>
                <TabsTrigger value="high">High Value ({highValueBets.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {recommendations.map((bet, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {bet.type}
                        </Badge>
                        <div>
                          <p className="font-semibold text-sm">
                            {bet.horses.join(" → ")}
                          </p>
                          {bet.probability && (
                            <p className="text-xs text-muted-foreground">
                              Probability: {(bet.probability * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRecommendationColor(bet.expectedValue, bet.suggestedStake)}`}>
                          {calculateROI(bet.suggestedStake, bet.expectedValue)}% ROI
                        </div>
                        {bet.kellyFraction && (
                          <p className="text-xs text-muted-foreground">
                            Kelly: {(bet.kellyFraction * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
                        <p className="text-xs text-muted-foreground">Suggested Stake</p>
                        <p className="text-lg font-bold">${bet.suggestedStake.toFixed(2)}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
                        <p className="text-xs text-muted-foreground">Expected Value</p>
                        <p className="text-lg font-bold text-green-600">
                          ${bet.expectedValue.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded">
                        <p className="text-xs text-muted-foreground">Potential Return</p>
                        <p className="text-lg font-bold text-purple-600">
                          ${(bet.expectedValue + bet.suggestedStake).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {bet.odds && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-sm">
                          <span className="font-semibold">Odds:</span> {bet.odds.toFixed(2)}
                          <span className="text-xs text-muted-foreground ml-2">
                            (EV: ${(bet.odds * bet.suggestedStake).toFixed(2)})
                          </span>
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => onPlaceBet?.(bet)}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Place {bet.type} Bet
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="high" className="space-y-4">
                {highValueBets.length > 0 ? (
                  highValueBets.map((bet, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-green-300 rounded-lg p-4 bg-green-50 dark:bg-green-900/20 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                            {bet.type}
                          </Badge>
                          <div>
                            <p className="font-semibold text-sm">
                              {bet.horses.join(" → ")}
                            </p>
                            {bet.probability && (
                              <p className="text-xs text-muted-foreground">
                                Probability: {(bet.probability * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {calculateROI(bet.suggestedStake, bet.expectedValue)}% ROI
                          </div>
                          {bet.kellyFraction && (
                            <p className="text-xs text-muted-foreground">
                              Kelly: {(bet.kellyFraction * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded">
                          <p className="text-xs text-muted-foreground">Suggested Stake</p>
                          <p className="text-lg font-bold">${bet.suggestedStake.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-800 p-3 rounded">
                          <p className="text-xs text-muted-foreground">Expected Value</p>
                          <p className="text-lg font-bold text-green-700">
                            ${bet.expectedValue.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded">
                          <p className="text-xs text-muted-foreground">Potential Return</p>
                          <p className="text-lg font-bold text-purple-700">
                            ${(bet.expectedValue + bet.suggestedStake).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {bet.odds && (
                        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
                          <p className="text-sm">
                            <span className="font-semibold">Odds:</span> {bet.odds.toFixed(2)}
                            <span className="text-xs text-muted-foreground ml-2">
                              (EV: ${(bet.odds * bet.suggestedStake).toFixed(2)})
                            </span>
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={() => onPlaceBet?.(bet)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Place {bet.type} Bet
                      </Button>
                    </div>
                  ))
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No high-value bets identified. Consider all recommendations.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>

            {/* Summary Section */}
            <div className="border-t-2 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Stake</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${getTotalStake().toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((getTotalStake() / totalBankroll) * 100).toFixed(1)}% of bankroll
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Expected Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${getTotalExpectedValue().toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {calculateROI(getTotalStake(), getTotalExpectedValue())}% ROI
                  </p>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Bankroll remaining: ${(totalBankroll - getTotalStake()).toFixed(2)}
                  {getTotalStake() > totalBankroll && (
                    <span className="text-red-600 font-semibold ml-2">
                      ⚠️ Exceeds bankroll!
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
