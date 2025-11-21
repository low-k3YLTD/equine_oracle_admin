import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createPrediction, getPredictionsByUserId, getUserSubscription } from "./db";
import { makePrediction, validatePredictionInput } from "./services/mlPredictionService";
import { livePredictorRouter } from "./routers/livePredictor";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  predictions: router({
    create: protectedProcedure
      .input((val: any) => val)
      .mutation(async ({ ctx, input }) => {
        const validationError = validatePredictionInput(input);
        if (validationError) {
          throw new Error(validationError);
        }

        const prediction = makePrediction(input);
        
        const dbPrediction = await createPrediction({
          userId: ctx.user.id,
          horseName: input.horseName,
          track: input.track,
          raceType: input.raceType,
          distance: input.distance,
          raceDate: input.raceDate,
          daysSinceLastRace: input.daysSinceLastRace,
          winningStreak: input.winningStreak,
          losingStreak: input.losingStreak,
          lightgbmProbability: prediction.lightgbmProbability,
          randomForestProbability: prediction.randomForestProbability,
          gradientBoostingProbability: prediction.gradientBoostingProbability,
          logisticRegressionProbability: prediction.logisticRegressionProbability,
          ensembleProbability: prediction.ensembleProbability,
          confidence: prediction.confidence,
          modelExplanation: prediction.modelExplanation,
        });

        return dbPrediction;
      }),
    
    list: protectedProcedure
      .input((val: any) => ({ limit: val?.limit || 50 }))
      .query(async ({ ctx, input }) => {
        return await getPredictionsByUserId(ctx.user.id, input.limit);
      }),
  }),

  subscriptions: router({
    getCurrent: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserSubscription(ctx.user.id);
      }),
  }),

  livePredictor: livePredictorRouter,
});

export type AppRouter = typeof appRouter;

export default appRouter;
