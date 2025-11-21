/**
 * Racing API Data Service
 * Fetches live race data from the racing API
 */

import { ENV } from "../_core/env";

interface Meet {
  id: string;
  name: string;
  venue: string;
  date: string;
  races?: Race[];
}

interface Race {
  id: string;
  number: number;
  time: string;
  name: string;
  distance: string;
  conditions: string;
  runners?: Runner[];
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

class RacingApiService {
  private baseUrl: string = "https://api.racing.com"; // Placeholder - update with actual API endpoint
  private username: string;
  private password: string;
  private token: string = "";
  private tokenExpiry: number = 0;

  constructor() {
    this.username = ENV.racingApiUsername || "";
    this.password = ENV.racingApiPassword || "";
  }

  /**
   * Authenticate with the racing API
   */
  async authenticate(): Promise<string> {
    const now = Date.now();
    
    // Return cached token if still valid
    if (this.token && this.tokenExpiry > now) {
      return this.token;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json() as any;
      this.token = data.token || "";
      this.tokenExpiry = now + (data.expiresIn || 3600) * 1000;

      return this.token;
    } catch (error) {
      console.error("[Racing API] Authentication error:", error);
      throw error;
    }
  }

  /**
   * Fetch today's racing meets
   */
  async getTodayMeets(): Promise<Meet[]> {
    try {
      const token = await this.authenticate();
      const today = new Date().toISOString().split("T")[0];

      const response = await fetch(
        `${this.baseUrl}/meets?date=${today}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn(`[Racing API] Failed to fetch meets: ${response.statusText}`);
        return this.getMockMeets();
      }

      const data = await response.json() as any;
      return data.meets || this.getMockMeets();
    } catch (error) {
      console.error("[Racing API] Error fetching meets:", error);
      return this.getMockMeets();
    }
  }

  /**
   * Fetch races for a specific meet
   */
  async getRacesForMeet(meetId: string): Promise<Race[]> {
    try {
      const token = await this.authenticate();

      const response = await fetch(
        `${this.baseUrl}/meets/${meetId}/races`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn(`[Racing API] Failed to fetch races: ${response.statusText}`);
        return this.getMockRaces();
      }

      const data = await response.json() as any;
      return data.races || this.getMockRaces();
    } catch (error) {
      console.error("[Racing API] Error fetching races:", error);
      return this.getMockRaces();
    }
  }

  /**
   * Fetch runners for a specific race
   */
  async getRunnersForRace(meetId: string, raceNumber: number): Promise<Runner[]> {
    try {
      const token = await this.authenticate();

      const response = await fetch(
        `${this.baseUrl}/meets/${meetId}/races/${raceNumber}/runners`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn(`[Racing API] Failed to fetch runners: ${response.statusText}`);
        return this.getMockRunners();
      }

      const data = await response.json() as any;
      return data.runners || this.getMockRunners();
    } catch (error) {
      console.error("[Racing API] Error fetching runners:", error);
      return this.getMockRunners();
    }
  }

  /**
   * Mock data for development/testing
   */
  private getMockMeets(): Meet[] {
    return [
      {
        id: "meet-1",
        name: "Matamata",
        venue: "Matamata Racecourse",
        date: new Date().toISOString().split("T")[0],
      },
      {
        id: "meet-2",
        name: "Cambridge",
        venue: "Cambridge Racecourse",
        date: new Date().toISOString().split("T")[0],
      },
      {
        id: "meet-3",
        name: "Hamilton",
        venue: "Hamilton Racecourse",
        date: new Date().toISOString().split("T")[0],
      },
    ];
  }

  private getMockRaces(): Race[] {
    return [
      {
        id: "race-1",
        number: 1,
        time: "12:00 PM",
        name: "Maiden 1200m",
        distance: "1200m",
        conditions: "Good",
      },
      {
        id: "race-2",
        number: 2,
        time: "12:35 PM",
        name: "Class 4 1400m",
        distance: "1400m",
        conditions: "Good",
      },
      {
        id: "race-3",
        number: 3,
        time: "1:10 PM",
        name: "Class 3 1600m",
        distance: "1600m",
        conditions: "Good",
      },
      {
        id: "race-4",
        number: 4,
        time: "1:45 PM",
        name: "Class 2 2000m",
        distance: "2000m",
        conditions: "Good",
      },
      {
        id: "race-5",
        number: 5,
        time: "2:20 PM",
        name: "Class 1 2200m",
        distance: "2200m",
        conditions: "Good",
      },
    ];
  }

  private getMockRunners(): Runner[] {
    return [
      {
        id: "runner-1",
        number: 1,
        name: "Lucky Strike",
        odds: 2.5,
        form: "1-2-3",
        weight: 58,
        jockey: "John Smith",
        trainer: "Jane Doe",
      },
      {
        id: "runner-2",
        number: 2,
        name: "Thunder Runner",
        odds: 3.0,
        form: "2-1-4",
        weight: 59,
        jockey: "Mike Johnson",
        trainer: "Bob Wilson",
      },
      {
        id: "runner-3",
        number: 3,
        name: "Swift Victory",
        odds: 4.0,
        form: "3-4-2",
        weight: 57,
        jockey: "Sarah Davis",
        trainer: "Tom Brown",
      },
      {
        id: "runner-4",
        number: 4,
        name: "Golden Dream",
        odds: 5.5,
        form: "4-3-1",
        weight: 60,
        jockey: "Emma Wilson",
        trainer: "Chris Lee",
      },
      {
        id: "runner-5",
        number: 5,
        name: "Midnight Express",
        odds: 6.0,
        form: "5-5-5",
        weight: 56,
        jockey: "David Miller",
        trainer: "Lisa Anderson",
      },
    ];
  }
}

export const racingApiService = new RacingApiService();
export default RacingApiService;
