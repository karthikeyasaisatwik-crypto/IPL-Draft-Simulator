import { motion } from 'framer-motion';
import { X, Mail, MessageSquare } from 'lucide-react';
import { useCoachStore } from '../../store/coachStore';

export default function CoachMailbox({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const emails = useCoachStore(s => s.postMatchEmails);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="p-6 border-b border-slate-700/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Coach Mailbox</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{emails.length} NEW MESSAGES</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-950/50">
          {emails.map((email) => (
            <div key={email.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden group">
              {/* Category indicator line */}
              <div className={"absolute left-0 top-0 bottom-0 w-1 "} />
              
              <div className="flex justify-between items-start mb-3 pl-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {email.category === 'BOARD' ? 'BOARD OF DIRECTORS' : 
                     email.category === 'MEDIA' ? 'THE PRESS' : 
                     email.category === 'FANS' ? 'SOCIAL MEDIA' : 'PLAYER'}
                  </p>
                  <h3 className="text-white font-bold">{email.sender}</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">Just now</span>
              </div>
              
              <div className="pl-3">
                <h4 className="text-sm font-bold text-slate-200 mb-2">Subject: {email.subject}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{email.body}</p>
              </div>
            </div>
          ))}
          
          {emails.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
              <MessageSquare className="w-12 h-12 text-slate-500 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest">No Messages</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
