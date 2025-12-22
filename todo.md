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
- [ ] Implement LivePredictor page with live race data fetching
- [ ] Create CSV upload interface for batch predictions
- [ ] Integrate data validator for CSV validation
- [ ] Add live data API service integration
- [ ] Create tRPC procedures for CSV upload and live data

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
- [ ] Create Continuous Prediction Agent for autonomous race monitoring
- [ ] Implement Result Collector for race outcome tracking
- [ ] Build Auto-Retraining Engine for model improvement
- [ ] Create Oracle Engine Orchestrator for system coordination
- [ ] Integrate system startup into server initialization
- [ ] Add system health monitoring and status endpoints
- [ ] Write tests for continuous prediction components
