import React from 'react';
import { GameCardItem, GameTargetItem } from '../types/game';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface DropZoneProps {
  target: GameTargetItem;
  snappedCard: GameCardItem | null;
  isHovered: boolean;
  zoneRef?: (node: HTMLDivElement | null) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  target,
  snappedCard,
  isHovered,
  zoneRef,
}) => {
  return (
    <div
      ref={zoneRef}
      id={`target-${target.id}`}
      data-target-id={target.id}
      className={`
        relative rounded-2xl p-4 transition-all duration-300 border-2 select-none flex flex-col justify-between
        w-64 sm:w-72 min-h-[170px] backdrop-blur-sm
        ${snappedCard 
          ? 'border-emerald-500/80 bg-emerald-950/40 shadow-lg shadow-emerald-500/10' 
          : isHovered 
            ? 'border-cyan-300 bg-cyan-950/50 shadow-2xl shadow-cyan-500/30 scale-102 border-dashed ring-2 ring-cyan-400/50' 
            : 'border-dashed border-cyan-500/30 bg-slate-900/40 hover:border-cyan-500/50'
        }
      `}
    >
      {/* Zone Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl p-1 bg-slate-800/80 rounded-xl border border-slate-700/50">
            {target.icon}
          </span>
          <span className="text-xs uppercase font-bold text-cyan-300 tracking-wider">
            VÙNG ĐÍCH
          </span>
        </div>
        {snappedCard ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
          </span>
        ) : (
          <span className="text-slate-500 text-xs">Thả vào đây</span>
        )}
      </div>

      {/* Target Content or Snapped Card Content */}
      <div className="my-2">
        <h4 className="font-bold text-slate-100 text-sm sm:text-base leading-snug">
          {target.title}
        </h4>
        {target.subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">
            {target.subtitle}
          </p>
        )}
      </div>

      {/* Snapped or Hint Details */}
      {snappedCard ? (
        <div className="mt-2 p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-500/30 text-xs text-emerald-100">
          <div className="font-bold flex items-center gap-1.5 text-emerald-300">
            <span>{snappedCard.icon}</span> {snappedCard.title}
          </div>
          <p className="text-[11px] text-slate-300 mt-1 line-clamp-3">
            {snappedCard.explanation}
          </p>
        </div>
      ) : (
        <div className="mt-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>Gợi ý: {target.hint}</span>
        </div>
      )}
    </div>
  );
};
