/**
 * CSV Export Utility
 * Generates CSV files from prediction data
 */

import { Prediction } from "../../drizzle/schema";

/**
 * Convert predictions to CSV format
 */
export function predictionsToCSV(predictions: Prediction[]): string {
  if (predictions.length === 0) {
    return "No predictions to export";
  }

  // CSV headers
  const headers = [
    "ID",
    "Horse Name",
    "Track",
    "Race Type",
    "Distance",
    "Race Date",
    "LightGBM",
    "XGBoost",
    "Random Forest",
    "Gradient Boosting",
    "Logistic Regression",
    "Ensemble",
    "Confidence",
    "Created At",
  ];

  // CSV rows
  const rows = predictions.map((p) => [
    p.id.toString(),
    escapeCSVField(p.horseName),
    escapeCSVField(p.track),
    escapeCSVField(p.raceType),
    p.distance.toString(),
    escapeCSVField(p.raceDate),
    formatProbability(p.lightgbmProbability),
    formatProbability(p.xgboostProbability),
    formatProbability(p.randomForestProbability),
    formatProbability(p.gradientBoostingProbability),
    formatProbability(p.logisticRegressionProbability),
    formatProbability(p.ensembleProbability),
    escapeCSVField(p.confidence || ""),
    p.createdAt.toISOString(),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Escape CSV fields that contain commas, quotes, or newlines
 */
function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Format probability from 0-10000 scale to 0-100 percentage
 */
function formatProbability(probability: number | null | undefined): string {
  if (!probability) return "0.00%";
  const percentage = (probability / 10000) * 100;
  return `${percentage.toFixed(2)}%`;
}

/**
 * Generate CSV filename with timestamp
 */
export function generateCSVFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").split("T")[0];
  return `predictions-${timestamp}.csv`;
}
