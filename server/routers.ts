import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createPrediction, getPredictionsByUserId, getUserSubscription, getPredictionAnalytics, getPredictionsFiltered, createBatchPredictions } from "./db";
import { makePrediction, validatePredictionInput } from "./services/mlPredictionService";
import { livePredictorRouter } from "./routers/livePredictor";
import { checkRateLimit, getRateLimitInfo } from "./middleware/rateLimiter";
import { predictionsToCSV, generateCSVFilename } from "./utils/csvExport";
import { z } from "zod";

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
        // Check rate limit
        const rateLimitCheck = await checkRateLimit(ctx.user.id);
        if (!rateLimitCheck.allowed) {
          throw new Error(rateLimitCheck.message || "Rate limit exceeded");
        }

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

    batch: protectedProcedure
      .input(z.array(z.object({
        horseName: z.string(),
        track: z.string(),
        raceType: z.string(),
        distance: z.number(),
        raceDate: z.string(),
        daysSinceLastRace: z.number().optional(),
        winningStreak: z.number().optional(),
        losingStreak: z.number().optional(),
      })))
      .mutation(async ({ ctx, input }) => {
        // Check rate limit for batch size
        const rateLimitCheck = await checkRateLimit(ctx.user.id);
        if (!rateLimitCheck.allowed || rateLimitCheck.remaining < input.length) {
          throw new Error(`Insufficient quota. Remaining: ${rateLimitCheck.remaining}, Requested: ${input.length}`);
        }

        const predictions = input.map((item) => {
          const validationError = validatePredictionInput(item);
          if (validationError) throw new Error(validationError);
          return makePrediction(item);
        });

        const dbPredictions = await createBatchPredictions(
          input.map((item, index) => ({
            userId: ctx.user.id,
            horseName: item.horseName,
            track: item.track,
            raceType: item.raceType,
            distance: item.distance,
            raceDate: item.raceDate,
            daysSinceLastRace: item.daysSinceLastRace,
            winningStreak: item.winningStreak,
            losingStreak: item.losingStreak,
            lightgbmProbability: predictions[index].lightgbmProbability,
            randomForestProbability: predictions[index].randomForestProbability,
            gradientBoostingProbability: predictions[index].gradientBoostingProbability,
            logisticRegressionProbability: predictions[index].logisticRegressionProbability,
            ensembleProbability: predictions[index].ensembleProbability,
            confidence: predictions[index].confidence,
            modelExplanation: predictions[index].modelExplanation,
          }))
        );

        return dbPredictions;
      }),

    analytics: protectedProcedure
      .query(async ({ ctx }) => {
        return await getPredictionAnalytics(ctx.user.id);
      }),

    filtered: protectedProcedure
      .input(z.object({
        track: z.string().optional(),
        horseName: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await getPredictionsFiltered(ctx.user.id, input);
      }),

    export: protectedProcedure
      .query(async ({ ctx }) => {
        const userPredictions = await getPredictionsByUserId(ctx.user.id, 1000);
        const csv = predictionsToCSV(userPredictions);
        const filename = generateCSVFilename();
        return { csv, filename };
      }),
  }),

  subscriptions: router({
    getCurrent: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserSubscription(ctx.user.id);
      }),

    rateLimit: protectedProcedure
      .query(async ({ ctx }) => {
        return await getRateLimitInfo(ctx.user.id);
      }),
  }),

  livePredictor: livePredictorRouter,

  analytics: router({
    dashboard: protectedProcedure
      .query(async ({ ctx }) => {
        return await getPredictionAnalytics(ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;

export default appRouter;
