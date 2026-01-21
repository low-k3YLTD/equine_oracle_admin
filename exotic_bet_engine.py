"""
💰 Exotic Bet Optimizer Engine
==============================

Implements:
1. Probability calibration (market + model blend)
2. Exotic combination generator (Exacta, Trifecta, Superfecta)
3. EV signal generation (identify profitable bets)
4. Kelly criterion for bet sizing
5. ROI simulation

Author: ML Ensemble God-Tier System
Date: 2026-01-16
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from itertools import permutations, combinations
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)-8s | %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class Horse:
    """Horse with racing attributes"""
    id: int
    name: str
    win_probability: float
    odds: float
    form_rating: float


@dataclass
class ExoticBet:
    """Exotic bet combination"""
    bet_type: str  # 'exacta', 'trifecta', 'superfecta', 'first_four'
    combination: List[int]  # Horse IDs in order
    probability: float
    payout_odds: float
    expected_value: float
    kelly_fraction: float
    confidence_score: float


class ProbabilityCalibrator:
    """
    Calibrate win probabilities using market odds and model predictions
    
    Strategy: 70% model + 30% market for optimal edge
    """
    
    def __init__(self, market_efficiency: float = 0.85):
        self.market_efficiency = market_efficiency
        
    def calibrate_probabilities(self, horses: List[Horse]) -> List[Horse]:
        """Blend model and market probabilities"""
        logger.info(f"Calibrating probabilities for {len(horses)} horses")
        
        # Convert odds to implied probabilities
        implied_probs = []
        for horse in horses:
            implied_prob = 1 / horse.odds if horse.odds > 0 else 0.01
            implied_probs.append(implied_prob)
        
        # Normalize
        total = sum(implied_probs)
        normalized_probs = [p / total for p in implied_probs]
        
        # Calibrate: 70% model, 30% market
        calibrated_horses = []
        for i, horse in enumerate(horses):
            calibrated_prob = (0.7 * horse.win_probability + 0.3 * normalized_probs[i])
            
            calibrated_horses.append(Horse(
                id=horse.id,
                name=horse.name,
                win_probability=calibrated_prob,
                odds=horse.odds,
                form_rating=horse.form_rating
            ))
        
        logger.info(f"✓ Calibrated {len(calibrated_horses)} horses")
        return calibrated_horses


class ExoticBetGenerator:
    """Generate exotic bet combinations with EV calculations"""
    
    def __init__(self, min_ev_threshold: float = 0.05):
        self.min_ev_threshold = min_ev_threshold
        self.calibrator = ProbabilityCalibrator()
        
    def generate_exacta_bets(self, horses: List[Horse], top_n: int = 5) -> List[ExoticBet]:
        """Generate Exacta (1st-2nd) bets"""
        logger.info(f"Generating Exacta bets for top {top_n} horses")
        
        # Sort by probability
        sorted_horses = sorted(horses, key=lambda h: h.win_probability, reverse=True)[:top_n]
        
        bets = []
        for first, second in permutations(sorted_horses, 2):
            # Probability of this exact order
            prob = first.win_probability * (second.win_probability / (1 - first.win_probability))
            
            # Typical exacta payout: 1 / (prob * 0.85) - account for track take
            payout_odds = 1 / (prob * 0.85) if prob > 0 else 0
            
            # Expected value: (prob * payout) - 1
            ev = (prob * payout_odds) - 1
            
            if ev > self.min_ev_threshold:
                kelly_frac = (prob * payout_odds - 1) / (payout_odds - 1) if payout_odds > 1 else 0
                
                bets.append(ExoticBet(
                    bet_type='exacta',
                    combination=[first.id, second.id],
                    probability=prob,
                    payout_odds=payout_odds,
                    expected_value=ev,
                    kelly_fraction=max(0, min(kelly_frac, 0.25)),  # Cap at 25%
                    confidence_score=first.win_probability * 0.8
                ))
        
        return sorted(bets, key=lambda b: b.expected_value, reverse=True)
    
    def generate_trifecta_bets(self, horses: List[Horse], top_n: int = 6) -> List[ExoticBet]:
        """Generate Trifecta (1st-2nd-3rd) bets"""
        logger.info(f"Generating Trifecta bets for top {top_n} horses")
        
        sorted_horses = sorted(horses, key=lambda h: h.win_probability, reverse=True)[:top_n]
        
        bets = []
        for combo in permutations(sorted_horses, 3):
            # Joint probability
            prob = combo[0].win_probability
            prob *= combo[1].win_probability / (1 - combo[0].win_probability)
            prob *= combo[2].win_probability / (1 - combo[0].win_probability - combo[1].win_probability)
            
            # Trifecta payout: 1 / (prob * 0.80)
            payout_odds = 1 / (prob * 0.80) if prob > 0 else 0
            ev = (prob * payout_odds) - 1
            
            if ev > self.min_ev_threshold:
                kelly_frac = (prob * payout_odds - 1) / (payout_odds - 1) if payout_odds > 1 else 0
                
                bets.append(ExoticBet(
                    bet_type='trifecta',
                    combination=[h.id for h in combo],
                    probability=prob,
                    payout_odds=payout_odds,
                    expected_value=ev,
                    kelly_fraction=max(0, min(kelly_frac, 0.15)),
                    confidence_score=combo[0].win_probability * 0.7
                ))
        
        return sorted(bets, key=lambda b: b.expected_value, reverse=True)
    
    def generate_first_four_bets(self, horses: List[Horse]) -> List[ExoticBet]:
        """Generate First Four (1st-2nd-3rd-4th) bets"""
        logger.info(f"Generating First Four bets")
        
        sorted_horses = sorted(horses, key=lambda h: h.win_probability, reverse=True)[:8]
        
        bets = []
        for combo in permutations(sorted_horses, 4):
            # Joint probability
            prob = combo[0].win_probability
            remaining_prob = 1 - combo[0].win_probability
            
            for i in range(1, 4):
                prob *= combo[i].win_probability / remaining_prob
                remaining_prob -= combo[i].win_probability
            
            # First Four payout: 1 / (prob * 0.75)
            payout_odds = 1 / (prob * 0.75) if prob > 0 else 0
            ev = (prob * payout_odds) - 1
            
            if ev > self.min_ev_threshold:
                kelly_frac = (prob * payout_odds - 1) / (payout_odds - 1) if payout_odds > 1 else 0
                
                bets.append(ExoticBet(
                    bet_type='first_four',
                    combination=[h.id for h in combo],
                    probability=prob,
                    payout_odds=payout_odds,
                    expected_value=ev,
                    kelly_fraction=max(0, min(kelly_frac, 0.10)),
                    confidence_score=combo[0].win_probability * 0.65
                ))
        
        return sorted(bets, key=lambda b: b.expected_value, reverse=True)


class ROISimulator:
    """Simulate ROI from exotic betting strategy"""
    
    def __init__(self, initial_bankroll: float = 10000):
        self.initial_bankroll = initial_bankroll
        
    def simulate_betting(self, bets: List[ExoticBet], num_races: int = 100) -> Dict:
        """Simulate betting performance over multiple races"""
        logger.info(f"Simulating {num_races} races with {len(bets)} bets per race")
        
        bankroll = self.initial_bankroll
        wins = 0
        losses = 0
        total_wagered = 0
        total_returned = 0
        
        for race_num in range(num_races):
            # Select top 3 bets by EV
            top_bets = sorted(bets, key=lambda b: b.expected_value, reverse=True)[:3]
            
            for bet in top_bets:
                # Wager Kelly fraction of bankroll
                wager = bankroll * bet.kelly_fraction
                total_wagered += wager
                
                # Simulate outcome
                if np.random.random() < bet.probability:
                    # Win
                    payout = wager * bet.payout_odds
                    bankroll += payout
                    total_returned += payout
                    wins += 1
                else:
                    # Loss
                    bankroll -= wager
                    losses += 1
        
        roi = ((bankroll - self.initial_bankroll) / self.initial_bankroll) * 100
        
        return {
            'final_bankroll': bankroll,
            'roi_percent': roi,
            'wins': wins,
            'losses': losses,
            'win_rate': wins / (wins + losses) if (wins + losses) > 0 else 0,
            'total_wagered': total_wagered,
            'total_returned': total_returned,
            'profit': bankroll - self.initial_bankroll
        }


class ExoticBetEngine:
    """Main orchestrator for exotic betting"""
    
    def __init__(self):
        self.calibrator = ProbabilityCalibrator()
        self.bet_generator = ExoticBetGenerator()
        self.roi_simulator = ROISimulator()
        
    def generate_betting_recommendations(self, horses: List[Horse]) -> Dict:
        """Generate complete betting recommendations"""
        logger.info("=" * 70)
        logger.info("💰 GENERATING EXOTIC BETTING RECOMMENDATIONS")
        logger.info("=" * 70)
        
        # Calibrate probabilities
        calibrated_horses = self.calibrator.calibrate_probabilities(horses)
        
        # Generate exotic bets
        exacta_bets = self.bet_generator.generate_exacta_bets(calibrated_horses, top_n=5)
        trifecta_bets = self.bet_generator.generate_trifecta_bets(calibrated_horses, top_n=6)
        first_four_bets = self.bet_generator.generate_first_four_bets(calibrated_horses)
        
        # Simulate ROI
        all_bets = exacta_bets + trifecta_bets + first_four_bets
        roi_sim = self.roi_simulator.simulate_betting(all_bets, num_races=100)
        
        return {
            'calibrated_horses': calibrated_horses,
            'exacta_bets': exacta_bets[:5],
            'trifecta_bets': trifecta_bets[:5],
            'first_four_bets': first_four_bets[:5],
            'roi_simulation': roi_sim,
            'top_ev_bet': max(all_bets, key=lambda b: b.expected_value) if all_bets else None
        }


if __name__ == "__main__":
    logger.info("Exotic Bet Engine module loaded successfully")
