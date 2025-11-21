import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { racingApiService } from "../services/racingApiService";

/**
 * Live Predictor Router
 * Handles live race data fetching and prediction requests
 */

export const livePredictorRouter = router({
  /**
   * Get today's racing meets
   */
  meets: publicProcedure.query(async () => {
    try {
      return await racingApiService.getTodayMeets();
    } catch (error) {
      console.error("Error fetching meets:", error);
      return [];
    }
  }),

  /**
   * Get races for a specific meet
   */
  races: publicProcedure
    .input(z.object({ meetId: z.string() }))
    .query(async ({ input }) => {
      try {
        return await racingApiService.getRacesForMeet(input.meetId);
      } catch (error) {
        console.error("Error fetching races:", error);
        return [];
      }
    }),

  /**
   * Get runners for a specific race
   */
  runners: publicProcedure
    .input(
      z.object({
        meetId: z.string(),
        raceNumber: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await racingApiService.getRunnersForRace(input.meetId, input.raceNumber);
      } catch (error) {
        console.error("Error fetching runners:", error);
        return [];
      }
    }),
});
