import React from 'react';
import { GameCardItem } from '../types/game';
import { CheckCircle2, GripHorizontal } from 'lucide-react';

interface GameCardProps {
  card: GameCardItem;
  isSnapped: boolean;
  isHovered: boolean;
  isGrabbed: boolean;
  isShaking: boolean;
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
  cardRef?: (node: HTMLDivElement | null) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  card,
  isSnapped,
  isHovered,
  isGrabbed,
  isShaking,
  style,
  onMouseDown,
  cardRef,
}) => {
  return (
    <div
      ref={cardRef}
      id={`card-${card.id}`}
      data-card-id={card.id}
      onMouseDown={onMouseDown}
      style={style}
      className={`
        relative select-none cursor-grab active:cursor-grabbing rounded-2xl p-3.5 sm:p-4
        transition-shadow duration-200 border
        ${isSnapped ? 'bg-emerald-950/70 border-emerald-500/60 shadow-lg shadow-emerald-950/40' : 'bg-slate-900/90'}
        ${!isSnapped && isGrabbed ? 'ring-2 ring-cyan-400 border-cyan-300 shadow-2xl shadow-cyan-500/40 scale-105 z-50' : ''}
        ${!isSnapped && isHovered && !isGrabbed ? 'border-cyan-400 shadow-xl shadow-cyan-500/20 scale-102 ring-1 ring-cyan-500/50' : ''}
        ${!isSnapped && !isHovered && !isGrabbed ? 'border-slate-700 hover:border-slate-600 shadow-md' : ''}
        ${isShaking ? 'animate-[shake_0.4s_ease-in-out] border-rose-500' : ''}
        backdrop-blur-md flex flex-col justify-between w-60 sm:w-64 min-h-[110px]
      `}
    >
      {/* Top Header: Tag + Icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl p-1 bg-slate-800/80 rounded-xl border border-slate-700/50 shadow-inner">
            {card.icon}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase tracking-wide">
            {card.tag}
          </span>
        </div>
        {isSnapped ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <GripHorizontal className="w-4 h-4 text-slate-500" />
        )}
      </div>

      {/* Main Title & Subtitle */}
      <div className="mt-2">
        <h4 className="font-bold text-slate-100 text-sm sm:text-base leading-snug">
          {card.title}
        </h4>
        {card.subtitle && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {card.subtitle}
          </p>
        )}
      </div>

      {/* Footer point or status */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>+{card.score} Điểm</span>
        <span className={isSnapped ? 'text-emerald-400 font-semibold' : 'text-cyan-400/80'}>
          {isSnapped ? '✓ Đã hoàn thành' : '✊ Chụm để gắp'}
        </span>
      </div>
    </div>
  );
};
