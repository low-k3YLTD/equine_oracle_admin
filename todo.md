# Equine Oracle Admin Dashboard - TODO

## Phase 1: Database Schema & Backend Integration
- [x] Update database schema with predictions, subscription tiers, and user subscriptions tables
- [x] Implement ML prediction service (mlPredictionService.ts)
- [ ] Create data service for race data ingestion
- [x] Set up tRPC procedures for predictions

## Phase 2: Admin Dashboard UI
- [x] Create DashboardLayout component with sidebar navigation
- [x] Build prediction testing interface
- [x] Create prediction history/results table
- [ ] Implement data ingestion form for CSV uploads
- [x] Create analytics/statistics dashboard

## Phase 3: Prediction Features
- [x] Single-race prediction form with input validation
- [x] Prediction results display with model breakdown
- [x] Real-time prediction testing interface
- [ ] Batch prediction support

## Phase 4: Data Management
- [ ] CSV data upload and validation
- [ ] Race data management interface
- [ ] Historical data viewing and filtering
- [ ] Data export functionality

## Phase 5: Analytics & Monitoring
- [ ] Prediction accuracy tracking
- [ ] Model performance metrics
- [ ] User activity logs
- [ ] System health monitoring

## Phase 6: Testing & Deployment
- [ ] Test all prediction endpoints
- [ ] Verify database operations
- [ ] Performance testing
- [ ] Create checkpoint for deployment

## Phase 7: Live Data Integration & CSV Upload
- [x] Implement LivePredictor page with live race data fetching
- [x] Create CSV upload interface for batch predictions
- [x] Integrate data validator for CSV validation
- [x] Add live data API service integration
- [x] Create tRPC procedures for CSV upload and live data

## Phase 8: Advanced Features
- [ ] Implement sync scheduler for automatic data updates
- [ ] Add prediction analytics dashboard
- [ ] Create data management interface
- [ ] Implement error handling and logging

## Phase 9: Racing API Integration
- [x] Integrate racing API credentials for live data fetching
- [x] Create racing data service with API authentication
- [x] Implement live meets and races data fetching
- [x] Add real-time prediction generation for live races
- [x] Create sync scheduler for continuous data updates
- [x] Write and pass racing API service tests

## Phase 10: Dashboard UI Improvements
- [x] Simplify race and meet selection with dropdown boxes
- [x] Populate dropdowns with live races from API
- [x] Add first four prediction display
- [x] Improve prediction results layout
- [x] Add real-time prediction generation on race selection
- [x] Write and pass LivePredictor component tests (11 tests passing)

## Phase 11: Debug Dropdown Issues
- [x] Fix dropdown API endpoint calls
- [x] Verify tRPC procedure calls are working
- [x] Test meet and race data fetching
- [x] Fix dropdown selection handlers

## Phase 12: Real Prediction Integration & Simplified Display
- [x] Integrate real ML predictions from ensemble model
- [x] Fix dropdown functionality for meet and race selection
- [x] Simplify display to show only top 4 ranked horses
- [x] Remove individual horse confidence display
- [x] Display top 4 as ranked list with scores
- [x] Test prediction generation with real ML model (11 tests passing)

## Phase 13: Simplify Race Details Entry
- [x] Convert race details form to dropdown-based selection
- [x] Populate dropdowns with available race options
- [x] Remove manual form inputs for race parameters
- [x] Test simplified race selection interface

## Phase 14: Continuous Prediction System Integration
- [x] Create Continuous Prediction Agent for autonomous race monitoring
- [x] Implement Result Collector for race outcome tracking
- [x] Build Auto-Retraining Engine for model improvement
- [x] Create Oracle Engine Orchestrator for system coordination
- [x] Integrate system startup into server initialization
- [x] Add system health monitoring and status endpoints
- [x] Write tests for continuous prediction components

## Phase 15: Backend Integration Completion
- [x] Implement rate limiting middleware for subscription tiers
- [x] Add prediction history filtering and sorting
- [x] Create CSV export functionality for predictions
- [x] Implement batch prediction support in tRPC
- [x] Add prediction accuracy tracking and metrics
- [x] Create analytics endpoints for dashboard
- [x] Implement proper error handling and logging
- [x] Add input validation for all endpoints
- [x] Create database indexes for performance
- [x] Write comprehensive vitest tests for all procedures


## Phase 16: React Error #185 Fix - COMPLETED ✅
- [x] Add missing React imports (useState, useEffect) to LivePredictor.tsx
- [x] Remove duplicate imports
- [x] Add missing useAuth import to Home.tsx
- [x] Add missing useAuth import to Dashboard.tsx
- [x] Add missing useAuth import to History.tsx
- [x] Add missing useState import to Predictor.tsx
- [x] Test component rendering
- [x] Verify all pages load without errors
- [x] Deploy fixed version to production - VERIFIED WORKING

## Phase 17: God-Tier Ensemble Integration Verification
- [x] Verify godTierRouter is properly imported in main routers.ts
- [x] Confirm all 7 tRPC endpoints are implemented:
  - [x] generatePredictions (8-model ensemble)
  - [x] generateBettingRecommendations (exotic bet optimizer)
  - [x] getMetrics (real-time performance metrics)
  - [x] triggerRetraining (admin-only manual retraining)
  - [x] getExplanation (SHAP-based interpretability)
  - [x] getSystemStatus (system health monitoring)
  - [x] clearCache (admin-only cache management)
- [x] Verify Python ML modules are in place:
  - [x] core_ensemble.py (8-model ensemble)
  - [x] exotic_bet_engine.py (probability calibration, Kelly criterion)
  - [x] optuna_optimizer.py (multi-objective optimization)
  - [x] shap_explainers.py (model interpretability)
- [x] Confirm build passes with no TypeScript errors
- [x] Verify production deployment is functional


## Phase 18: Dashboard UI for Betting Slip and Metrics
- [x] Create BettingSlip component for exotic bet display
- [x] Build MetricsDashboard component for model performance
- [ ] Integrate betting recommendations into LivePredictor
- [x] Add metrics visualization (NDCG@4, ECE, Latency, ROC-AUC, Calibration)
- [ ] Create betting history tracking UI
- [x] Add ROI calculator and simulator

## Phase 19: MLOps Infrastructure
- [ ] Set up MLflow tracking for experiment management
- [ ] Implement Alibi-Detect for data drift monitoring
- [ ] Create model versioning system
- [ ] Add prediction logging and monitoring
- [ ] Implement automated alerts for model degradation

## Phase 20: Auto-Retraining Pipeline
- [ ] Implement accuracy drop detection (>5% threshold)
- [ ] Create automatic retraining trigger system
- [ ] Add model performance comparison logic
- [ ] Implement A/B testing for new models
- [ ] Create retraining status monitoring UI

## Phase 21: TabNet Neural Ranker Integration
- [ ] Integrate TabNet model into ensemble
- [ ] Implement neural ranker for horse ranking
- [ ] Add attention mechanism visualization
- [ ] Create feature importance analysis
- [ ] Test TabNet performance metrics

## Phase 22: Edge Quantization (INT8 Optimization)
- [ ] Implement INT8 model quantization
- [ ] Create quantized model deployment
- [ ] Add performance benchmarking
- [ ] Implement fallback to FP32 if needed
- [ ] Document quantization results

## Phase 23: Production Deployment with Monitoring
- [ ] Set up production monitoring dashboard
- [ ] Implement real-time alert system
- [ ] Create backup and recovery procedures
- [ ] Add load balancing configuration
- [ ] Implement graceful degradation
- [ ] Create deployment documentation
