import { useState } from 'react';
import { useCareerStore } from '../../store/careerStore';
import type { CareerTier, StatKey } from '../../store/careerStore';
import type { AnyCareerEvent, BigMatchEvent } from '../../engine/careerTypes';
import { PHASE_1_EVENTS } from '../../engine/phase1Events';
import { PHASE_2_EVENTS } from '../../engine/phase2Events';
import { PHASE_3_EVENTS } from '../../engine/phase3Events';
import { RETIREMENT_EVENTS } from '../../engine/retirementEvents';
import { Wrench, X, FastForward, Play, Copy, Check, ShieldAlert } from 'lucide-react';

interface DebugHarnessProps {
  onTriggerEvent?: (event: AnyCareerEvent) => void;
  onClose: () => void;
}

export default function DebugHarness({ onTriggerEvent, onClose }: DebugHarnessProps) {
  const state = useCareerStore();
  const [copied, setCopied] = useState(false);
  const [ffCount, setFfCount] = useState(5);
  const [selectedEventId, setSelectedEventId] = useState('evt_academic_clash');
  const [activeTab, setActiveTab] = useState<'controls' | 'stats' | 'events' | 'json'>('controls');

  const allEvents: AnyCareerEvent[] = [
    ...PHASE_1_EVENTS,
    ...PHASE_2_EVENTS,
    ...PHASE_3_EVENTS,
    ...RETIREMENT_EVENTS,
  ];

  const bigMatches: BigMatchEvent[] = [
    { 
      id: 'bm_district_final', 
      category: 'BIG_MATCH',
      title: 'The District Final', 
      target: 140, 
      quality: 'grassroots', 
      bowlingDifficultyMultiplier: 0.8,
      description: 'Your final chance to impress the scouts before the draft.' 
    },
    { 
      id: 'bm_playoff_qualifier', 
      category: 'BIG_MATCH',
      title: 'The Playoff Qualifier', 
      target: 180, 
      quality: 'franchise', 
      bowlingDifficultyMultiplier: 1.0,
      description: 'A do-or-die match to get your franchise into the playoffs.'
    },
    { 
      id: 'bm_world_cup_final', 
      category: 'BIG_MATCH',
      title: 'The World Cup Final', 
      target: 210, 
      quality: 'icon', 
      bowlingDifficultyMultiplier: 1.3,
      description: 'The eyes of the world are on you. Bring the cup home.'
    },
  ];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFastForward = (turns: number) => {
    for (let i = 0; i < turns; i++) {
      state.advanceWeek();
    }
  };

  const handleTriggerEvent = (evt: AnyCareerEvent) => {
    if (onTriggerEvent) {
      onTriggerEvent(evt);
      onClose();
    }
  };

  const statsList: StatKey[] = [
    'battingRating', 'stamina', 'form', 'mentality', 'funds',
    'academicStress', 'coachFavor', 'parentalExpectations', 'popularity',
    'lockerRoomRespect', 'franchiseTrust', 'mediaHype', 'brandValue',
    'familyMorale', 'legacyScore'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                Career Debug & Test Harness <span className="text-[10px] bg-red-500 text-white font-mono px-2 py-0.5 rounded">DEV ONLY</span>
              </h2>
              <p className="text-xs text-slate-400">Live state inspector, fast-forwarding, and event spawner</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-3 text-xs font-black uppercase tracking-wider">
          <button 
            onClick={() => setActiveTab('controls')}
            className={`py-3 px-4 border-b-2 transition-all ${activeTab === 'controls' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Tier Jumps & FF
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-4 border-b-2 transition-all ${activeTab === 'stats' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Edit Stats
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`py-3 px-4 border-b-2 transition-all ${activeTab === 'events' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Trigger Events & Matches
          </button>
          <button 
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 border-b-2 transition-all ${activeTab === 'json' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Raw State JSON
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'controls' && (
            <div className="space-y-6">
              {/* Jump Tier */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3">Jump Direct to Career Tier</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(['GRASSROOTS', 'FRANCHISE_ROOKIE', 'GLOBAL_ICON', 'GLOBAL_ICON_RETIREMENT_PENDING', 'RETIRED'] as CareerTier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => state.jumpToTier(tier)}
                      className={`p-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        state.careerTier === tier 
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {tier.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Forward */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FastForward className="w-4 h-4" /> Fast Forward Turns (No Dilemma Popups)
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  {[1, 5, 10, 25].map(n => (
                    <button
                      key={n}
                      onClick={() => handleFastForward(n)}
                      className="px-4 py-2.5 bg-slate-900 border border-slate-700 hover:border-blue-400 hover:bg-slate-800 rounded-xl text-xs font-bold text-white transition-all"
                    >
                      +{n} Weeks
                    </button>
                  ))}
                  <div className="flex items-center gap-2 ml-auto">
                    <input 
                      type="number" 
                      value={ffCount} 
                      onChange={(e) => setFfCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-center text-xs font-bold text-white"
                    />
                    <button
                      onClick={() => handleFastForward(ffCount)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Run Custom FF
                    </button>
                  </div>
                </div>
              </div>

              {/* Safe Reset */}
              <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-900/40 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Debug Reset (No Hall of Fame Push)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Clears live career store without adding an entry to the permanent Hall of Fame store.</p>
                </div>
                <button
                  onClick={() => { state.resetCareer(); onClose(); }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0"
                >
                  Reset Live Save
                </button>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Directly modify any player state field. Values update live in memory.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Player Name</label>
                  <input 
                    type="text" 
                    value={state.playerName} 
                    onChange={(e) => state.setRawState({ playerName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Current Contract</label>
                  <input 
                    type="text" 
                    value={state.currentContract} 
                    onChange={(e) => state.setRawState({ currentContract: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Skill Points (SP)</label>
                  <input 
                    type="number" 
                    value={state.skillPoints} 
                    onChange={(e) => state.setRawState({ skillPoints: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                  />
                </div>

                {statsList.map((stat) => (
                  <div key={stat} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{stat}</label>
                    <input 
                      type="number" 
                      value={state[stat]} 
                      onChange={(e) => state.setRawState({ [stat]: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Force Big Match */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">Force Trigger Big Match</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {bigMatches.map((bm) => (
                    <button
                      key={bm.id}
                      onClick={() => handleTriggerEvent(bm)}
                      className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-800/80 rounded-2xl text-left transition-all group"
                    >
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 mb-1">{bm.title}</h4>
                      <p className="text-xs text-slate-400">Target {bm.target} | {bm.quality.toUpperCase()}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Force Specific Event */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3">Force Trigger Narrative Event</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-bold outline-none"
                  >
                    {allEvents.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        [{evt.category.toUpperCase()}] {evt.title} ({evt.id})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const evt = allEvents.find(e => e.id === selectedEventId);
                      if (evt) handleTriggerEvent(evt);
                    }}
                    className="btn-primary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Trigger Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Live Zustand State Dump</span>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-auto max-h-96">
                {JSON.stringify(state, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Week {state.currentWeek} | Age {state.age} | Tier: {state.careerTier}</span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold">
            Close Harness
          </button>
        </div>
      </div>
    </div>
  );
}
