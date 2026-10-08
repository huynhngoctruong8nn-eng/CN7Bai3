import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

interface QuestionBarProps {
  instruction: string;
  topic: string;
  roundTitle: string;
  lastFeedback: { message: string; isCorrect: boolean } | null;
}

export const QuestionBar: React.FC<QuestionBarProps> = ({
  instruction,
  topic,
  roundTitle,
  lastFeedback,
}) => {
  return (
    <div className="w-full px-6 py-3 border-t border-cyan-500/20 bg-slate-950/85 backdrop-blur-md z-30 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        {/* Instruction & Topic */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 items-center justify-center text-cyan-300 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">
                {roundTitle}
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-emerald-400 font-medium text-xs">
                {topic}
              </span>
            </div>
            <p className="text-slate-100 font-medium text-sm md:text-base leading-snug">
              {instruction}
            </p>
          </div>
        </div>

        {/* Dynamic feedback or gesture tip */}
        <div className="flex items-center gap-2">
          {lastFeedback ? (
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg transition-all animate-bounce ${
                lastFeedback.isCorrect
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-200'
                  : 'bg-rose-500/20 border border-rose-400/50 text-rose-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lastFeedback.message}</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-xs text-cyan-200/90 flex items-center gap-2">
              <span className="inline-block animate-pulse">👉</span>
              <span>Chụm ngón cái & trỏ để <b>Gắp thẻ</b> ➔ Thả vào <b>Ô tương ứng</b></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
