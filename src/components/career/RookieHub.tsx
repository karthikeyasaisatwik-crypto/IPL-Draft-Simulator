import RetirementScreen from './RetirementScreen';
import ArchetypeSelectScreen from './ArchetypeSelectScreen';
import DebugHarness from './DebugHarness';
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCareerStore, STAT_DIRECTIONS } from '../../store/careerStore';
import type { StatKey } from '../../store/careerStore';
import { getNextCareerEvent } from '../../engine/careerLoop';
import type { AnyCareerEvent } from '../../engine/careerTypes';
import EventModal from './EventModal';
import { BigMatchScreen } from './BigMatchScreen';
import SkillTree from './SkillTree';
import CareerDevelopment from './CareerDevelopment';
import { useGameStore } from '../../store/gameStore';
import { Calendar, Shield, Activity, TrendingUp, TrendingDown, Package, Zap, Award, Star, Wrench } from 'lucide-react';

export default function RookieHub() {
  const state = useCareerStore();
  const [activeEvent, setActiveEvent] = useState<AnyCareerEvent | null>(null);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showDebugHarness, setShowDebugHarness] = useState(false);

  const handleAdvance = useCallback(() => {
    if (state.transitionModalText) return;
    const nextEvent = getNextCareerEvent(state);
    if (nextEvent) {
      state.recordEventShown(nextEvent.id);
      setActiveEvent(nextEvent);
    } else {
      state.advanceWeek();
    }
  }, [state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.hasSelectedArchetype || state.careerTier === 'RETIRED' || showSkillTree || showDebugHarness || e.repeat) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select, button, a, [contenteditable], [role=button]')) return;
      // Toggle debug with backtick if in DEV mode
      if (import.meta.env.DEV && e.key === '`' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // e.preventDefault();
        // setShowDebugHarness(prev => !prev);
      }

      if (!activeEvent && !state.transitionModalText && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeEvent, state, showSkillTree, showDebugHarness, handleAdvance]);

  if (!state.hasSelectedArchetype) {
    return <ArchetypeSelectScreen />;
  }

  if (state.careerTier === 'RETIRED') {
    return <RetirementScreen />;
  }



  const handleCompleteEvent = () => {
    setActiveEvent(null);
    state.advanceWeek();
  };

  const getBarColor = (stat: StatKey, value: number) => {
    const dir = STAT_DIRECTIONS[stat];
    if (dir === 'good-high') {
      if (value >= 60) return 'bg-emerald-500';
      if (value >= 20) return 'bg-amber-500';
      return 'bg-rose-500';
    }
    if (dir === 'good-low') {
      if (value <= 50) return 'bg-emerald-500';
      if (value <= 80) return 'bg-amber-500';
      return 'bg-rose-500';
    }
    if (value >= 80) return 'bg-purple-500';
    if (value >= 40) return 'bg-blue-500';
    return 'bg-slate-500';
  };

  const formatStatName = (key: string) => {
    if (key === 'parentalExpectations' && state.careerTier !== 'GRASSROOTS') return 'Family Expectations';
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getActiveModifiersForStat = (stat: StatKey) => {
    return state.activeModifiers.filter(m => m.stat === stat);
  };

  let lifeStatsGroups: { title: string; stats: StatKey[] }[] = [];

  if (state.careerTier === 'GRASSROOTS') {
    lifeStatsGroups = [
      { title: 'Life Stats', stats: ['academicStress', 'coachFavor', 'parentalExpectations', 'popularity', 'lockerRoomRespect'] }
    ];
  } else if (state.careerTier === 'FRANCHISE_ROOKIE') {
    lifeStatsGroups = [
      { title: 'Life Stats', stats: ['parentalExpectations', 'popularity', 'lockerRoomRespect', 'franchiseTrust', 'mediaHype'] }
    ];
  } else {
    lifeStatsGroups = [
      { title: 'Career', stats: ['franchiseTrust', 'lockerRoomRespect'] },
      { title: 'Media & Brand', stats: ['mediaHype', 'brandValue', 'popularity'] },
      { title: 'Family', stats: ['parentalExpectations', 'familyMorale'] }
    ];
  }

  const staminaModifiers = getActiveModifiersForStat('stamina');

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 md:p-8 max-w-7xl mx-auto gap-8 relative">
      <AnimatePresence>
        {state.transitionModalText && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-900 border border-amber-500/50 p-10 rounded-3xl max-w-xl text-center shadow-2xl">
              <h3 className="text-3xl font-black text-white mb-6">Milestone Reached</h3>
              <p className="text-slate-300 text-lg mb-10 leading-relaxed">{state.transitionModalText}</p>
              <button onClick={() => state.clearTransitionModal()} className="btn-primary w-full py-4 rounded-xl text-lg font-black tracking-widest uppercase">Continue</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="bg-slate-900 border border-slate-700 p-8 rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Calendar className="w-6 h-6 text-accent-gold" />
            <h1 className="text-4xl font-black text-white flex items-center gap-4 flex-wrap">
              Week {state.currentWeek} <span className="text-slate-600 font-light">|</span> Age {state.age}
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-md uppercase tracking-wider font-bold">
                {state.archetype === 'PRODIGY' ? 'The Prodigy' : state.archetype === 'GRINDER' ? 'The Grinder' : 'All-Rounder'}
              </span>
              {state.isCaptain && (
                <span className="text-xs bg-emerald-500 text-white px-2.5 py-1 rounded-md uppercase tracking-widest font-black shadow-sm">
                  Captain (C)
                </span>
              )}
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">
            {state.careerTier === 'GRASSROOTS' 
              ? `Phase 1: Grassroots Grind — Week ${state.currentWeek}` 
              : state.careerTier === 'FRANCHISE_ROOKIE'
                ? `Phase 2: Franchise Rookie — ${state.currentContract}`
                : state.careerTier === 'GLOBAL_ICON'
                  ? `Phase 3: Global Icon — ${state.currentContract}`
                  : `Farewell Tour`}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 w-full lg:w-80 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
            <span className="text-slate-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Stamina
            </span>
            <div className="flex items-center gap-2">
              {staminaModifiers.map(mod => (
                <span key={mod.id} className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                  {mod.label} ({mod.perTurnDelta > 0 ? '+' : ''}{mod.perTurnDelta}/w, {mod.turnsRemaining}w)
                </span>
              ))}
              <span className="text-white text-lg">{state.stamina}<span className="text-slate-600 text-sm">/100</span></span>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${state.stamina > 50 ? 'bg-amber-400' : state.stamina > 20 ? 'bg-amber-600' : 'bg-rose-500'}`}
              style={{ width: `${state.stamina}%` }}
            />
          </div>
        </div>
      </header>
      
      {(
        <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-lg">
          <div className="flex items-center gap-5">
            <Award className="w-10 h-10 text-amber-400" />
            <div>
              <p className="text-xs uppercase font-black tracking-widest text-slate-500 mb-1">Career progression</p>
              <p className="text-3xl font-black text-amber-400 leading-none">{state.skillPoints} SP <span className="text-sm text-slate-400">· {state.careerXp % 40}/40 XP · {state.legacyScore} Legacy</span></p>
            </div>
          </div>
          <button 
            onClick={() => setShowSkillTree(!showSkillTree)}
            className="btn-secondary px-8 py-3 rounded-full text-sm font-black tracking-widest uppercase flex items-center gap-3 transition-all"
          >
            <Star className="w-5 h-5" /> {showSkillTree ? 'Hide Skills' : 'Skill Tree'}
            {state.skillPoints > 0 && <span className="bg-amber-500 text-black px-2 py-0.5 rounded-full text-xs animate-pulse">{state.skillPoints} SP</span>}
          </button>
        </div>
      )}

      <button type="button" onClick={() => useGameStore.getState().resetToMenu()} className="self-start text-sm text-slate-400 hover:text-white min-h-11">← Menu · career autosaved</button>
      {!showSkillTree && <CareerDevelopment disabled={!!activeEvent || !!state.transitionModalText || showDebugHarness} />}
      {showSkillTree ? (
        <div className="flex-1">
          <SkillTree />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-xl flex flex-col">
            {lifeStatsGroups.map((group, groupIdx) => (
              <div key={groupIdx} className={groupIdx > 0 ? "mt-8" : ""}>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                  <Activity className="w-5 h-5 text-blue-400" /> {group.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 flex-1">
                  {group.stats.map((statKey) => {
                    const val = state[statKey as keyof typeof state] as number;
                    const dir = STAT_DIRECTIONS[statKey];
                    const modifiers = getActiveModifiersForStat(statKey);

                    return (
                      <div key={statKey} className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            {formatStatName(statKey)}
                            {modifiers.map(mod => (
                              <span 
                                key={mod.id} 
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                  mod.perTurnDelta > 0 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {mod.label} ({mod.perTurnDelta > 0 ? '+' : ''}{mod.perTurnDelta}/w, {mod.turnsRemaining}w)
                              </span>
                            ))}
                          </span>
                          <div className="flex items-center gap-2">
                            {dir === 'good-high' && <TrendingUp className="w-4 h-4 text-slate-600" />}
                            {dir === 'good-low' && <TrendingDown className="w-4 h-4 text-slate-600" />}
                            <span className="text-white font-mono text-lg">{val}</span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${getBarColor(statKey, val)}`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-8">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-xl">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                <Shield className="w-5 h-5 text-emerald-400" /> Cricket Profile
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center justify-center">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Batting</p>
                  <p className="text-3xl font-black text-white">{state.battingRating}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center justify-center">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Form</p>
                  <p className="text-3xl font-black text-white">{state.form}</p>
                  {getActiveModifiersForStat('form').map(mod => (
                    <span key={mod.id} className="text-[9px] text-emerald-400 font-bold mt-1 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40">
                      ⚡ {mod.label} (+{mod.perTurnDelta}/w)
                    </span>
                  ))}
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center justify-center">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Mentality</p>
                  <p className="text-3xl font-black text-white">{state.mentality}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center justify-center">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Funds</p>
                  <p className="text-xl font-black text-emerald-400">₹{state.funds.toLocaleString()}</p>
                  {state.managerCommissionRate > 0 && (
                    <p className="text-[9px] text-rose-400 uppercase font-bold mt-1">-{state.managerCommissionRate * 100}% Agent Cut</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-xl flex-1">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                <Package className="w-5 h-5 text-purple-400" /> Inventory
              </h2>
              <div className="flex flex-col gap-4">
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Primary Bat</span>
                  <span className="text-base font-bold text-white">{state.currentBat}</span>
                </div>
                {state.equipment.map((item, idx) => (
                  <div key={idx} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Gear</span>
                    <span className="text-base font-bold text-purple-300">{item}</span>
                  </div>
                ))}
                {state.unlockedSponsorships.map((item, idx) => (
                  <div key={`s_${idx}`} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-500">Sponsor</span>
                    <span className="text-base font-bold text-amber-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!showSkillTree && (
        <div className="mt-4 pb-4">
          <button 
            onClick={handleAdvance}
            disabled={!!activeEvent || !!state.transitionModalText || showDebugHarness}
            className="w-full btn-primary py-6 text-xl font-black uppercase tracking-widest rounded-3xl shadow-[0_0_40px_rgba(37,99,235,0.2)] hover:shadow-[0_0_60px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
          >
            Advance to Next Week
            <span className="text-xs text-blue-200/50 tracking-widest uppercase">Press Space or Enter</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {activeEvent && (
          activeEvent.category === 'BIG_MATCH' ? (
            <BigMatchScreen
              event={activeEvent as any}
              onClose={handleCompleteEvent}
            />
          ) : (
            <EventModal key={`${state.currentWeek}-${activeEvent.id}`}
              event={activeEvent as any}
              onComplete={handleCompleteEvent}
            />
          )
        )}
      </AnimatePresence>

      {/* DEV-ONLY DEBUG HARNESS TRIGGER */}
      {import.meta.env.DEV && (
        <>
          <button
            onClick={() => setShowDebugHarness(true)}
            className="fixed bottom-4 left-4 z-40 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-2xl border border-amber-300 transition-transform hover:scale-105"
            title="Open Career Debug Harness (Dev Only)"
          >
            <Wrench className="w-4 h-4" />
            DEV HARNESS
          </button>

          {showDebugHarness && (
            <DebugHarness
              onTriggerEvent={(evt) => setActiveEvent(evt)}
              onClose={() => setShowDebugHarness(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
