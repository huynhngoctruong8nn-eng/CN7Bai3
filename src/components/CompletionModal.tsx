import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Target, RotateCcw, Home, Award } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CompletionModalProps {
  isOpen: boolean;
  score: number;
  totalCards: number;
  totalAttempts: number;
  timeSeconds: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  score,
  totalCards,
  totalAttempts,
  timeSeconds,
  onPlayAgain,
  onGoHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playGameComplete();

      // Launch cheerful celebratory confetti fireworks
      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const accuracy = totalAttempts > 0 ? Math.min(100, Math.round((totalCards / Math.max(totalCards, totalAttempts)) * 100)) : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-cyan-400/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-cyan-950/90 relative overflow-hidden animate-[scaleUp_0.3s_ease-out]">
        {/* Glow ambient background */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Victory Trophy Badge */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/30 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)] animate-bounce" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          🏆 XUẤT SẮC HOÀN THÀNH!
        </h2>
        <p className="text-sm text-cyan-300 font-medium mt-1">
          Em đã thành thạo kỹ thuật Gieo trồng & Chăm sóc cây trồng lớp 7!
        </p>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          {/* Score */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col items-center">
            <Award className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              ĐIỂM SỐ
            </span>
            <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
              {score}
            </span>
          </div>

          {/* Time */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col items-center">
            <Clock className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              THỜI GIAN
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
              {timeFormatted}
            </span>
          </div>

          {/* Accuracy */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col items-center">
            <Target className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              ĐỘ CHÍNH XÁC
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Educational takeaway message */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-left text-xs text-cyan-100 mb-6 space-y-1">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
            <span>🌾 Ghi nhớ bài học:</span>
          </div>
          <p className="text-slate-300">
            • <b>Gieo hạt & Trồng cây con:</b> Chú ý ngâm ủ hạt, độ sâu phủ đất, trồng thẳng đứng và che phủ cây non.
          </p>
          <p className="text-slate-300">
            • <b>Tưới/tiêu nước & Vun xới:</b> Cấp ẩm hợp lý sáng sớm/chiều mát, kịp thời tiêu úng, diệt cỏ dại và tỉa dặm đúng mật độ!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onPlayAgain();
            }}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CHƠI LẠI</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onGoHome();
            }}
            className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Home className="w-4 h-4" />
            <span>TRANG CHỦ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
