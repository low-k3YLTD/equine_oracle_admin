import { racingApiService } from "../services/racingApiService";
import { makePrediction } from "../services/mlPredictionService";

/**
 * Continuous Prediction Agent
 * Monitors Tab.co.nz races every 5 minutes and makes real-time predictions
 */

interface PredictionRecord {
  raceId: string;
  horseName: string;
  track: string;
  predictedProbability: number;
  confidence: string;
  modelVersion: string;
  timestamp: Date;
}

interface AgentMetrics {
  totalPredictions: number;
  racesProcessed: number;
  lastRunTime: Date | null;
  nextRunTime: Date | null;
  isRunning: boolean;
  errorCount: number;
}

class ContinuousPredictionAgent {
  private updateInterval = 5 * 60 * 1000; // 5 minutes
  private intervalId: NodeJS.Timeout | null = null;
  private predictions: Map<string, PredictionRecord[]> = new Map();
  private metrics: AgentMetrics = {
    totalPredictions: 0,
    racesProcessed: 0,
    lastRunTime: null,
    nextRunTime: null,
    isRunning: false,
    errorCount: 0,
  };
  private processedRaces: Set<string> = new Set();

  /**
   * Start continuous prediction monitoring
   */
  async start(): Promise<void> {
    if (this.metrics.isRunning) {
      console.log("[Prediction Agent] Already running");
      return;
    }

    console.log("[Prediction Agent] Starting continuous prediction monitoring...");
    this.metrics.isRunning = true;

    // Run immediately on start
    await this.runPredictionCycle();

    // Then schedule recurring cycles
    this.intervalId = setInterval(() => {
      this.runPredictionCycle().catch((error) => {
        console.error("[Prediction Agent] Error in prediction cycle:", error);
        this.metrics.errorCount++;
      });
    }, this.updateInterval);

    console.log("[Prediction Agent] Continuous monitoring started successfully");
  }

  /**
   * Stop continuous prediction monitoring
   */
  async stop(): Promise<void> {
    if (!this.metrics.isRunning) {
      console.log("[Prediction Agent] Not running");
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.metrics.isRunning = false;
    console.log("[Prediction Agent] Stopped");
  }

  /**
   * Main prediction cycle - fetch races and make predictions
   */
  private async runPredictionCycle(): Promise<void> {
    const startTime = Date.now();
    this.metrics.lastRunTime = new Date();
    this.metrics.nextRunTime = new Date(Date.now() + this.updateInterval);

    try {
      console.log("[Prediction Agent] Starting prediction cycle...");

      // Fetch today's meets
      const meets = await racingApiService.getTodayMeets();
      if (!meets || meets.length === 0) {
        console.log("[Prediction Agent] No meets available");
        return;
      }

      // Process each meet
      for (const meet of meets) {
        try {
          // Fetch races for this meet
          const races = await racingApiService.getRacesForMeet(meet.id);
          if (!races || races.length === 0) continue;

          // Process each race
          for (const race of races) {
            const raceKey = `${meet.id}-${race.number}`;

            // Skip if already processed
            if (this.processedRaces.has(raceKey)) {
              continue;
            }

            try {
              // Fetch runners for this race
              const runners = await racingApiService.getRunnersForRace(meet.id, race.number);
              if (!runners || runners.length === 0) continue;

              // Make predictions for each runner
              for (const runner of runners) {
                const prediction = await this.makePrediction({
                  horseName: runner.name,
                  track: meet.venue,
                  raceType: "Standard",
                  distance: parseInt(race.distance) || 1600,
                  raceDate: new Date(),
                  daysSinceLastRace: 30,
                  winningStreak: 0,
                  losingStreak: 0,
                });

                if (prediction) {
                  this.storePrediction(raceKey, prediction);
                  this.metrics.totalPredictions++;
                }
              }

              this.processedRaces.add(raceKey);
              this.metrics.racesProcessed++;
            } catch (error) {
              console.error(`[Prediction Agent] Error processing race ${raceKey}:`, error);
              this.metrics.errorCount++;
            }
          }
        } catch (error) {
          console.error(`[Prediction Agent] Error processing meet ${meet.id}:`, error);
          this.metrics.errorCount++;
        }
      }

      const duration = Date.now() - startTime;
      console.log(
        `[Prediction Agent] Prediction cycle completed in ${duration}ms. Processed ${this.metrics.racesProcessed} races, made ${this.metrics.totalPredictions} predictions`
      );
    } catch (error) {
      console.error("[Prediction Agent] Error in prediction cycle:", error);
      this.metrics.errorCount++;
    }
  }

  /**
   * Make a prediction for a single horse
   */
  private async makePrediction(input: {
    horseName: string;
    track: string;
    raceType: string;
    distance: number;
    raceDate: Date;
    daysSinceLastRace: number;
    winningStreak: number;
    losingStreak: number;
  }): Promise<PredictionRecord | null> {
    try {
      const prediction = makePrediction(input as any);
      return {
        raceId: `${input.track}-${input.raceDate.getTime()}`,
        horseName: input.horseName,
        track: input.track,
        predictedProbability: prediction.ensembleProbability,
        confidence: prediction.confidence,
        modelVersion: "v1.0",
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`[Prediction Agent] Error making prediction for ${input.horseName}:`, error);
      return null;
    }
  }

  /**
   * Store a prediction in memory
   */
  private storePrediction(raceKey: string, prediction: PredictionRecord): void {
    if (!this.predictions.has(raceKey)) {
      this.predictions.set(raceKey, []);
    }
    this.predictions.get(raceKey)!.push(prediction);
  }

  /**
   * Get all stored predictions
   */
  getPredictions(): Map<string, PredictionRecord[]> {
    return this.predictions;
  }

  /**
   * Get agent metrics
   */
  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear old predictions (older than 24 hours)
   */
  clearOldPredictions(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let cleared = 0;

    const keysToDelete: string[] = [];
    this.predictions.forEach((predictions: PredictionRecord[], key: string) => {
      const filtered = predictions.filter((p: PredictionRecord) => p.timestamp > oneDayAgo);
      if (filtered.length === 0) {
        keysToDelete.push(key);
        cleared++;
      } else {
        this.predictions.set(key, filtered);
      }
    });

    keysToDelete.forEach((key) => this.predictions.delete(key));

    if (cleared > 0) {
      console.log(`[Prediction Agent] Cleared ${cleared} old race predictions`);
    }
  }
}

export const continuousPredictionAgent = new ContinuousPredictionAgent();
