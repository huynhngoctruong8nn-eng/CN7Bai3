import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { NormalizedLandmark } from '../types/game';

export interface TrackingOptions {
  smoothAlpha?: number; // 0 (raw) to 0.9 (heavy smoothing), default 0.7
  onHandDetected?: (hasHand: boolean) => void;
  onPinchChange?: (isPinching: boolean, x: number, y: number) => void;
}

export class HandTrackingManager {
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private lastVideoTime: number = -1;

  // Smoothing states
  private smoothAlpha: number = 0.65; // default balance between responsiveness & jitter reduction
  private prevCursorX: number = -1;
  private prevCursorY: number = -1;
  private prevThumbX: number = -1;
  private prevThumbY: number = -1;

  // Pinch hysteresis
  private isPinching: boolean = false;
  // Relative to hand scale:
  private pinchStartRatio: number = 0.30;
  private pinchReleaseRatio: number = 0.45;

  private isRunning: boolean = false;
  private options: TrackingOptions;

  constructor(options: TrackingOptions = {}) {
    this.options = options;
    if (options.smoothAlpha !== undefined) {
      this.smoothAlpha = options.smoothAlpha;
    }
  }

  public setSmoothAlpha(alpha: number) {
    this.smoothAlpha = Math.max(0.1, Math.min(0.95, alpha));
  }

  public async initialize(): Promise<void> {
    if (this.handLandmarker) return;

    // Load tasks-vision wasm assets from trusted CDN
    const wasmFileset = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(wasmFileset, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }

  public async startCamera(videoElement: HTMLVideoElement): Promise<MediaStream> {
    this.videoElement = videoElement;

    // Request webcam stream with friendly constraints
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.stream = stream;
    this.videoElement.srcObject = stream;
    this.videoElement.playsInline = true;
    this.videoElement.muted = true;

    await new Promise<void>((resolve) => {
      if (!this.videoElement) return resolve();
      this.videoElement.onloadeddata = () => {
        this.videoElement?.play().then(() => resolve()).catch(() => resolve());
      };
    });

    this.isRunning = true;
    return stream;
  }

  public processFrame(
    canvasWidth: number,
    canvasHeight: number,
    onResult: (data: {
      hasHand: boolean;
      landmarks: NormalizedLandmark[] | null;
      cursor: { x: number; y: number };
      thumb: { x: number; y: number };
      isPinching: boolean;
      pinchRatio: number;
    }) => void
  ) {
    if (!this.isRunning || !this.videoElement || !this.handLandmarker) {
      return;
    }

    if (this.videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      if (this.videoElement.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = this.videoElement.currentTime;
        const startTimeMs = performance.now();
        const results: HandLandmarkerResult = this.handLandmarker.detectForVideo(
          this.videoElement,
          startTimeMs
        );

        if (results.landmarks && results.landmarks.length > 0) {
          const rawLandmarks = results.landmarks[0]; // First detected hand

          // Hand scale normalization: distance between Wrist (0) and Middle MCP (9)
          const wrist = rawLandmarks[0];
          const middleMcp = rawLandmarks[9];
          const handScale = Math.hypot(wrist.x - middleMcp.x, wrist.y - middleMcp.y) || 0.15;

          // Landmark 8: Index fingertip
          const indexTip = rawLandmarks[8];
          // Landmark 4: Thumb tip
          const thumbTip = rawLandmarks[4];

          // Mirror X for selfie perspective
          const rawCursorX = (1 - indexTip.x) * canvasWidth;
          const rawCursorY = indexTip.y * canvasHeight;

          const rawThumbX = (1 - thumbTip.x) * canvasWidth;
          const rawThumbY = thumbTip.y * canvasHeight;

          // Apply exponential smoothing filter
          let curX = rawCursorX;
          let curY = rawCursorY;
          if (this.prevCursorX >= 0) {
            curX = this.prevCursorX * this.smoothAlpha + rawCursorX * (1 - this.smoothAlpha);
            curY = this.prevCursorY * this.smoothAlpha + rawCursorY * (1 - this.smoothAlpha);
          }
          this.prevCursorX = curX;
          this.prevCursorY = curY;

          let thX = rawThumbX;
          let thY = rawThumbY;
          if (this.prevThumbX >= 0) {
            thX = this.prevThumbX * this.smoothAlpha + rawThumbX * (1 - this.smoothAlpha);
            thY = this.prevThumbY * this.smoothAlpha + rawThumbY * (1 - this.smoothAlpha);
          }
          this.prevThumbX = thX;
          this.prevThumbY = thY;

          // Euclidean distance between index tip (8) and thumb tip (4)
          const rawDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
          const pinchRatio = rawDist / handScale;

          // Hysteresis pinch detection
          if (this.isPinching) {
            if (pinchRatio > this.pinchReleaseRatio) {
              this.isPinching = false;
              if (this.options.onPinchChange) {
                this.options.onPinchChange(false, curX, curY);
              }
            }
          } else {
            if (pinchRatio < this.pinchStartRatio) {
              this.isPinching = true;
              if (this.options.onPinchChange) {
                this.options.onPinchChange(true, curX, curY);
              }
            }
          }

          onResult({
            hasHand: true,
            landmarks: rawLandmarks,
            cursor: { x: curX, y: curY },
            thumb: { x: thX, y: thY },
            isPinching: this.isPinching,
            pinchRatio
          });

          return;
        }
      }
    }

    // No hand in this frame
    this.prevCursorX = -1;
    this.prevCursorY = -1;
    this.prevThumbX = -1;
    this.prevThumbY = -1;
    if (this.isPinching) {
      this.isPinching = false;
      if (this.options.onPinchChange) {
        this.options.onPinchChange(false, 0, 0);
      }
    }

    onResult({
      hasHand: false,
      landmarks: null,
      cursor: { x: -100, y: -100 },
      thumb: { x: -100, y: -100 },
      isPinching: false,
      pinchRatio: 1.0
    });
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  public destroy() {
    this.stop();
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
  }
}
