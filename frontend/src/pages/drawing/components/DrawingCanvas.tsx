import { useEffect, useRef } from "react";

type Props = {
  tool: "pen" | "eraser";
  color: string;
  brushSize: number;
  clearSignal: number;
};

export function DrawingCanvas({ tool, color, brushSize, clearSignal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [clearSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 850;
    canvas.height = 615;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      isDownRef.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const onMove = (e: PointerEvent) => {
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
      isDownRef.current = false;
      ctx.closePath();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
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
