import { racingApiService } from "../services/racingApiService";

/**
 * Result Collector
 * Polls Tab.co.nz for completed race results and matches them with predictions
 */

interface PredictionResult {
  raceId: string;
  horseName: string;
  track: string;
  predictedProbability: number;
  actualResult: "win" | "loss" | "place";
  timestamp: Date;
}

interface AccuracyMetrics {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  byTrack: Record<string, { total: number; correct: number; accuracy: number }>;
}

class ResultCollector {
  private collectionInterval = 10 * 60 * 1000; // 10 minutes
  private intervalId: NodeJS.Timeout | null = null;
  private results: PredictionResult[] = [];
  private registeredPredictions: Map<string, any> = new Map();
  private isRunning = false;
  private errorCount = 0;

  /**
   * Start result collection monitoring
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[Result Collector] Already running");
      return;
    }

    console.log("[Result Collector] Starting result collection...");
    this.isRunning = true;

    // Run immediately on start
    await this.runCollectionCycle();

    // Then schedule recurring cycles
    this.intervalId = setInterval(() => {
      this.runCollectionCycle().catch((error) => {
        console.error("[Result Collector] Error in collection cycle:", error);
        this.errorCount++;
      });
    }, this.collectionInterval);

    console.log("[Result Collector] Result collection started successfully");
  }

  /**
   * Stop result collection monitoring
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log("[Result Collector] Not running");
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log("[Result Collector] Stopped");
  }

  /**
   * Register a prediction for tracking
   */
  registerPrediction(raceId: string, horseName: string, prediction: any): void {
    const key = `${raceId}-${horseName}`;
    this.registeredPredictions.set(key, {
      raceId,
      horseName,
      prediction,
      timestamp: new Date(),
    });
  }

  /**
   * Main collection cycle - fetch results and match with predictions
   */
  private async runCollectionCycle(): Promise<void> {
    try {
      console.log("[Result Collector] Starting result collection cycle...");

      // Fetch today's meets
      const meets = await racingApiService.getTodayMeets();
      if (!meets || meets.length === 0) {
        console.log("[Result Collector] No meets available");
        return;
      }

      let matchedResults = 0;

      // Process each meet
      for (const meet of meets) {
        try {
          // Fetch races for this meet
          const races = await racingApiService.getRacesForMeet(meet.id);
          if (!races || races.length === 0) continue;

          // Process each race
          for (const race of races) {
            try {
              // Check if race has results (completed)
              const raceKey = `${meet.id}-${race.number}`;

              // Fetch results for this race
              const results = await this.fetchRaceResults(meet.id, race.number);
              if (!results || results.length === 0) continue;

              // Match predictions with results
              for (const result of results) {
                const predictionKey = `${raceKey}-${result.horseName}`;
                const registeredPred = this.registeredPredictions.get(predictionKey);

                if (registeredPred) {
                  const predictionResult: PredictionResult = {
                    raceId: raceKey,
                    horseName: result.horseName,
                    track: meet.venue,
                    predictedProbability: registeredPred.prediction.ensembleProbability || 0,
                    actualResult: result.position === 1 ? "win" : result.position <= 4 ? "place" : "loss",
                    timestamp: new Date(),
                  };

                  this.results.push(predictionResult);
                  matchedResults++;
                }
              }
            } catch (error) {
              console.error(`[Result Collector] Error processing race ${race.number}:`, error);
            }
          }
        } catch (error) {
          console.error(`[Result Collector] Error processing meet ${meet.id}:`, error);
        }
      }

      console.log(`[Result Collector] Collection cycle completed. Matched ${matchedResults} results`);
    } catch (error) {
      console.error("[Result Collector] Error in collection cycle:", error);
      this.errorCount++;
    }
  }

  /**
   * Fetch race results from API
   */
  private async fetchRaceResults(meetId: string, raceNumber: number): Promise<any[]> {
    try {
      // This would call the racing API to get results
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error(`[Result Collector] Error fetching results for race ${raceNumber}:`, error);
      return [];
    }
  }

  /**
   * Get all collected results
   */
  getResults(): PredictionResult[] {
    return [...this.results];
  }

  /**
   * Get accuracy metrics
   */
  getAccuracyMetrics(): AccuracyMetrics {
    const metrics: AccuracyMetrics = {
      totalPredictions: this.results.length,
      correctPredictions: 0,
      accuracy: 0,
      byTrack: {},
    };

    // Calculate overall accuracy
    for (const result of this.results) {
      // A prediction is correct if it predicted win and horse won
      if (result.actualResult === "win" && result.predictedProbability > 0.5) {
        metrics.correctPredictions++;
      }

      // Track by venue
      if (!metrics.byTrack[result.track]) {
        metrics.byTrack[result.track] = { total: 0, correct: 0, accuracy: 0 };
      }

      metrics.byTrack[result.track].total++;
      if (result.actualResult === "win" && result.predictedProbability > 0.5) {
        metrics.byTrack[result.track].correct++;
      }
    }

    // Calculate percentages
    if (metrics.totalPredictions > 0) {
      metrics.accuracy = metrics.correctPredictions / metrics.totalPredictions;
    }

    for (const track in metrics.byTrack) {
      const trackMetrics = metrics.byTrack[track];
      if (trackMetrics.total > 0) {
        trackMetrics.accuracy = trackMetrics.correct / trackMetrics.total;
      }
    }

    return metrics;
  }

  /**
   * Clear old results (older than 7 days)
   */
  clearOldResults(): void {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const initialLength = this.results.length;

    this.results = this.results.filter((r) => r.timestamp > sevenDaysAgo);

    const cleared = initialLength - this.results.length;
    if (cleared > 0) {
      console.log(`[Result Collector] Cleared ${cleared} old results`);
    }
  }

  /**
   * Get collector status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      totalResults: this.results.length,
      registeredPredictions: this.registeredPredictions.size,
      errorCount: this.errorCount,
    };
  }
}

export const resultCollector = new ResultCollector();
