import React from 'react';
import { Volume2, VolumeX, Maximize, Minimize, Video, VideoOff, RotateCcw, MousePointer, Hand } from 'lucide-react';

interface ScoreHUDProps {
  score: number;
  currentRound: number;
  totalRounds: number;
  timerSeconds: number;
  isMuted: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  showCameraPreview: boolean;
  onToggleCameraPreview: () => void;
  onRestartRound: () => void;
  hasHand: boolean;
  isStreaming: boolean;
  isMouseActive: boolean;
  onToggleMouseMode: () => void;
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({
  score,
  currentRound,
  totalRounds,
  timerSeconds,
  isMuted,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  showCameraPreview,
  onToggleCameraPreview,
  onRestartRound,
  hasHand,
  isStreaming,
  isMouseActive,
  onToggleMouseMode,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md z-30 select-none">
      {/* Left: App Title and Live Camera Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold tracking-tight text-base sm:text-lg">
                NÔNG TRẠI BÀN TAY
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                Công Nghệ 7
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Gieo trồng & Chăm sóc cây trồng</span>
            </div>
          </div>
        </div>

        {/* Hand status badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs">
          {isStreaming ? (
            hasHand ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-300 font-medium flex items-center gap-1">
                  <Hand className="w-3.5 h-3.5" /> Đã nhận diện bàn tay
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span className="text-amber-300 font-medium">Đưa tay vào camera...</span>
              </>
            )
          ) : (
            <span className="text-slate-400">Đang bật camera...</span>
          )}
        </div>
      </div>

      {/* Right: Scores, Progress, Timer & Action Controls */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* HUD Statistics */}
        <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-1.5 rounded-2xl border border-cyan-500/30 shadow-inner">
          {/* Score */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              ĐIỂM SỐ
            </span>
            <span className="text-lg sm:text-2xl font-black text-cyan-300 font-mono tracking-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
              {score}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-slate-700"></div>

          {/* Round progress */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              TIẾN ĐỘ
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">
                {currentRound}
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">/{totalRounds}</span>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-700"></div>

          {/* Timer */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              THỜI GIAN
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-200 font-mono">
              {formatTime(timerSeconds)}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition-all hover:scale-105"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Camera PIP Preview Toggle */}
          <button
            onClick={onToggleCameraPreview}
            title={showCameraPreview ? 'Ẩn xem trước camera' : 'Hiện xem trước camera'}
            className={`p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border transition-all hover:scale-105 ${
              showCameraPreview
                ? 'text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 border-slate-700/80'
            }`}
          >
            {showCameraPreview ? <Video className="w-4 h-4 text-cyan-300" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* Mouse assist toggle */}
          <button
            onClick={onToggleMouseMode}
            title={isMouseActive ? 'Chuột hỗ trợ: BẬT' : 'Chuột hỗ trợ: TẮT'}
            className={`p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border transition-all hover:scale-105 ${
              isMouseActive ? 'text-amber-400 border-amber-500/50' : 'text-slate-400 border-slate-700/80'
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          {/* Restart Round */}
          <button
            onClick={onRestartRound}
            title="Chơi lại vòng này"
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/80 transition-all hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition-all hover:scale-105"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
