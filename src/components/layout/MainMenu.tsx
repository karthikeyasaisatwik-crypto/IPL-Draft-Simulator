import { useState } from "react";
import { Swords, Shield, Target, ChevronRight, Zap, Trophy } from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import type { GameMode } from "../../engine/types";
import { Logo } from "../Logo";

export default function MainMenu() {
  const [showRules, setShowRules] = useState(false);
  const selectMode = useGameStore((s) => s.selectMode);
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const chase300HighScore = useGameStore((s) => s.chase300HighScore);

  const handleSelect = (mode: GameMode) => {
    selectMode(mode);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between py-6 px-4 md:px-8 max-w-7xl mx-auto font-sans">
      
      {/* 1. HEADER */}
      <div className="w-full flex flex-col items-center text-center shrink-0">
        <div className="drop-shadow-[0_0_30px_rgba(251,191,36,0.35)]">
          <Logo className="w-16 h-16 md:w-20 md:h-20" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3 mb-1.5">
          <span className="text-orange-500">IPL</span> Draft Simulator
        </h1>
        <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto">
          Draft your dream XI • Watch the match unfold with a full ball-by-ball sim.
        </p>

        {/* 2. TOGGLE & SCORE */}
        <div className="mt-4 flex flex-col items-center gap-2.5">
          <div className="flex flex-row items-center justify-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-full shadow-inner">
            <button
              className={`px-6 py-1.5 rounded-full text-xs md:text-sm font-extrabold tracking-wider transition-all duration-200 ${
                difficulty === "EASY"
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setDifficulty("EASY")}
            >
              EASY
            </button>
            <button
              className={`px-6 py-1.5 rounded-full text-xs md:text-sm font-extrabold tracking-wider transition-all duration-200 ${
                difficulty === "HARD"
                  ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setDifficulty("HARD")}
            >
              HARD
            </button>
          </div>
          {chase300HighScore > 0 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Chase 300 High Score: <span className="text-amber-300 font-extrabold">{chase300HighScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. GAME CARDS (Balanced Grid with guaranteed vertical height and spacing) */}
      <div className="w-full max-w-6xl mx-auto my-8 px-2 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch w-full">
          
          {/* Card 1: H2H */}
          <div
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] hover:-translate-y-1 cursor-pointer group"
            onClick={() => handleSelect("H2H")}
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-md bg-gradient-to-br from-indigo-500 to-purple-600">
                <Swords className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 mb-1 block">Head to Head</span>
              <h2 className="text-xl md:text-2xl font-black text-white mb-2">H2H Exhibition</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">Draft your dream XI • Watch the match unfold with a full ball-by-ball sim.</p>
              <ul className="space-y-2 mb-6 w-full text-xs text-slate-300">
                <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 shrink-0 text-indigo-400" /><span>AI drafts opponent XI</span></li>
                <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 shrink-0 text-indigo-400" /><span>2-innings match</span></li>
                <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 shrink-0 text-indigo-400" /><span>Dynamic match ticker</span></li>
              </ul>
            </div>
            <div className="mt-auto w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center gap-1.5 transition-all">
              <span>Select Mode</span><ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Gauntlet */}
          <div
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between opacity-70 cursor-not-allowed grayscale"
            onClick={() => alert("IPL Gauntlet Mode is Coming Soon!")}
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-md bg-gradient-to-br from-amber-500 to-red-500">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 mb-1 block">Campaign Mode</span>
              <h2 className="text-xl md:text-2xl font-black text-white mb-2">IPL Gauntlet</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">Take on every IPL franchise in order. Win the league or fall trying.</p>
              <ul className="space-y-2 mb-6 w-full text-xs text-slate-300">
                <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 shrink-0 text-amber-400" /><span>10-match campaign</span></li>
                <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 shrink-0 text-amber-400" /><span>Rising difficulty</span></li>
                <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 shrink-0 text-amber-400" /><span>Win/loss record</span></li>
              </ul>
            </div>
            <div className="mt-auto w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400/60 flex items-center justify-center gap-1.5">
              <span>COMING SOON</span>
            </div>
          </div>

          {/* Card 3: Chase 300 */}
          <div
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:-translate-y-1 cursor-pointer group"
            onClick={() => handleSelect("CHASE_300")}
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-md bg-gradient-to-br from-emerald-500 to-cyan-500">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 mb-1 block">Survival Mode</span>
              <h2 className="text-xl md:text-2xl font-black text-white mb-2">Chase 300</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">Chase down 300 in 20 overs against maximum-difficulty bowling. Can your XI survive?</p>
              <ul className="space-y-2 mb-6 w-full text-xs text-slate-300">
                <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 shrink-0 text-emerald-400" /><span>Target: 300 runs</span></li>
                <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 shrink-0 text-emerald-400" /><span>Max alien difficulty</span></li>
                <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 shrink-0 text-emerald-400" /><span>Single innings</span></li>
              </ul>
            </div>
            <div className="mt-auto w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center gap-1.5 transition-all">
              <span>Select Mode</span><ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. RULES & RATINGS (Dedicated section positioned cleanly below cards) */}
      <div className="w-full max-w-3xl mx-auto mb-8 flex flex-col items-center px-4 shrink-0">
        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full sm:w-auto px-8 py-3 bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 hover:bg-slate-800 text-slate-200 text-xs md:text-sm font-extrabold tracking-widest uppercase rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg backdrop-blur-md hover:shadow-cyan-500/10"
        >
          <span>RULES & RATINGS</span>
          <span className="text-amber-400 text-xs">{showRules ? "▲" : "▼"}</span>
        </button>

        {showRules && (
          <div className="w-full mt-6 space-y-6 text-left">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-black text-white tracking-wide uppercase">How It Works</h2>
              </div>
              <div className="space-y-3 text-xs md:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 bg-slate-800/40 p-3 rounded-xl border border-white/5">
                  <span className="font-extrabold text-amber-400 sm:w-32 shrink-0 tracking-wider">SPIN:</span>
                  <span className="text-slate-300 leading-relaxed">Land on random IPL franchises to build your squad. You have limited global respins.</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 bg-slate-800/40 p-3 rounded-xl border border-white/5">
                  <span className="font-extrabold text-cyan-400 sm:w-32 shrink-0 tracking-wider">DRAFT:</span>
                  <span className="text-slate-300 leading-relaxed">Pick 11 players for specific batting slots. Players can only be drafted in their designated slot ranges.</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 bg-slate-800/40 p-3 rounded-xl border border-white/5">
                  <span className="font-extrabold text-indigo-400 sm:w-32 shrink-0 tracking-wider">BALANCE:</span>
                  <span className="text-slate-300 leading-relaxed">You MUST draft a Wicket-Keeper (WK). Slots 8-11 MUST be Bowlers or All-Rounders. Ignoring these rules triggers massive simulation penalties.</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 bg-slate-800/40 p-3 rounded-xl border border-white/5">
                  <span className="font-extrabold text-emerald-400 sm:w-32 shrink-0 tracking-wider">CONDITIONS:</span>
                  <span className="text-slate-300 leading-relaxed">Every match generates a hidden pitch variance. Expect anything from 130-run spinning tracks to 220-run flat highways.</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 bg-slate-800/40 p-3 rounded-xl border border-white/5">
                  <span className="font-extrabold text-rose-400 sm:w-32 shrink-0 tracking-wider">SIMULATE:</span>
                  <span className="text-slate-300 leading-relaxed">Watch the ball-by-ball T20 match unfold. Face off in H2H or try to save Earth by chasing 300 against superior alien genetics.</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
                <Trophy className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-black text-white tracking-wide uppercase">Reading a Player</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 font-extrabold text-base tracking-wider">BAT</span>
                    <span className="text-[10px] bg-amber-400/10 text-amber-300 border-amber-400/20 px-2 py-0.5 rounded-full border font-bold">Quality</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">Base batting skill. Determines a batter’s ability to survive, rotate strike, and avoid wickets against elite bowling.</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 hover:border-rose-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-rose-400 font-extrabold text-base tracking-wider">POW</span>
                    <span className="text-[10px] bg-rose-400/10 text-rose-300 border-rose-400/20 px-2 py-0.5 rounded-full border font-bold">Power</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">Boundary hitting and strike rate. Crucial for clearing the ropes, especially during the Death Overs (16-20).</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 hover:border-cyan-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 font-extrabold text-base tracking-wider">BWL</span>
                    <span className="text-[10px] bg-cyan-400/10 text-cyan-300 border-cyan-400/20 px-2 py-0.5 rounded-full border font-bold">Bowling</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">Bowling mastery. Dictates the ability to take wickets, bowl dot balls, and neutralize high POW batters.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. FOOTER */}
      <div className="w-full max-w-3xl mx-auto mt-auto pt-6 pb-2 flex flex-col items-center text-center text-xs text-slate-400 shrink-0">
        <p className="text-slate-500 text-xs mb-3">Select a game mode to begin drafting your XI</p>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
          <a href="https://x.com/VkRkMb" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-blue-400 transition-colors font-medium">𝕏 Follow on X</a>
          <a href="https://www.instagram.com/karthik_b_200x?igsh=MXJuamk2cWRwb3g5Ng==" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-pink-500 transition-colors font-medium">📸 Instagram</a>
          <a href="https://x.com/VkRkMb" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-green-400 transition-colors font-medium">💬 DM for Feedback</a>
        </div>
      </div>

    </div>
  );
}