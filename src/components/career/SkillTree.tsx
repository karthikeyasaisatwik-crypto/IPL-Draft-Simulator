import { useCareerStore } from '../../store/careerStore';
import { SKILL_NODES } from '../../engine/skillTreeData';
import { Lock, CheckCircle2, Zap } from 'lucide-react';

const BRANCHES = [
  { prefix: 'chasing_', name: 'Chasing', description: 'Hold your nerve when the target climbs.' },
  { prefix: 'leadership_', name: 'Leadership', description: 'Make the batter at the other end better.' },
  { prefix: 'fitness_', name: 'Resilience', description: 'Recover faster and handle setbacks.' },
  { prefix: 'craft_', name: 'Craft & connections', description: 'Train with purpose and build trust.' },
];

export default function SkillTree() {
  const { skillPoints, unlockedSkillNodes, unlockSkill } = useCareerStore();
  return (
    <section className="bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-7 shadow-xl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">Build your player</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">Start with 3 SP. Earn 1 SP per 40 career XP, claim goal rewards, and earn 1 SP for every 20 Legacy points. Perks in each branch stack.</p>
        </div>
        <span className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-xl text-amber-400 text-xl font-bold flex items-center gap-2" role="status"><Zap className="w-5 h-5" /> {skillPoints} SP</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {BRANCHES.map(branch => (
          <div key={branch.prefix} className="space-y-4">
            <div className="min-h-20"><h3 className="text-lg font-bold text-white">{branch.name}</h3><p className="text-sm text-slate-400 mt-1">{branch.description}</p></div>
            {SKILL_NODES.filter(node => node.id.startsWith(branch.prefix)).map(node => {
              const unlocked = unlockedSkillNodes.includes(node.id);
              const prerequisite = SKILL_NODES.find(n => n.id === node.prerequisiteId);
              const ready = !node.prerequisiteId || unlockedSkillNodes.includes(node.prerequisiteId);
              const affordable = skillPoints >= node.spCost;
              return (
                <button type="button" key={node.id} onClick={() => unlockSkill(node.id)} disabled={unlocked || !ready || !affordable}
                  className={`w-full text-left p-4 rounded-2xl border-2 min-h-40 flex flex-col gap-3 transition-colors ${unlocked ? 'border-emerald-500/50 bg-emerald-500/10' : ready && affordable ? 'border-amber-500/60 bg-amber-500/5 hover:bg-amber-500/15' : 'border-slate-800 bg-slate-950 disabled:cursor-not-allowed'}`}>
                  <span className="flex items-start justify-between gap-2"><span className="font-bold text-white">{node.name}</span>{unlocked ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : !ready ? <Lock className="w-4 h-4 text-slate-500 shrink-0" /> : <Zap className="w-4 h-4 text-amber-400 shrink-0" />}</span>
                  <span className="text-sm text-slate-400 leading-relaxed">{node.description}</span>
                  <span className={`text-xs font-bold mt-auto ${unlocked ? 'text-emerald-300' : 'text-amber-300'}`}>{unlocked ? 'Unlocked' : !ready ? `Requires ${prerequisite?.name}` : affordable ? `Unlock · ${node.spCost} SP` : `Need ${node.spCost} SP · ${node.spCost - skillPoints} more`}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
