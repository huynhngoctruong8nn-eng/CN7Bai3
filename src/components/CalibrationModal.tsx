import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle2, Play, Sparkles, AlertCircle } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CalibrationModalProps {
  isOpen: boolean;
  isCameraActive: boolean;
  hasHand: boolean;
  isPinching: boolean;
  cameraError: string | null;
  onStartCamera: () => void;
  onCompleteCalibration: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  isCameraActive,
  hasHand,
  isPinching,
  cameraError,
  onStartCamera,
  onCompleteCalibration,
}) => {
  const [pinchSuccess, setPinchSuccess] = useState(false);

  useEffect(() => {
    if (isPinching && !pinchSuccess) {
      setPinchSuccess(true);
      soundEngine.playCorrect();
    }
  }, [isPinching, pinchSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-cyan-950/80 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20 mb-4">
          🌱
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          NÔNG TRẠI BÀN TAY
        </h2>
        <p className="text-xs uppercase tracking-wider text-cyan-400 font-bold mt-1">
          Công Nghệ 7 • Gieo Trồng & Chăm Sóc Cây Trồng
        </p>

        {/* Step 1: Camera Permission */}
        {!isCameraActive ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Yêu cầu quyền truy cập Camera</span>
              </div>
              <p>
                Game sử dụng <b>Computer Vision & MediaPipe</b> để theo dõi bàn tay bạn theo thời gian thực.
                Không lưu trữ hoặc tải lên bất kỳ hình ảnh nào.
              </p>
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            <button
              onClick={() => {
                soundEngine.playClick();
                onStartCamera();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-5 h-5" />
              <span>BẬT CAMERA & KHỞI ĐỘNG</span>
            </button>
          </div>
        ) : (
          /* Step 2: Live Hand Detection & Gesture Calibration */
          <div className="mt-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <div className="text-sm font-bold text-slate-200 mb-2 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Thử nghiệm cử chỉ chụm tay (Pinch)</span>
              </div>

              {/* Status Indicator */}
              <div className="my-4 flex flex-col items-center justify-center gap-2">
                <div
                  className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl transition-all duration-300 ${
                    pinchSuccess
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 scale-110 shadow-lg shadow-emerald-500/40'
                      : isPinching
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 scale-105 shadow-md shadow-cyan-500/40'
                        : hasHand
                          ? 'border-slate-500 bg-slate-800 text-slate-400'
                          : 'border-amber-400 bg-amber-500/10 text-amber-300 animate-pulse'
                  }`}
                >
                  {pinchSuccess ? '✓' : isPinching ? '✊' : hasHand ? '🖐️' : '❓'}
                </div>

                <div className="text-xs font-semibold">
                  {pinchSuccess ? (
                    <span className="text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Tuyệt vời! Cử chỉ chụm tay đã sẵn sàng.
                    </span>
                  ) : isPinching ? (
                    <span className="text-cyan-300">Đang chụm ngón tay!</span>
                  ) : hasHand ? (
                    <span className="text-slate-300">
                      Hãy <b>chụm ngón cái và ngón trỏ</b> lại gần nhau.
                    </span>
                  ) : (
                    <span className="text-amber-300">
                      Hãy đưa bàn tay vào phía trước camera...
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-2 flex items-center justify-around">
                <span>🖐️ Mở: Di chuyển con trỏ</span>
                <span>✊ Chụm: Nhặt thẻ</span>
              </div>
            </div>

            <button
              disabled={!pinchSuccess}
              onClick={() => {
                soundEngine.playClick();
                onCompleteCalibration();
              }}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                pinchSuccess
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>BẮT ĐẦU CHƠI NGAY</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
