/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_DATA } from './data/gameData';
import { HandTrackingManager } from './services/handTracking';
import { HandOverlay } from './components/HandOverlay';
import { ScoreHUD } from './components/ScoreHUD';
import { QuestionBar } from './components/QuestionBar';
import { GameCard } from './components/GameCard';
import { DropZone } from './components/DropZone';
import { CalibrationModal } from './components/CalibrationModal';
import { CompletionModal } from './components/CompletionModal';
import { soundEngine } from './utils/audio';
import { NormalizedLandmark, FloatingScore } from './types/game';
import { Sparkles, Hand, RefreshCw } from 'lucide-react';

export default function App() {
  // Game progress state
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRoundAdvancing, setIsRoundAdvancing] = useState(false);

  // Audio & UI Controls
  const [isMuted, setIsMuted] = useState(() => soundEngine.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(true);
  const [isMouseActive, setIsMouseActive] = useState(false);

  // Calibration modal
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Hand tracking state
  const [hasHand, setHasHand] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [thumbPos, setThumbPos] = useState({ x: -100, y: -100 });

  // Drag and Drop State
  const [snappedCards, setSnappedCards] = useState<Record<string, string>>({}); // targetId -> cardId
  const [grabbedCardId, setGrabbedCardId] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [shakingCardId, setShakingCardId] = useState<string | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackingManagerRef = useRef<HandTrackingManager | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const targetElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const isPinchingRef = useRef(false);
  const cursorPosRef = useRef({ x: -100, y: -100 });
  const grabbedCardIdRef = useRef<string | null>(null);
  const mouseDraggingRef = useRef(false);

  const currentRound = GAME_DATA.rounds[currentRoundIndex] || GAME_DATA.rounds[0];
  const totalRounds = GAME_DATA.rounds.length;

  // Sync ref with state
  useEffect(() => {
    isPinchingRef.current = isPinching;
  }, [isPinching]);

  useEffect(() => {
    grabbedCardIdRef.current = grabbedCardId;
  }, [grabbedCardId]);

  // Timer interval
  useEffect(() => {
    if (!isGameRunning || isCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameRunning, isCompleted]);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Initialize or start webcam
  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      if (!videoRef.current) return;

      const manager = new HandTrackingManager({
        smoothAlpha: 0.65,
        onPinchChange: (pinching, px, py) => {
          setIsPinching(pinching);
          if (pinching) {
            handlePinchStart(px, py);
          } else {
            handlePinchEnd();
          }
        }
      });

      trackingManagerRef.current = manager;
      await manager.initialize();
      await manager.startCamera(videoRef.current);

      setIsCameraActive(true);
      startTrackingLoop();
    } catch (err: unknown) {
      console.error('Camera/MediaPipe initialization error:', err);
      const msg = err instanceof Error ? err.message : 'Không thể kết nối camera hoặc tải mô hình AI.';
      setCameraError(`${msg}. Bạn vẫn có thể dùng chuột để chơi!`);
    }
  };

  // Start continuous 60fps tracking loop
  const startTrackingLoop = () => {
    const loop = () => {
      if (!trackingManagerRef.current || !containerRef.current) {
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      trackingManagerRef.current.processFrame(width, height, (result) => {
        setHasHand(result.hasHand);
        setLandmarks(result.landmarks);

        if (result.hasHand) {
          cursorPosRef.current = result.cursor;
          setCursorPos(result.cursor);
          setThumbPos(result.thumb);

          // Update dragged card position in real-time
          if (grabbedCardIdRef.current) {
            const cardId = grabbedCardIdRef.current;
            const newX = result.cursor.x - dragOffsetRef.current.x;
            const newY = result.cursor.y - dragOffsetRef.current.y;
            setCardPositions((prev) => ({
              ...prev,
              [cardId]: { x: newX, y: newY }
            }));

            // Check hovered target
            detectHoveredTarget(result.cursor.x, result.cursor.y);
          } else {
            // Check hovered card on shelf
            detectHoveredCard(result.cursor.x, result.cursor.y);
          }
        } else {
          setCursorPos({ x: -100, y: -100 });
          setThumbPos({ x: -100, y: -100 });
          setHoveredCardId(null);
          setHoveredTargetId(null);
        }
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (trackingManagerRef.current) {
        trackingManagerRef.current.destroy();
      }
    };
  }, []);

  // Hover detection for shelf cards
  const detectHoveredCard = (cx: number, cy: number) => {
    let hovered: string | null = null;
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    for (const [cardId, el] of cardElementsRef.current.entries()) {
      // Ignore if already snapped
      const isCardSnapped = Object.values(snappedCards).includes(cardId);
      if (isCardSnapped) continue;

      const rect = el.getBoundingClientRect();
      const localLeft = rect.left - cRect.left;
      const localTop = rect.top - cRect.top;
      const localRight = rect.right - cRect.left;
      const localBottom = rect.bottom - cRect.top;

      if (cx >= localLeft && cx <= localRight && cy >= localTop && cy <= localBottom) {
        hovered = cardId;
        break;
      }
    }
    setHoveredCardId(hovered);
  };

  // Hover detection for target dropzones
  const detectHoveredTarget = (cx: number, cy: number) => {
    let hovered: string | null = null;
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    for (const [targetId, el] of targetElementsRef.current.entries()) {
      // If target already has snapped card, skip
      if (snappedCards[targetId]) continue;

      const rect = el.getBoundingClientRect();
      const localLeft = rect.left - cRect.left - 20;
      const localTop = rect.top - cRect.top - 20;
      const localRight = rect.right - cRect.left + 20;
      const localBottom = rect.bottom - cRect.top + 20;

      if (cx >= localLeft && cx <= localRight && cy >= localTop && cy <= localBottom) {
        hovered = targetId;
        break;
      }
    }
    setHoveredTargetId(hovered);
  };

  // Handle pinch gesture start
  const handlePinchStart = (px: number, py: number) => {
    if (!isGameRunning || isRoundAdvancing) return;

    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    // Find card under pinch cursor
    for (const [cardId, el] of cardElementsRef.current.entries()) {
      const isCardSnapped = Object.values(snappedCards).includes(cardId);
      if (isCardSnapped) continue;

      const rect = el.getBoundingClientRect();
      const localLeft = rect.left - cRect.left;
      const localTop = rect.top - cRect.top;
      const localRight = rect.right - cRect.left;
      const localBottom = rect.bottom - cRect.top;

      if (px >= localLeft && px <= localRight && py >= localTop && py <= localBottom) {
        // Grab card!
        dragOffsetRef.current = {
          x: px - localLeft,
          y: py - localTop
        };
        setGrabbedCardId(cardId);
        soundEngine.playGrab();
        return;
      }
    }
  };

  // Handle pinch gesture release (Drop evaluation)
  const handlePinchEnd = () => {
    const cardId = grabbedCardIdRef.current;
    if (!cardId) return;

    evaluateCardDrop(cardId, cursorPosRef.current.x, cursorPosRef.current.y);
  };

  // Check drop collision and correctness
  const evaluateCardDrop = useCallback((cardId: string, dropX: number, dropY: number) => {
    const container = containerRef.current;
    if (!container) {
      setGrabbedCardId(null);
      return;
    }
    const cRect = container.getBoundingClientRect();

    const currentCard = currentRound.cards.find((c) => c.id === cardId);
    if (!currentCard) {
      setGrabbedCardId(null);
      return;
    }

    setTotalAttempts((prev) => prev + 1);

    // Check which target matches drop point
    let droppedTargetId: string | null = null;

    for (const [targetId, el] of targetElementsRef.current.entries()) {
      if (snappedCards[targetId]) continue; // Already occupied

      const rect = el.getBoundingClientRect();
      const localLeft = rect.left - cRect.left - 30;
      const localTop = rect.top - cRect.top - 30;
      const localRight = rect.right - cRect.left + 30;
      const localBottom = rect.bottom - cRect.top + 30;

      if (dropX >= localLeft && dropX <= localRight && dropY >= localTop && dropY <= localBottom) {
        droppedTargetId = targetId;
        break;
      }
    }

    if (droppedTargetId) {
      // Check if this target is the correct one for the card!
      if (currentCard.targetId === droppedTargetId) {
        // CORRECT MATCH!
        soundEngine.playCorrect();
        setScore((prev) => prev + currentCard.score);

        setSnappedCards((prev) => ({
          ...prev,
          [droppedTargetId]: cardId
        }));

        setLastFeedback({
          message: `Chính xác! ${currentCard.title}`,
          isCorrect: true
        });

        // Add floating +1 score animation
        const newScoreId = `score-${Date.now()}`;
        setFloatingScores((prev) => [
          ...prev,
          { id: newScoreId, x: dropX, y: dropY, text: `+${currentCard.score}` }
        ]);

        setTimeout(() => {
          setFloatingScores((prev) => prev.filter((s) => s.id !== newScoreId));
        }, 1200);

        // Check if all cards in round are finished
        const nextSnappedCount = Object.keys(snappedCards).length + 1;
        if (nextSnappedCount >= currentRound.cards.length) {
          handleRoundComplete();
        }
      } else {
        // WRONG TARGET
        soundEngine.playWrong();
        setShakingCardId(cardId);
        setTimeout(() => setShakingCardId(null), 500);

        setLastFeedback({
          message: `Chưa đúng rồi! Hãy suy nghĩ kỹ và thử lại.`,
          isCorrect: false
        });
      }
    } else {
      // Dropped nowhere
      soundEngine.playRelease();
    }

    // Reset card drag
    setGrabbedCardId(null);
    setCardPositions((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
    setHoveredTargetId(null);
  }, [currentRound, snappedCards]);

  // Round progression
  const handleRoundComplete = () => {
    setIsRoundAdvancing(true);
    soundEngine.playRoundComplete();

    setTimeout(() => {
      if (currentRoundIndex + 1 < totalRounds) {
        // Next round
        setCurrentRoundIndex((prev) => prev + 1);
        setSnappedCards({});
        setCardPositions({});
        setIsRoundAdvancing(false);
        setLastFeedback(null);
      } else {
        // Game complete!
        setIsCompleted(true);
        setIsGameRunning(false);
        setIsRoundAdvancing(false);
      }
    }, 1200);
  };

  // Calibration completion
  const handleCompleteCalibration = () => {
    setIsCalibrating(false);
    setIsGameRunning(true);
    setTimerSeconds(0);
    setScore(0);
    setSnappedCards({});
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Sound toggle
  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Restart current round
  const restartCurrentRound = () => {
    soundEngine.playClick();
    setSnappedCards({});
    setCardPositions({});
    setGrabbedCardId(null);
    setHoveredTargetId(null);
    setLastFeedback(null);
  };

  // Replay entire game
  const handlePlayAgain = () => {
    setCurrentRoundIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setTimerSeconds(0);
    setSnappedCards({});
    setCardPositions({});
    setGrabbedCardId(null);
    setIsCompleted(false);
    setIsGameRunning(true);
  };

  // Go to start
  const handleGoHome = () => {
    setIsCompleted(false);
    setIsCalibrating(true);
    setIsGameRunning(false);
    setCurrentRoundIndex(0);
    setScore(0);
    setSnappedCards({});
    setCardPositions({});
  };

  // Mouse fallback handlers
  const handleMouseDownCard = (e: React.MouseEvent, cardId: string) => {
    if (!containerRef.current) return;
    const isCardSnapped = Object.values(snappedCards).includes(cardId);
    if (isCardSnapped) return;

    mouseDraggingRef.current = true;
    setIsMouseActive(true);

    const cRect = containerRef.current.getBoundingClientRect();
    const cardEl = cardElementsRef.current.get(cardId);
    if (!cardEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const curX = e.clientX - cRect.left;
    const curY = e.clientY - cRect.top;

    dragOffsetRef.current = {
      x: curX - (cardRect.left - cRect.left),
      y: curY - (cardRect.top - cRect.top)
    };

    cursorPosRef.current = { x: curX, y: curY };
    setCursorPos({ x: curX, y: curY });
    setGrabbedCardId(cardId);
    soundEngine.playGrab();
  };

  const handleMouseMoveContainer = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const curX = e.clientX - cRect.left;
    const curY = e.clientY - cRect.top;

    if (mouseDraggingRef.current && grabbedCardId) {
      cursorPosRef.current = { x: curX, y: curY };
      setCursorPos({ x: curX, y: curY });

      const newX = curX - dragOffsetRef.current.x;
      const newY = curY - dragOffsetRef.current.y;
      setCardPositions((prev) => ({
        ...prev,
        [grabbedCardId]: { x: newX, y: newY }
      }));

      detectHoveredTarget(curX, curY);
    }
  };

  const handleMouseUpContainer = () => {
    if (mouseDraggingRef.current && grabbedCardId) {
      mouseDraggingRef.current = false;
      evaluateCardDrop(grabbedCardId, cursorPosRef.current.x, cursorPosRef.current.y);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMoveContainer}
      onMouseUp={handleMouseUpContainer}
      className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#070b19] via-[#091026] to-[#040711] flex flex-col justify-between font-sans select-none"
    >
      {/* Hidden processing video element */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      {/* Realtime Hand Skeleton and Cursor Overlay */}
      <HandOverlay
        landmarks={landmarks}
        cursor={cursorPos}
        thumb={thumbPos}
        isPinching={isPinching}
        hasHand={hasHand}
        containerWidth={containerRef.current?.clientWidth || window.innerWidth}
        containerHeight={containerRef.current?.clientHeight || window.innerHeight}
      />

      {/* Floating score gains */}
      {floatingScores.map((fs) => (
        <div
          key={fs.id}
          style={{ left: fs.x, top: fs.y }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 text-cyan-300 font-black text-2xl drop-shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-[floatUp_1s_ease-out_forwards]"
        >
          {fs.text}
        </div>
      ))}

      {/* Top HUD */}
      <ScoreHUD
        score={score}
        currentRound={currentRoundIndex + 1}
        totalRounds={totalRounds}
        timerSeconds={timerSeconds}
        isMuted={isMuted}
        onToggleSound={toggleSound}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showCameraPreview={showCameraPreview}
        onToggleCameraPreview={() => setShowCameraPreview((p) => !p)}
        onRestartRound={restartCurrentRound}
        hasHand={hasHand}
        isStreaming={isCameraActive}
        isMouseActive={isMouseActive}
        onToggleMouseMode={() => setIsMouseActive((prev) => !prev)}
      />

      {/* Main Interactive Playground */}
      <div className="flex-1 flex flex-col justify-between items-center px-4 py-4 max-w-7xl mx-auto w-full relative z-20">
        
        {/* UPPER AREA: Available Cards Shelf */}
        <div className="w-full flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase font-bold text-slate-400 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>CÁC THẺ KỸ THUẬT & ĐẶC ĐIỂM (CHỤM TAY ĐỂ GẮP)</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 min-h-[120px] w-full">
            {currentRound.cards.map((card) => {
              const isSnapped = Object.values(snappedCards).includes(card.id);
              const isGrabbed = grabbedCardId === card.id;
              const isHovered = hoveredCardId === card.id;
              const isShaking = shakingCardId === card.id;
              const pos = cardPositions[card.id];

              // If snapped into target, hide from upper shelf
              if (isSnapped) return null;

              return (
                <div
                  key={card.id}
                  style={
                    isGrabbed && pos
                      ? {
                          position: 'absolute',
                          left: `${pos.x}px`,
                          top: `${pos.y}px`,
                          pointerEvents: 'none',
                          zIndex: 60
                        }
                      : undefined
                  }
                >
                  <GameCard
                    card={card}
                    isSnapped={false}
                    isHovered={isHovered}
                    isGrabbed={isGrabbed}
                    isShaking={isShaking}
                    onMouseDown={(e) => handleMouseDownCard(e, card.id)}
                    cardRef={(el) => {
                      if (el) cardElementsRef.current.set(card.id, el);
                      else cardElementsRef.current.delete(card.id);
                    }}
                  />
                </div>
              );
            })}

            {/* If all cards in round are snapped */}
            {Object.keys(snappedCards).length === currentRound.cards.length && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400/60 text-emerald-300 font-bold flex items-center gap-3 animate-pulse">
                <Sparkles className="w-5 h-5" />
                <span>Hoàn thành xuất sắc vòng chơi! Đang chuyển tiếp...</span>
              </div>
            )}
          </div>
        </div>

        {/* Divider subtle visual */}
        <div className="w-full flex items-center justify-center my-1 opacity-40">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-3/4"></div>
        </div>

        {/* LOWER AREA: Target Drop Zones */}
        <div className="w-full flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase font-bold text-cyan-300/80 tracking-wider">
            <span>CÁC VÙNG ĐÍCH TƯƠNG ỨNG (THẢ THẺ VÀO ĐÚNG Ô)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full justify-items-center">
            {currentRound.targets.map((target) => {
              const snappedCardId = snappedCards[target.id];
              const snappedCard = snappedCardId
                ? currentRound.cards.find((c) => c.id === snappedCardId) || null
                : null;
              const isHovered = hoveredTargetId === target.id;

              return (
                <DropZone
                  key={target.id}
                  target={target}
                  snappedCard={snappedCard}
                  isHovered={isHovered}
                  zoneRef={(el) => {
                    if (el) targetElementsRef.current.set(target.id, el);
                    else targetElementsRef.current.delete(target.id);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Camera Preview PIP (Mirror video feed for user orientation) */}
      {isCameraActive && showCameraPreview && (
        <div className="absolute bottom-16 right-5 z-40 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl bg-slate-900/90 w-44 sm:w-52 backdrop-blur-md transition-all hover:scale-105">
          <div className="px-2.5 py-1 bg-slate-950/80 border-b border-cyan-500/30 flex items-center justify-between text-[10px] text-cyan-300 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              WEBCAM SOI GƯƠNG
            </span>
            <button
              onClick={() => setShowCameraPreview(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={(el) => {
                if (el && videoRef.current && videoRef.current.srcObject) {
                  el.srcObject = videoRef.current.srcObject;
                  el.play().catch(() => {});
                }
              }}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover -scale-x-100" // CSS mirrored
            />
            {!hasHand && (
              <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center p-2 text-center text-[10px] text-amber-300 font-semibold">
                Giơ bàn tay lên trước camera
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lost hand prompt badge */}
      {isGameRunning && isCameraActive && !hasHand && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-amber-500/60 px-5 py-2.5 rounded-2xl text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-2xl animate-pulse">
          <Hand className="w-5 h-5 text-amber-400" />
          <span>Đưa bàn tay vào vùng camera để tiếp tục tương tác!</span>
        </div>
      )}

      {/* Round advancing indicator */}
      {isRoundAdvancing && (
        <div className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 border border-cyan-400/50 rounded-3xl p-6 text-center shadow-2xl animate-bounce">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-black text-white">XUẤT SẮC HOÀN THÀNH VÒNG!</h3>
            <p className="text-xs text-cyan-300 mt-1">Đang chuẩn bị vòng tiếp theo...</p>
          </div>
        </div>
      )}

      {/* Bottom Question & Pedagogy Bar */}
      <QuestionBar
        instruction={currentRound.instruction}
        topic={currentRound.topic}
        roundTitle={currentRound.title}
        lastFeedback={lastFeedback}
      />

      {/* Calibration and Onboarding Modal */}
      <CalibrationModal
        isOpen={isCalibrating}
        isCameraActive={isCameraActive}
        hasHand={hasHand}
        isPinching={isPinching}
        cameraError={cameraError}
        onStartCamera={handleStartCamera}
        onCompleteCalibration={handleCompleteCalibration}
      />

      {/* Final Victory Screen */}
      <CompletionModal
        isOpen={isCompleted}
        score={score}
        totalCards={GAME_DATA.rounds.reduce((acc, r) => acc + r.cards.length, 0)}
        totalAttempts={totalAttempts}
        timeSeconds={timerSeconds}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    </div>
  );
}
