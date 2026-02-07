import { useState } from "react";
import { DrawingCanvas } from "./components/DrawingCanvas";
import { ToolBar } from "./components/ToolBar";
import { TopicCard } from "./components/TopicCard";
import "./drawing.css";

type Tool = "pen" | "eraser";

export const DrawingPage = () => {
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#1c1c1e");
  const [brushSize] = useState(8);
  const [clearSignal, setClearSignal] = useState(0);

  return (
    <div
      className="drawing-page"
    >
      <h1
        className="drawing-title"
      >
        Тут можно создавать шедевры, пока у вас есть свободное время
      </h1>

      <div
        className="drawing-layout"
      >
        <DrawingCanvas
          tool={tool}
          color={color}
          brushSize={brushSize}
          clearSignal={clearSignal}
        />

        <ToolBar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          onClear={() => setClearSignal((x) => x + 1)}
        />

        <TopicCard />
      </div>
    </div>
  );
};
