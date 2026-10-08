import React, { useEffect, useRef } from 'react';
import { NormalizedLandmark } from '../types/game';

// MediaPipe 21 Hand Connections
const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [5, 9], [9, 13], [13, 17]
];

interface HandOverlayProps {
  landmarks: NormalizedLandmark[] | null;
  cursor: { x: number; y: number };
  thumb: { x: number; y: number };
  isPinching: boolean;
  hasHand: boolean;
  containerWidth: number;
  containerHeight: number;
}

export const HandOverlay: React.FC<HandOverlayProps> = ({
  landmarks,
  cursor,
  thumb,
  isPinching,
  hasHand,
  containerWidth,
  containerHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!hasHand || !landmarks || landmarks.length === 0) {
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Convert mirrored landmark positions
    const points = landmarks.map((lm) => ({
      x: (1 - lm.x) * w,
      y: lm.y * h,
      z: lm.z
    }));

    // Draw Skeleton Lines with neon cyan / electric glow
    ctx.lineWidth = 3;
    ctx.strokeStyle = isPinching ? 'rgba(56, 189, 248, 0.85)' : 'rgba(34, 211, 238, 0.65)';
    ctx.shadowColor = isPinching ? '#38bdf8' : '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = points[startIdx];
      const p2 = points[endIdx];
      if (!p1 || !p2) return;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // Draw Pinch Line between Thumb (4) and Index (8)
    const pThumb = points[4];
    const pIndex = points[8];
    if (pThumb && pIndex) {
      ctx.beginPath();
      ctx.lineWidth = isPinching ? 4 : 2;
      ctx.strokeStyle = isPinching ? 'rgba(74, 222, 128, 0.95)' : 'rgba(251, 191, 36, 0.55)';
      ctx.shadowColor = isPinching ? '#4ade80' : '#fbbf24';
      ctx.shadowBlur = isPinching ? 14 : 6;
      ctx.setLineDash(isPinching ? [] : [4, 4]);
      ctx.moveTo(pThumb.x, pThumb.y);
      ctx.lineTo(pIndex.x, pIndex.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw joint dots
    points.forEach((pt, index) => {
      ctx.beginPath();
      const isTip = [4, 8, 12, 16, 20].includes(index);
      const isCursorOrThumb = index === 8 || index === 4;

      const radius = isCursorOrThumb ? 6 : isTip ? 4 : 3;

      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);

      if (index === 8) {
        ctx.fillStyle = isPinching ? '#4ade80' : '#38bdf8';
        ctx.shadowColor = isPinching ? '#22c55e' : '#0284c7';
      } else if (index === 4) {
        ctx.fillStyle = isPinching ? '#4ade80' : '#f59e0b';
        ctx.shadowColor = isPinching ? '#22c55e' : '#d97706';
      } else {
        ctx.fillStyle = '#e0f2fe';
        ctx.shadowColor = '#38bdf8';
      }
      ctx.shadowBlur = 8;
      ctx.fill();
    });

    // Draw Primary Index Cursor (Landmark 8 smoothed)
    if (cursor.x >= 0 && cursor.y >= 0) {
      const cursorX = cursor.x;
      const cursorY = cursor.y;

      // Outer glowing ring
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, isPinching ? 18 : 24, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = isPinching ? '#4ade80' : '#22d3ee';
      ctx.shadowColor = isPinching ? '#4ade80' : '#06b6d4';
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Inner dynamic core
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, isPinching ? 8 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isPinching ? '#ffffff' : '#38bdf8';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.fill();

      // Pinch state badge / ripple
      if (isPinching) {
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 28, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
        ctx.stroke();
      }
    }
  }, [landmarks, cursor, thumb, isPinching, hasHand, containerWidth, containerHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={containerWidth}
      height={containerHeight}
      className="absolute inset-0 pointer-events-none z-40 transition-opacity duration-300"
    />
  );
};
