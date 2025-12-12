import { useState } from "react";
import { DrawingCanvas } from "./components/DrawingCanvas";
import { ToolBar } from "./components/ToolBar";
import { TopicCard } from "./components/TopicCard";

type Tool = "pen" | "eraser";

export const DrawingPage = () => {
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#1c1c1e");
  const [brushSize] = useState(8);
  const [clearSignal, setClearSignal] = useState(0);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, margin: 0 }}>
        Тут можно создавать шедевры, пока у вас есть свободное время
      </h1>

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "850px 120px 437px",
          gap: 24,
          alignItems: "start",
        }}
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
