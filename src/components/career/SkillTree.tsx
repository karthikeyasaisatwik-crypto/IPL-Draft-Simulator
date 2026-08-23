import { useCareerStore } from '../../store/careerStore';
import { SKILL_NODES } from '../../engine/skillTreeData';
import type { SkillNode } from '../../engine/careerTypes';
import { Lock, CheckCircle2, Zap } from 'lucide-react';

export default function SkillTree() {
  const state = useCareerStore();
  const { skillPoints, unlockedSkillNodes, unlockSkill } = state;

  const handleUnlock = (node: SkillNode) => {
    if (skillPoints >= node.spCost) {
      unlockSkill(node.id, node.spCost);
    }
  };

  const isUnlocked = (nodeId: string) => unlockedSkillNodes.includes(nodeId);
  const isAffordable = (cost: number) => skillPoints >= cost;
  const isPrerequisiteMet = (reqId?: string) => !reqId || isUnlocked(reqId);

  const getStatusColor = (node: SkillNode) => {
    if (isUnlocked(node.id)) return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
    if (isPrerequisiteMet(node.prerequisiteId)) {
      return isAffordable(node.spCost) 
        ? 'border-amber-500 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer'
        : 'border-slate-600 bg-slate-800 text-slate-400 cursor-not-allowed';
    }
    return 'border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed opacity-50';
  };

  const renderNode = (node: SkillNode) => {
    const unlocked = isUnlocked(node.id);
    const prereqMet = isPrerequisiteMet(node.prerequisiteId);
    
    return (
      <div 
        key={node.id} 
        onClick={() => prereqMet && isAffordable(node.spCost) && !unlocked && handleUnlock(node)}
        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 relative z-10 w-48 ${getStatusColor(node)}`}
      >
        <div className="absolute -top-3 -right-3">
          {unlocked ? (
            <div className="bg-emerald-500 rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div>
          ) : !prereqMet ? (
            <div className="bg-slate-700 rounded-full p-1"><Lock className="w-4 h-4 text-slate-400" /></div>
          ) : null}
        </div>
        
        <h4 className="font-bold text-sm tracking-wider uppercase">{node.name}</h4>
        <p className="text-[10px] leading-tight">{node.description}</p>
        
        {!unlocked && (
          <div className="mt-2 bg-black/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
            <Zap className="w-3 h-3 text-accent-gold" /> {node.spCost} SP
          </div>
        )}
      </div>
    );
  };

  const chasingNodes = SKILL_NODES.filter(n => n.id.startsWith('chasing_'));
  const leadershipNodes = SKILL_NODES.filter(n => n.id.startsWith('leadership_'));

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Ultimate Skill Tree</h2>
          <p className="text-slate-400 text-sm">Earn 1 SP for every 20 Legacy points.</p>
        </div>
        <div className="bg-slate-950 border border-amber-500/30 px-6 py-3 rounded-xl flex items-center gap-3">
          <Zap className="w-6 h-6 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Available</span>
            <span className="text-2xl font-black text-amber-500 leading-none">{skillPoints} SP</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12 justify-around">
        {/* Chasing Branch */}
        <div className="flex flex-col items-center gap-6 relative">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-700 pb-2 w-full text-center">Chasing Branch</h3>
          {/* Connecting Lines */}
          <div className="absolute top-16 bottom-16 left-1/2 w-1 bg-slate-800 -translate-x-1/2 z-0"></div>
          {chasingNodes.map(renderNode)}
        </div>

        {/* Leadership Branch */}
        <div className="flex flex-col items-center gap-6 relative">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-700 pb-2 w-full text-center">Leadership Branch</h3>
          {/* Connecting Lines */}
          <div className="absolute top-16 bottom-16 left-1/2 w-1 bg-slate-800 -translate-x-1/2 z-0"></div>
          {leadershipNodes.map(renderNode)}
        </div>
      </div>
    </div>
  );
}
