import { useEffect, useRef } from 'react';

type DrawingPoint = {
  x: number;
  y: number;
  color?: string | null;
};

type Props = {
  tool: 'pen' | 'eraser';
  color: string;
  brushSize: number;
  clearSignal: number;
  onSnapshot?: (dataUrl: string) => void;
  onPointsChange?: (points: DrawingPoint[]) => void;
  initialImage?: string | null;
  initialPoints?: DrawingPoint[] | null;
};

export function DrawingCanvas({
  tool,
  color,
  brushSize,
  clearSignal,
  onSnapshot,
  onPointsChange,
  initialImage = null,
  initialPoints = null,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDownRef = useRef(false);
  const lastImageRef = useRef<string | null>(null);
  const snapshotRef = useRef<Props['onSnapshot']>(onSnapshot);
  const pointsChangeRef = useRef<Props['onPointsChange']>(onPointsChange);
  const pointsRef = useRef<DrawingPoint[]>([]);

  const toolRef = useRef<Props['tool']>(tool);
  const colorRef = useRef<Props['color']>(color);
  const brushSizeRef = useRef<Props['brushSize']>(brushSize);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  useEffect(() => {
    snapshotRef.current = onSnapshot;
  }, [onSnapshot]);

  useEffect(() => {
    pointsChangeRef.current = onPointsChange;
  }, [onPointsChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    pointsRef.current = [];
    snapshotRef.current?.('');
    pointsChangeRef.current?.([]);
  }, [clearSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;
    canvas.style.touchAction = 'none';

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dpr = window.devicePixelRatio || 1;
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width === nextWidth && canvas.height === nextHeight) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return;
      }

      const snapshot = document.createElement('canvas');
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      const snapshotCtx = snapshot.getContext('2d');
      snapshotCtx?.drawImage(canvas, 0, 0);

      canvas.width = nextWidth;
      canvas.height = nextHeight;

      const newCtx = canvas.getContext('2d');
      if (!newCtx) return;
      ctxRef.current = newCtx;

      newCtx.setTransform(1, 0, 0, 1, 0, 0);
      if (snapshot.width > 0 && snapshot.height > 0) {
        newCtx.drawImage(
          snapshot,
          0,
          0,
          snapshot.width,
          snapshot.height,
          0,
          0,
          nextWidth,
          nextHeight,
        );
      }
      newCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    requestAnimationFrame(resize);

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      isDownRef.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      pointsRef.current.push({ x, y, color: null });
    };

    const onMove = (e: PointerEvent) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (!isDownRef.current) return;

      const { x, y } = getPos(e);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSizeRef.current;

      if (toolRef.current === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        pointsRef.current.push({ x, y, color: 'erase' });
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colorRef.current;
        pointsRef.current.push({ x, y, color: colorRef.current });
      }

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const onUp = () => {
      const ctx = ctxRef.current;
      isDownRef.current = false;
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx?.closePath();

      if (canvasRef.current) {
        snapshotRef.current?.(canvasRef.current.toDataURL('image/png'));
      }
      pointsChangeRef.current?.([...pointsRef.current]);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  useEffect(() => {
    if (!initialPoints) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let hasPath = false;
    for (const point of initialPoints) {
      if (point.color == null) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        hasPath = true;
        continue;
      }

      if (!hasPath) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        hasPath = true;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSizeRef.current;

      if (point.color === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = point.color || '#1c1c1e';
      }

      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.closePath();
    pointsRef.current = [...initialPoints];
  }, [initialPoints]);

  useEffect(() => {
    if (!initialImage || initialImage === lastImageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const image = new Image();
    image.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    image.src = initialImage;
    lastImageRef.current = initialImage;
  }, [initialImage]);

  return (
    <div className="drawing-canvas-wrapper">
      <canvas ref={canvasRef} className="drawing-canvas" />
    </div>
  );
}
