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


## Phase 6: Live Data Integration & CSV Upload
- [ ] Implement LivePredictor page with live race data fetching
- [ ] Create CSV upload interface for batch predictions
- [ ] Integrate data validator for CSV validation
- [ ] Add live data API service integration
- [ ] Create tRPC procedures for CSV upload and live data

## Phase 7: Advanced Features
- [ ] Implement sync scheduler for automatic data updates
- [ ] Add prediction analytics dashboard
- [ ] Create data management interface
- [ ] Implement error handling and logging


## Phase 8: Racing API Integration
- [x] Integrate racing API credentials for live data fetching
- [x] Create racing data service with API authentication
- [x] Implement live meets and races data fetching
- [x] Add real-time prediction generation for live races
- [x] Create sync scheduler for continuous data updates
- [x] Write and pass racing API service tests

## Phase 9: Dashboard UI Improvements
- [x] Simplify race and meet selection with dropdown boxes
- [x] Populate dropdowns with live races from API
- [x] Add first four prediction display
- [x] Improve prediction results layout
- [x] Add real-time prediction generation on race selection
- [x] Write and pass LivePredictor component tests (11 tests passing)
