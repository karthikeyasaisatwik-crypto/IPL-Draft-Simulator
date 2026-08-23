import { useState } from 'react';
import { useCareerStore } from '../../store/careerStore';
import type { Archetype } from '../../engine/careerTypes';
import { ARCHETYPE_CONFIG } from '../../engine/careerTypes';
import { Trophy, Zap, Users, Heart, Sparkles, Shield, Compass, ChevronRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArchetypeSelectScreen() {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>('PRODIGY');
  const [playerName, setPlayerName] = useState('Rookie');
  const initializeArchetype = useCareerStore((s) => s.initializeArchetype);

  const archetypes: Archetype[] = ['PRODIGY', 'GRINDER', 'ALL_ROUNDER'];

  const getIcon = (type: Archetype) => {
    switch (type) {
      case 'PRODIGY':
        return <Sparkles className="w-8 h-8 text-amber-400" />;
      case 'GRINDER':
        return <Shield className="w-8 h-8 text-emerald-400" />;
      case 'ALL_ROUNDER':
        return <Compass className="w-8 h-8 text-blue-400" />;
    }
  };

  const handleStart = () => {
    initializeArchetype(selectedArchetype, playerName);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 md:p-8 max-w-6xl mx-auto gap-8 animate-in fade-in duration-500">
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
          <Trophy className="w-4 h-4" /> The Long Innings — Career Setup
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider">
          Choose Your Rookie Archetype
        </h1>
        <p className="text-slate-400 text-base max-w-2xl mx-auto">
          Every legend begins somewhere. Your starting archetype shapes your baseline cricket talent, physical endurance, and the pressures you face at age 18.
        </p>
      </header>

      {/* Name Input Box */}
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-md mx-auto w-full shadow-xl flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <User className="w-4 h-4 text-amber-400" /> Player Name
        </label>
        <input 
          type="text" 
          value={playerName} 
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={24}
          placeholder="Enter player name..."
          className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-lg font-bold text-white outline-none transition-colors"
        />
      </div>

      {/* Archetype Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {archetypes.map((type) => {
          const cfg = ARCHETYPE_CONFIG[type];
          const isSelected = selectedArchetype === type;

          return (
            <motion.div
              key={type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedArchetype(type)}
              className={`relative cursor-pointer rounded-3xl p-6 border-2 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.25)]'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900/80'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Selected
                </div>
              )}

              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4">
                  {getIcon(type)}
                </div>
                
                <h3 className="text-2xl font-black text-white mb-1">{cfg.title}</h3>
                <p className="text-xs font-bold text-amber-400/90 uppercase tracking-wider mb-4">{cfg.tagline}</p>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{cfg.flavor}"</p>
              </div>

              <div className="space-y-2.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Batting Rating</span>
                  <span className="text-white font-mono text-sm">{cfg.battingRating}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Stamina</span>
                  <span className="text-white font-mono text-sm">{cfg.stamina}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /> Dressing Room Respect</span>
                  <span className="text-white font-mono text-sm">{cfg.lockerRoomRespect}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-400" /> Parental Expectations</span>
                  <span className="text-white font-mono text-sm">{cfg.parentalExpectations}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={handleStart}
          className="btn-primary py-5 px-12 text-lg font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_45px_rgba(37,99,235,0.5)] transition-all inline-flex items-center gap-3"
        >
          Begin The Long Innings <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
