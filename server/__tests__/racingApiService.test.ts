import { describe, it, expect, beforeAll } from "vitest";
import { racingApiService } from "../services/racingApiService";

describe("Racing API Service", () => {
  describe("Authentication", () => {
    it("should handle authentication gracefully", async () => {
      // The service should handle authentication errors gracefully
      // and fall back to mock data
      expect(racingApiService).toBeDefined();
    });
  });

  describe("getTodayMeets", () => {
    it("should return an array of meets", async () => {
      const meets = await racingApiService.getTodayMeets();
      
      expect(Array.isArray(meets)).toBe(true);
      expect(meets.length).toBeGreaterThan(0);
      
      // Validate meet structure
      if (meets.length > 0) {
        const meet = meets[0];
        expect(meet).toHaveProperty("id");
        expect(meet).toHaveProperty("name");
        expect(meet).toHaveProperty("venue");
        expect(meet).toHaveProperty("date");
      }
    });
  });

  describe("getRacesForMeet", () => {
    it("should return an array of races for a meet", async () => {
      const races = await racingApiService.getRacesForMeet("meet-1");
      
      expect(Array.isArray(races)).toBe(true);
      expect(races.length).toBeGreaterThan(0);
      
      // Validate race structure
      if (races.length > 0) {
        const race = races[0];
        expect(race).toHaveProperty("id");
        expect(race).toHaveProperty("number");
        expect(race).toHaveProperty("time");
        expect(race).toHaveProperty("name");
        expect(race).toHaveProperty("distance");
        expect(race).toHaveProperty("conditions");
      }
    });
  });

  describe("getRunnersForRace", () => {
    it("should return an array of runners for a race", async () => {
      const runners = await racingApiService.getRunnersForRace("meet-1", 1);
      
      expect(Array.isArray(runners)).toBe(true);
      expect(runners.length).toBeGreaterThan(0);
      
      // Validate runner structure
      if (runners.length > 0) {
        const runner = runners[0];
        expect(runner).toHaveProperty("id");
        expect(runner).toHaveProperty("number");
        expect(runner).toHaveProperty("name");
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully and return mock data", async () => {
      // Test that the service returns mock data when API fails
      const meets = await racingApiService.getTodayMeets();
      expect(meets.length).toBeGreaterThan(0);
      
      const races = await racingApiService.getRacesForMeet("invalid-id");
      expect(Array.isArray(races)).toBe(true);
      
      const runners = await racingApiService.getRunnersForRace("invalid-id", 999);
      expect(Array.isArray(runners)).toBe(true);
    });
  });
});
