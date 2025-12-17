import { useEffect, useRef } from "react";

type Props = {
  tool: "pen" | "eraser";
  color: string;
  brushSize: number;
  clearSignal: number;
};

export function DrawingCanvas({ tool, color, brushSize, clearSignal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDownRef = useRef(false);

  const toolRef = useRef<Props["tool"]>(tool);
  const colorRef = useRef<Props["color"]>(color);
  const brushSizeRef = useRef<Props["brushSize"]>(brushSize);

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
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [clearSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
    canvas.style.touchAction = "none";

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

      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      const snapshotCtx = snapshot.getContext("2d");
      snapshotCtx?.drawImage(canvas, 0, 0);

      canvas.width = nextWidth;
      canvas.height = nextHeight;

      const newCtx = canvas.getContext("2d");
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
    };

    const onMove = (e: PointerEvent) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (!isDownRef.current) return;

      const { x, y } = getPos(e);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSizeRef.current;

      if (toolRef.current === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = colorRef.current;
      }

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const onUp = () => {
      const ctx = ctxRef.current;
      isDownRef.current = false;
      ctx?.closePath();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      className="drawing-canvas-wrapper"
    >
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
      />
    </div>
  );
}
