import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Zap,
  X,
  ChevronRight,
  Swords,
  Shield,
  Target,
  Users,
  RotateCw,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { PLAYERS, getStarRating, getFranchiseColor, getFranchiseName, formatSlotRange } from '../../data/players';
import type { Player, PlayerRole } from '../../engine/types';
import CoinTossModal from './CoinTossModal';
import AlienMissionModal from './AlienMissionModal';

// ============================================================
// CONSTANTS
// ============================================================

const SQUAD_SIZE = 11;

const ROLE_LABELS: Record<PlayerRole, string> = {
  Batter: 'BAT',
  'All-Rounder': 'ALL',
  Bowler: 'BWL',
  WK: 'WK',
};

const ROLE_COLORS: Record<PlayerRole, string> = {
  Batter: '#3b82f6',
  'All-Rounder': '#8b5cf6',
  Bowler: '#ef4444',
  WK: '#10b981',
};

const MODE_TITLES: Record<string, { icon: React.ReactNode; label: string }> = {
  H2H: { icon: <Swords className="w-5 h-5" />, label: 'H2H Exhibition' },
  GAUNTLET: { icon: <Shield className="w-5 h-5" />, label: 'IPL Gauntlet' },
  CHASE_300: { icon: <Target className="w-5 h-5" />, label: 'Chase 300' },
};

// ============================================================
// STAT COLOUR HELPER
// ============================================================

function statColor(value: number): string {
  if (value >= 90) return '#a855f7'; // purple
  if (value >= 80) return '#22c55e'; // green
  if (value >= 65) return '#eab308'; // yellow
  if (value >= 40) return '#94a3b8'; // slate
  return '#64748b'; // dim
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function RoleBadge({ role }: { role: PlayerRole }) {
  return (
    <span
      className="draft-role-badge"
      style={{ '--badge-color': ROLE_COLORS[role] } as React.CSSProperties}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

function StatCell({ label, value, hidden }: { label: string; value: number, hidden?: boolean }) {
  return (
    <span className="draft-stat-cell">
      <span className="draft-stat-label">{label}</span>
      <span className="draft-stat-value" style={{ color: hidden ? '#64748b' : statColor(value) }}>
        {hidden ? '??' : value}
      </span>
    </span>
  );
}

function StarDots({ player }: { player: Player }) {
  const rating = getStarRating(player);
  const stars = Math.round(rating / 20);
  return (
    <span className="draft-stars" title={`Rating: ${rating}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < stars ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      ))}
    </span>
  );
}

// ============================================================
// SLOT SELECTION MODAL
// ============================================================

function SlotModal({
  player,
  availableSlots,
  onSelect,
  onClose,
}: {
  player: Player;
  availableSlots: number[]; // 1-indexed batting positions that are open
  onSelect: (slotIndex: number) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="slot-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="slot-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="slot-modal-header">
          <h3>Choose a batting position</h3>
          <button className="slot-modal-close" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="slot-modal-player">
          <span className="slot-modal-name">{player.name}</span>
          <div className="slot-modal-meta">
            <RoleBadge role={player.role} />
            <span
              className="slot-modal-team"
              style={{ color: getFranchiseColor(player.team) }}
            >
              {player.team}
            </span>
          </div>
        </div>

        <div className="slot-modal-grid">
          {availableSlots.map((slot) => (
            <motion.button
              key={slot}
              className="slot-modal-btn"
              whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(slot - 1)} // convert to 0-index
            >
              <span className="slot-modal-btn-num">{slot}</span>
              <span className="slot-modal-btn-label">Slot {slot}</span>
            </motion.button>
          ))}
        </div>

        {availableSlots.length === 0 && (
          <p className="slot-modal-empty">
            All allowed slots for this player are occupied.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// MAIN DRAFT SCREEN COMPONENT
// ============================================================

export default function DraftScreen() {
  const selectedMode = useGameStore((s) => s.selectedMode);
  const difficulty = useGameStore((s) => s.difficulty);
  const resetToMenu = useGameStore((s) => s.resetToMenu);
  const currentSpunTeam = useGameStore((s) => s.currentSpunTeam);
  const spinForTeam = useGameStore((s) => s.spinForTeam);
  const clearSpunTeam = useGameStore((s) => s.clearSpunTeam);
  const squad = useGameStore((s) => s.draftedSquad);
  const draftPlayer = useGameStore((s) => s.draftPlayer);

  // — Modal state —
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showCoinToss, setShowCoinToss] = useState(false);
  const [showAlienMission, setShowAlienMission] = useState(false);
  const [respinsRemaining, setRespinsRemaining] = useState(1);

  // Set of IDs already in squad
  const draftedIds = useMemo(
    () => new Set(squad.filter(Boolean).map((p) => p!.id)),
    [squad],
  );

  // Set of occupied slot indices (0-based)
  const occupiedSlots = useMemo(
    () => new Set(squad.map((p, i) => (p ? i : -1)).filter((i) => i >= 0)),
    [squad],
  );

  const filledCount = squad.filter(Boolean).length;
  const isFull = filledCount === SQUAD_SIZE;

  // — Players available from the spun franchise —
  const spunPlayers = useMemo(() => {
    if (!currentSpunTeam) return [];
    return PLAYERS.filter(
      (p) => p.team === currentSpunTeam && !draftedIds.has(p.id),
    );
  }, [currentSpunTeam, draftedIds]);

  // Check if a player has any available slots open
  const getAvailableSlots = useCallback(
    (player: Player): number[] => {
      return player.allowedSlots.filter((slot) => !occupiedSlots.has(slot - 1)); // slot is 1-indexed
    },
    [occupiedSlots],
  );

  // — Spin action —
  const handleSpin = useCallback(() => {
    if (isSpinning || isFull) return;
    setIsSpinning(true);
    setTimeout(() => {
      spinForTeam();
      setIsSpinning(false);
    }, 600);
  }, [isSpinning, isFull, spinForTeam]);

  // — Respin action —
  const handleRespin = useCallback(() => {
    if (respinsRemaining > 0 && !isSpinning && !isFull) {
      setRespinsRemaining(prev => prev - 1);
      setIsSpinning(true);
      setTimeout(() => {
        spinForTeam();
        setIsSpinning(false);
      }, 600);
    }
  }, [respinsRemaining, isSpinning, isFull, spinForTeam]);

  // — Player click → open modal —
  const handlePlayerClick = useCallback((player: Player) => {
    setSelectedPlayer(player);
  }, []);

  // — Slot selection from modal —
  const handleSlotSelect = useCallback(
    (slotIndex: number) => {
      if (!selectedPlayer) return;
      draftPlayer(selectedPlayer, slotIndex);
      setSelectedPlayer(null);
      // draftPlayer already resets currentSpunTeam in the store
    },
    [selectedPlayer, draftPlayer],
  );

  // — Close modal —
  const handleCloseModal = useCallback(() => {
    setSelectedPlayer(null);
  }, []);

  // — Simulate —
  const startSimulation = useGameStore((s) => s.startSimulation);
  const startH2HSimulation = useGameStore((s) => s.startH2HSimulation);
  
  const handleSimulate = () => {
    try {
      if (selectedMode === 'H2H') {
        console.log('[DraftScreen] H2H mode — opening Coin Toss modal');
        setShowCoinToss(true);
      } else if (selectedMode === 'CHASE_300') {
        console.log('[DraftScreen] CHASE_300 mode — opening Alien Mission modal');
        setShowAlienMission(true);
      } else {
        console.log('[DraftScreen] Starting simulation for mode:', selectedMode);
        startSimulation();
      }
    } catch (err) {
      console.error('[DraftScreen] handleSimulate crashed:', err);
    }
  };

  const handleCommenceChase = () => {
    setShowAlienMission(false);
    startSimulation();
  };

  const handleCoinTossDecision = (userBatsFirst: boolean) => {
    setShowCoinToss(false);
    startH2HSimulation(userBatsFirst);
  };

  const modeInfo = MODE_TITLES[selectedMode ?? 'H2H'];

  return (
    <div className="draft-screen">
      {/* ── HEADER ── */}
      <motion.header
        className="draft-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <button className="draft-back-btn" onClick={resetToMenu}>
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="draft-header-center">
          <div className="draft-mode-badge">
            {modeInfo.icon}
            <span>{modeInfo.label}</span>
          </div>
          <h1 className="draft-title">Draft Your XI</h1>
        </div>

        <div className="draft-counter">
          <Users className="w-4 h-4" />
          <span>
            <strong>{filledCount}</strong> / {SQUAD_SIZE}
          </span>
        </div>
      </motion.header>

      {/* ── GRID ── */}
      <div className="draft-grid h-[calc(100vh-160px)] min-h-0">
        {/* ── LEFT: SQUAD ── */}
        <motion.section
          className="draft-squad-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="draft-panel-header">
            <h2>Your Squad</h2>
          </div>

          <div className="draft-squad-list">
            {squad.map((player, i) => (
              <motion.div
                key={i}
                className={`draft-squad-slot ${player ? 'filled' : 'empty'}`}
                layout
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <span className="slot-number">{i + 1}</span>

                {player ? (
                  <>
                    <div className="slot-player-info">
                      <span className="slot-player-name">{player.name}</span>
                      <div className="slot-meta">
                        <RoleBadge role={player.role} />
                        <span
                          className="slot-team-tag"
                          style={{ color: getFranchiseColor(player.team) }}
                        >
                          {player.team}
                        </span>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex flex-row items-center space-x-3 sm:space-x-4 shrink-0 pr-2">
                      <StatCell label="BAT" value={player.batRating} hidden={difficulty === 'HARD'} />
                      <StatCell label="POW" value={player.powRating} hidden={difficulty === 'HARD'} />
                      <StatCell label="BWL" value={player.bwlRating} hidden={difficulty === 'HARD'} />
                    </div>
                  </>
                ) : (
                  <span className="slot-empty-label">— Empty Slot —</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* ── SIMULATE BUTTON ── */}
          <AnimatePresence>
            {isFull && (
              <motion.button
                className="draft-simulate-btn"
                id="simulate-btn"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(245,158,11,0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSimulate}
              >
                <Zap className="w-6 h-6" />
                <span>SIMULATE MATCH</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── RIGHT: SPIN & PLAYER POOL ── */}
        <motion.section
          className="draft-pool-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <AnimatePresence mode="wait">
            {/* ── STATE 1: Ready to Spin ── */}
            {!currentSpunTeam ? (
              <motion.div
                key="spin-state"
                className="spin-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <div className="spin-prompt">
                  <div className="spin-slot-label">
                    Pick <strong>{Math.min(filledCount + 1, SQUAD_SIZE)}</strong> of {SQUAD_SIZE}
                  </div>
                  <p className="spin-instruction">
                    Spin the wheel to reveal a franchise, then pick a player and choose their batting slot.
                  </p>
                </div>

                <motion.button
                  className="spin-btn"
                  id="spin-btn"
                  onClick={handleSpin}
                  disabled={isFull || isSpinning}
                  whileHover={!isFull ? { scale: 1.06, boxShadow: '0 0 60px rgba(99,102,241,0.5)' } : {}}
                  whileTap={!isFull ? { scale: 0.95 } : {}}
                >
                  <motion.div
                    className="spin-icon-wrap"
                    animate={isSpinning ? { rotate: 720 } : { rotate: 0 }}
                    transition={isSpinning ? { duration: 0.6, ease: 'easeInOut' } : { duration: 0 }}
                  >
                    <RotateCw className="w-10 h-10" />
                  </motion.div>
                  <span className="spin-btn-text">
                    {isFull ? 'SQUAD FULL' : isSpinning ? 'SPINNING…' : 'SPIN FOR FRANCHISE'}
                  </span>
                </motion.button>

                {isFull && (
                  <p className="spin-full-msg">
                    Your XI is complete! Hit <strong>SIMULATE</strong> to begin.
                  </p>
                )}
              </motion.div>
            ) : (
              /* ── STATE 2: Pick from Spun Franchise ── */
              <motion.div
                key="pick-state"
                className="pick-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                {/* Franchise Header */}
                <div
                  className="spun-franchise-header"
                  style={{
                    '--franchise-color': getFranchiseColor(currentSpunTeam),
                  } as React.CSSProperties}
                >
                  <motion.div
                    className="franchise-reveal"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                  >
                    <span className="franchise-code">{currentSpunTeam}</span>
                    <h2 className="franchise-name">{getFranchiseName(currentSpunTeam)}</h2>
                    <span className="franchise-pick-hint">
                      Pick a player, then choose their batting slot
                    </span>
                  </motion.div>

                  {respinsRemaining > 0 && (
                    <button
                      className="spin-skip-btn"
                      onClick={handleRespin}
                      title="Re-spin"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>RESPIN ({respinsRemaining} LEFT)</span>
                    </button>
                  )}
                </div>

                {/* Player List from Spun Team */}
                <div className="draft-pool-list">
                  {spunPlayers.map((player) => {
                    const openSlots = getAvailableSlots(player);
                    const isDisabled = openSlots.length === 0;

                    return (
                      <motion.button
                        key={player.id}
                        id={`pool-player-${player.id}`}
                        className={`draft-pool-row ${isDisabled ? 'disabled-player' : ''}`}
                        disabled={isDisabled}
                        onClick={() => handlePlayerClick(player)}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={!isDisabled ? { x: -4, backgroundColor: 'rgba(30,41,59,0.9)' } : {}}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      >
                        {/* Name + Meta */}
                        <div className="pool-row-left">
                          <span className="pool-player-name">{player.name}</span>
                          <div className="pool-meta">
                            <RoleBadge role={player.role} />
                            <span className="pool-slots-tag">
                              Slots {formatSlotRange(player.allowedSlots)}
                            </span>
                            <StarDots player={player} />
                          </div>
                        </div>

                          {/* Stats */}
                          <div className="flex flex-row items-center space-x-3 sm:space-x-4 shrink-0 pr-2">
                            <StatCell label="BAT" value={player.batRating} hidden={difficulty === 'HARD'} />
                            <StatCell label="POW" value={player.powRating} hidden={difficulty === 'HARD'} />
                            <StatCell label="BWL" value={player.bwlRating} hidden={difficulty === 'HARD'} />
                          </div>

                        {/* No slots available indicator */}
                        {isDisabled && (
                          <span className="pool-drafted-badge">NO SLOTS</span>
                        )}
                      </motion.button>
                    );
                  })}

                  {spunPlayers.length === 0 && (
                    <div className="pool-empty">
                      <p>No available players from {getFranchiseName(currentSpunTeam)}.</p>
                      <button className="spin-respin-link" onClick={clearSpunTeam}>
                        Spin again →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* ── SLOT SELECTION MODAL ── */}
      <AnimatePresence>
        {selectedPlayer && (
          <SlotModal
            player={selectedPlayer}
            availableSlots={getAvailableSlots(selectedPlayer)}
            onSelect={handleSlotSelect}
            onClose={handleCloseModal}
          />
        )}
        <CoinTossModal 
          isOpen={showCoinToss} 
          onDecision={handleCoinTossDecision} 
        />
        <AlienMissionModal
          isOpen={showAlienMission}
          onCommence={handleCommenceChase}
        />
      </AnimatePresence>
    </div>
  );
}
