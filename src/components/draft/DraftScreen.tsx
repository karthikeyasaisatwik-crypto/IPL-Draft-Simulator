import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  ClipboardList,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useCoachStore } from '../../store/coachStore';
import { PLAYERS, getStarRating, getFranchiseColor, getFranchiseName, formatSlotRange } from '../../data/players';
import type { Player, PlayerRole } from '../../engine/types';
import CoinTossModal from './CoinTossModal';
import AlienMissionModal from './AlienMissionModal';

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

function statColor(value: number): string {
  if (value >= 90) return '#a855f7';
  if (value >= 80) return '#22c55e';
  if (value >= 65) return '#eab308';
  if (value >= 40) return '#94a3b8';
  return '#64748b';
}

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

function SlotModal({
  player,
  availableSlots,
  onSelect,
  onClose,
}: {
  player: Player;
  availableSlots: number[];
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
              onClick={() => onSelect(slot - 1)}
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

export default function DraftScreen() {
  const selectedMode = useGameStore((s) => s.selectedMode);
  const difficulty = useGameStore((s) => s.difficulty);
  const resetToMenu = useGameStore((s) => s.resetToMenu);
  const currentSpunTeam = useGameStore((s) => s.currentSpunTeam);
  const spinForTeam = useGameStore((s) => s.spinForTeam);
  const currentPitch = useGameStore((s) => s.currentPitch);
  
  // Single Player State
  const singleSquad = useGameStore((s) => s.draftedSquad);
  const draftPlayerSingle = useGameStore((s) => s.draftPlayer);

  // Dual Player State
  const isDual = useGameStore((s) => s.isDualPlayerMode);
  const teamAName = useGameStore((s) => s.teamAName);
  const teamBName = useGameStore((s) => s.teamBName);
  const teamASquad = useGameStore((s) => s.teamASquad);
  const teamBSquad = useGameStore((s) => s.teamBSquad);
  const currentDraftingTeam = useGameStore((s) => s.currentDraftingTeam);
  const draftPlayerDual = useGameStore((s) => s.draftPlayerDual);
  
  // UI State for viewing the other team in dual mode
  const [viewingTeam, setViewingTeam] = useState<'A' | 'B'>(currentDraftingTeam);

  // Modals
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (spinTimer.current) clearTimeout(spinTimer.current); }, []);
  const [showCoinToss, setShowCoinToss] = useState(false);
  const [showAlienMission, setShowAlienMission] = useState(false);
  
  // Respin State
  const [teamARespins, setTeamARespins] = useState(1);
  const [teamBRespins, setTeamBRespins] = useState(1);
  const [singleRespins, setSingleRespins] = useState(1);
  
  const respinsRemaining = isDual 
    ? (currentDraftingTeam === 'A' ? teamARespins : teamBRespins)
    : singleRespins;

  // Derived state based on mode
  const currentSquad = isDual 
    ? (viewingTeam === 'A' ? teamASquad : teamBSquad)
    : singleSquad;

  const draftingSquad = isDual
    ? (currentDraftingTeam === 'A' ? teamASquad : teamBSquad)
    : singleSquad;

  const draftPlayer = isDual ? draftPlayerDual : draftPlayerSingle;
  const isViewingOtherTeam = isDual && viewingTeam !== currentDraftingTeam;

  // Auto-switch view to drafting team when turn changes
  useEffect(() => {
    if (isDual) setViewingTeam(currentDraftingTeam);
  }, [currentDraftingTeam, isDual]);

  const draftedIds = useMemo(() => {
    if (isDual) {
      return new Set([...teamASquad, ...teamBSquad].filter(Boolean).map(p => p!.id));
    }
    return new Set(singleSquad.filter(Boolean).map(p => p!.id));
  }, [isDual, teamASquad, teamBSquad, singleSquad]);

  const filledCount = draftingSquad.filter(Boolean).length;
  const totalDraftedCount = isDual ? teamASquad.filter(Boolean).length + teamBSquad.filter(Boolean).length : filledCount;
  
  const isFull = isDual ? totalDraftedCount === SQUAD_SIZE * 2 : filledCount === SQUAD_SIZE;

  const spunPlayers = useMemo(() => {
    if (!currentSpunTeam) return [];
    return PLAYERS.filter(
      (p) => p.team === currentSpunTeam && !draftedIds.has(p.id),
    );
  }, [currentSpunTeam, draftedIds]);

  const getAvailableSlots = useCallback(
    (player: Player): number[] => {
      // Must use draftingSquad's occupied slots to prevent picking a slot that is full for the active team
      const activeOccupied = new Set(draftingSquad.map((p, i) => (p ? i : -1)).filter((i) => i >= 0));
      return player.allowedSlots.filter((slot) => !activeOccupied.has(slot - 1));
    },
    [draftingSquad],
  );

  const hasEligiblePlayer = spunPlayers.some(player => getAvailableSlots(player).length > 0);
  const hasKeeper = currentSquad.slice(0, 7).some(player => player?.role === 'WK');
  const bowlingSlots = currentSquad.slice(7);
  const bowlingCount = bowlingSlots.filter(player => player?.role === 'Bowler' || player?.role === 'All-Rounder').length;
  const invalidBowling = bowlingSlots.some(player => player && player.role !== 'Bowler' && player.role !== 'All-Rounder');

  const handleSpin = useCallback(() => {
    if (isSpinning || isFull) return;
    setIsSpinning(true);
    spinTimer.current = setTimeout(() => {
      spinForTeam();
      setIsSpinning(false);
    }, 600);
  }, [isSpinning, isFull, spinForTeam]);

  const handleRespin = useCallback(() => {
    if (respinsRemaining > 0 && !isSpinning && !isFull) {
      if (isDual) {
        if (currentDraftingTeam === 'A') setTeamARespins(prev => prev - 1);
        else setTeamBRespins(prev => prev - 1);
      } else {
        setSingleRespins(prev => prev - 1);
      }
      setIsSpinning(true);
      spinTimer.current = setTimeout(() => {
        spinForTeam();
        setIsSpinning(false);
      }, 600);
    }
  }, [respinsRemaining, isDual, currentDraftingTeam, isSpinning, isFull, spinForTeam]);

  const handlePlayerClick = useCallback((player: Player) => {
    // Only allow clicking if you are viewing your own team
    if (isViewingOtherTeam) return;
    setSelectedPlayer(player);
  }, [isViewingOtherTeam]);

  const handleSlotSelect = useCallback(
    (slotIndex: number) => {
      if (!selectedPlayer) return;
      draftPlayer(selectedPlayer, slotIndex);
      setSelectedPlayer(null);
    },
    [selectedPlayer, draftPlayer],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedPlayer(null);
  }, []);

  const startSimulation = useGameStore((s) => s.startSimulation);
  const isCoachMode = useCoachStore((s) => s.isCoachMode);
  
  const handleSimulate = () => {
    if (isCoachMode || selectedMode === 'H2H') {
      setShowCoinToss(true);
    } else if (selectedMode === 'CHASE_300') {
      setShowAlienMission(true);
    } else {
      startSimulation();
    }
  };

  const handleCommenceChase = () => {
    setShowAlienMission(false);
    startSimulation();
  };

  const modeInfo = isCoachMode 
    ? { icon: <ClipboardList className="w-5 h-5 text-rose-400" />, label: 'Coach Mode' }
    : MODE_TITLES[selectedMode ?? 'H2H'];

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
            <strong>{totalDraftedCount}</strong> / {isDual ? SQUAD_SIZE * 2 : SQUAD_SIZE}
          </span>
        </div>
      </motion.header>

      {/* ── PITCH & TURN BANNERS ── */}
      <div className="w-full flex flex-col items-center gap-2 mt-4 z-10 px-4">
        {selectedMode === 'H2H' && currentPitch && (
          <div className="bg-slate-900 border border-slate-700 px-6 py-2 rounded-full text-slate-300 font-bold tracking-wider text-sm shadow-lg flex items-center gap-2">
            <span>🏏 PITCH CONDITIONS:</span>
            <span className={
              currentPitch === 'FLAT' ? 'text-blue-400' :
              currentPitch === 'DUSTY' ? 'text-amber-500' :
              currentPitch === 'GREEN' ? 'text-emerald-400' : 'text-purple-400'
            }>{currentPitch}</span>
          </div>
        )}
        
        {isDual && !isFull && (
          <div className={`px-8 py-3 rounded-xl border-2 font-black text-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-2 ${
            currentDraftingTeam === 'A' 
              ? 'bg-slate-800 border-indigo-500 text-indigo-400' 
              : 'bg-slate-800 border-emerald-500 text-emerald-400'
          }`}>
            🎯 NOW DRAFTING: {currentDraftingTeam === 'A' ? teamAName : teamBName}
          </div>
        )}
      </div>

      {/* ── GRID ── */}
      <div className="draft-grid h-[calc(100vh-220px)] min-h-0 mt-4">
        {/* ── LEFT: SQUAD ── */}
        <motion.section
          className="draft-squad-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {isDual ? (
            <div className="w-full flex border-b border-slate-800 shrink-0">
              <button 
                onClick={() => setViewingTeam('A')}
                className={`flex-1 py-3 font-bold text-sm tracking-wider transition-colors ${
                  viewingTeam === 'A' ? 'bg-indigo-900/30 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:bg-slate-800'
                }`}
              >
                {teamAName.toUpperCase()}
              </button>
              <button 
                onClick={() => setViewingTeam('B')}
                className={`flex-1 py-3 font-bold text-sm tracking-wider transition-colors ${
                  viewingTeam === 'B' ? 'bg-emerald-900/30 text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:bg-slate-800'
                }`}
              >
                {teamBName.toUpperCase()}
              </button>
            </div>
          ) : (
            <div className="draft-panel-header">
              <h2>Your Squad</h2>
            </div>
          )}

          <div className="draft-squad-list">
            {currentSquad.map((player, i) => (
              <motion.div
                key={`${isDual ? viewingTeam : 'single'}-${i}`}
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

          <div className="px-4 py-3 border-t border-slate-800 text-sm space-y-1 shrink-0" aria-live="polite">
            <p className={hasKeeper ? 'text-emerald-400' : 'text-amber-400'}>
              {hasKeeper ? '✓ Keeper selected' : 'Keeper missing — select a WK in slots 1–7'}
            </p>
            <p className={invalidBowling ? 'text-rose-400' : bowlingCount === 4 ? 'text-emerald-400' : 'text-slate-400'}>
              {invalidBowling ? 'Bowling penalty — slots 8–11 need Bowlers or All-Rounders' : `Bowling slots ready: ${bowlingCount}/4`}
            </p>
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
                <span>{isCoachMode ? 'PROCEED TO MATCH' : 'SIMULATE MATCH'}</span>
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
                    Pick <strong>{Math.min(totalDraftedCount + 1, isDual ? SQUAD_SIZE * 2 : SQUAD_SIZE)}</strong> of {isDual ? SQUAD_SIZE * 2 : SQUAD_SIZE}
                  </div>
                  <p className="spin-instruction">
                    Spin the wheel to reveal a franchise, then pick a player and choose their batting slot.
                  </p>
                </div>

                <motion.button
                  className="spin-btn"
                  id="spin-btn"
                  onClick={handleSpin}
                  disabled={isFull || isSpinning || isViewingOtherTeam}
                  whileHover={!isFull ? { scale: 1.06, boxShadow: '0 0 60px rgba(99,102,241,0.5)' } : {}}
                  whileTap={!isFull ? { scale: 0.95 } : {}}
                  style={{ opacity: isViewingOtherTeam ? 0.5 : 1 }}
                >
                  <motion.div
                    className="spin-icon-wrap"
                    animate={isSpinning ? { rotate: 720 } : { rotate: 0 }}
                    transition={isSpinning ? { duration: 0.6, ease: 'easeInOut' } : { duration: 0 }}
                  >
                    <RotateCw className="w-10 h-10" />
                  </motion.div>
                  <span className="spin-btn-text">
                    {isFull ? 'DRAFT COMPLETE' : isSpinning ? 'SPINNING…' : 'SPIN FOR FRANCHISE'}
                  </span>
                </motion.button>

                {isFull && (
                  <p className="spin-full-msg">
                    Draft is complete! Hit <strong>SIMULATE</strong> to begin.
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

                  {respinsRemaining > 0 && !isViewingOtherTeam && (
                    <button
                      className="spin-skip-btn"
                      onClick={handleRespin}
                      disabled={isSpinning || isFull}
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
                    // Also disable if we are just viewing the other team
                    const isDisabled = openSlots.length === 0 || isViewingOtherTeam || isSpinning;

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
                        {isDisabled && openSlots.length === 0 && (
                          <span className="pool-drafted-badge">NO SLOTS</span>
                        )}
                        {isDisabled && isViewingOtherTeam && openSlots.length > 0 && (
                          <span className="pool-drafted-badge">NOT YOUR TURN</span>
                        )}
                      </motion.button>
                    );
                  })}

                  {!hasEligiblePlayer && !isFull && (
                    <div className="pool-empty">
                      <p>No players from {getFranchiseName(currentSpunTeam)} fit your remaining slots.</p>
                      <p>This reroll is free and preserves your respins.</p>
                      <button className="spin-respin-link min-h-11" disabled={isSpinning || isViewingOtherTeam} onClick={handleSpin}>
                        {isSpinning ? 'Spinning…' : 'Free reroll →'}
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
        <CoinTossModal key="coin-toss"
          isOpen={showCoinToss} 
          onDecision={(userBatsFirst) => {
            setShowCoinToss(false);
            if (isCoachMode) {
              useCoachStore.getState().initCoachMatch(userBatsFirst);
            } else if (isDual) {
              useGameStore.getState().startDualH2HSimulation(userBatsFirst);
            } else {
              useGameStore.getState().startH2HSimulation(userBatsFirst);
            }
          }} 
        />
        <AlienMissionModal key="alien-mission"
          isOpen={showAlienMission}
          onCommence={handleCommenceChase}
        />
      </AnimatePresence>
    </div>
  );
}
