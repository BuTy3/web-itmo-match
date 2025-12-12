type Tool = "pen" | "eraser";

type Props = {
  tool: Tool;
  setTool: (t: Tool) => void;

  color: string;
  setColor: (c: string) => void;

  onClear: () => void;
};

const COLORS = [
  "#FF3B30",
  "#1C1C1E", 
  "#007AFF",
  "#FFFFFF", 
  "#FFCC00",
  "#34C759", 
];

export function ToolBar({ tool, setTool, color, setColor, onClear }: Props) {
  const iconBtnBase: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: 14,
    border: "2px solid transparent",
    background: "rgba(255,255,255,0.18)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    padding: 0,
  };

  const selectedStyle: React.CSSProperties = {
    border: "2px solid rgba(255,255,255,0.95)",
    boxShadow: "0 0 0 3px rgba(0,0,0,0.12)",
  };

  return (
    <div
      style={{
        width: 120,
        height: 615,
        borderRadius: 22,
        background: "linear-gradient(180deg, #EF3030 0%, #4124F3 100%)",
        padding: 14,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <button
        type="button"
        aria-label="Карандаш"
        onClick={() => setTool("pen")}
        style={{ ...iconBtnBase, ...(tool === "pen" ? selectedStyle : null) }}
      >
        <img src="/pencil.svg" alt="" width={26} height={26} />
      </button>

      <button
        type="button"
        aria-label="Ластик"
        onClick={() => setTool("eraser")}
        style={{ ...iconBtnBase, ...(tool === "eraser" ? selectedStyle : null) }}
      >
        <img src="/eraser-svgrepo-com.svg" alt="" width={26} height={26} />
      </button>

      <button
        type="button"
        aria-label="Удалить рисунок"
        onClick={onClear}
        style={iconBtnBase}
      >
        <img src="/delete-2-svgrepo-com.svg" alt="" width={26} height={26} />
      </button>

      <div style={{ flex: 1 }} />

      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          justifyItems: "center",
          paddingBottom: 6,
        }}
      >
        {COLORS.map((c) => {
          const isSelected = c.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              aria-label={`Цвет ${c}`}
              onClick={() => setColor(c)}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: c,
                border: isSelected
                  ? "2px solid rgba(255,255,255,0.95)"
                  : "2px solid rgba(0,0,0,0.15)",
                boxShadow: isSelected ? "0 0 0 3px rgba(0,0,0,0.12)" : "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
