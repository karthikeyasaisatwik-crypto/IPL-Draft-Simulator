import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { FastForward, Play, SkipForward } from 'lucide-react';
import type { OverSummary } from '../../engine/types';

interface TickerFrame {
  inningsIndex: number;
  teamName: string;
  overData: OverSummary;
  isEnd: boolean;
}

export default function ProgressTicker() {
  const result = useGameStore((s) => s.lastMatchResult);
  const finishSimulation = useGameStore((s) => s.finishSimulation);

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!result) {
      finishSimulation();
    }
  }, [result, finishSimulation]);

  // Flatten the match into a linear sequence of frames
  const frames: TickerFrame[] = [];
  if (result) {
    result.innings.forEach((inn, iIndex) => {
      inn.overLogs.forEach(ol => {
        frames.push({
          inningsIndex: iIndex,
          teamName: inn.teamName,
          overData: ol,
          isEnd: false
        });
      });
      // Add an innings break or end frame
      frames.push({
        inningsIndex: iIndex,
        teamName: inn.teamName,
        overData: { overNumber: 0, summaryText: 'INNINGS COMPLETE', runs: 0, wickets: 0 },
        isEnd: true
      });
    });
  }

  useEffect(() => {
    if (!result || frames.length === 0) return;

    const tick = () => {
      setCurrentFrameIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        
        if (nextIndex <= frames.length) {
          const frame = frames[nextIndex - 1];
          let eventString = '';
          
          if (frame.isEnd) {
             eventString = `--- INNINGS ${frame.inningsIndex + 1} COMPLETE (${frame.teamName}) ---`;
          } else {
             const overData = frame.overData;
             eventString = `Ov ${overData.overNumber} (${frame.teamName}): ${overData.runs} runs. ${overData.summaryText}`;
             if (overData.wickets > 0) {
               eventString = `OUT! Wicket falls in Over ${overData.overNumber} (${frame.teamName})`;
             }
          }
          
          setDisplayedLogs((prev) => [...prev, eventString]);
        }

        if (nextIndex >= frames.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => { finishSimulation(); }, 2000);
          return prevIndex;
        }

        return nextIndex;
      });
    };

    intervalRef.current = setInterval(tick, animationSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [result, animationSpeed, finishSimulation, frames.length]);

  if (!result || frames.length === 0) return null;

  // Calculate current state
  const activeFrame = frames[Math.min(currentFrameIndex, frames.length - 1)];
  const currentInnings = result.innings[activeFrame.inningsIndex];
  
  // Calculate runs/wickets for the *current innings* up to this frame
  let currentRuns = 0;
  let currentWickets = 0;
  let currentOvers = '0.0';

  if (!activeFrame.isEnd && currentFrameIndex > 0) {
    // Find all frames in this innings up to the current one
    const inningsFrames = frames.slice(0, currentFrameIndex).filter(f => f.inningsIndex === activeFrame.inningsIndex && !f.isEnd);
    currentRuns = inningsFrames.reduce((sum, f) => sum + f.overData.runs, 0);
    currentWickets = inningsFrames.reduce((sum, f) => sum + f.overData.wickets, 0);
    currentOvers = `${inningsFrames.length}.0`;
  } else if (activeFrame.isEnd) {
    currentRuns = currentInnings.totalRuns;
    currentWickets = currentInnings.totalWickets;
    currentOvers = currentInnings.oversBowled;
  }

  // Calculate Target (if in Innings 2)
  let targetBanner = 'SETTING TARGET...';
  let targetScore = 300; // default for Chase 300
  if (activeFrame.inningsIndex === 1 && result.innings.length > 1) {
    targetScore = result.innings[0].totalRuns + 1;
    targetBanner = `TARGET · ${targetScore}`;
  } else if (result.innings.length === 1) {
    targetBanner = `TARGET · 300`;
  }

  const oversFacedNum = parseFloat(currentOvers);
  const currentRunRate = oversFacedNum > 0 ? (currentRuns / Math.floor(oversFacedNum)).toFixed(2) : '0.00';
  const progressPercent = Math.min((currentRuns / targetScore) * 100, 100);

  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    finishSimulation();
  };

  return (
    <motion.div
      className="ticker-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="ticker-container">
        
        <header className="ticker-header">
          <div className="ticker-target-banner">{targetBanner}</div>
          
          <div className="text-xl font-bold text-gray-400 mb-2 mt-4">{activeFrame.teamName.toUpperCase()}</div>
          
          <div className="ticker-score-massive">
            {currentRuns} <span className="ticker-wickets">/ {currentWickets}</span>
          </div>
          
          <div className="ticker-meta">
            <span className="ticker-overs">{currentOvers} OV</span>
            <span className="ticker-dot">·</span>
            <span className="ticker-rr">RR {currentRunRate}</span>
          </div>

          <div className="ticker-progress-bg">
            <motion.div 
              className="ticker-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </header>

        <div className="ticker-feed">
          <div className="ticker-feed-inner">
            <AnimatePresence initial={false}>
              {displayedLogs.map((log, i) => (
                <motion.div
                  key={i}
                  className={`ticker-event ${log.includes('OUT') ? 'event-wicket' : ''} ${log.includes('INNINGS COMPLETE') ? 'event-innings-break text-center text-accent-gold' : ''}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <footer className="ticker-controls">
          <button 
            className={`ticker-btn ${animationSpeed === 200 ? 'active' : ''}`}
            onClick={() => setAnimationSpeed(animationSpeed === 800 ? 200 : 800)}
          >
            {animationSpeed === 800 ? <FastForward className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {animationSpeed === 800 ? 'FAST' : 'NORMAL'}
          </button>
          
          <button className="ticker-btn skip" onClick={handleSkip}>
            <SkipForward className="w-5 h-5" />
            SKIP TO END
          </button>
        </footer>

      </div>
    </motion.div>
  );
}
