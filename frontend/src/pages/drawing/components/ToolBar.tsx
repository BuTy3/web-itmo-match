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

  return (
    <div
      className="toolbar"
    >
      <button
        type="button"
        aria-label="Карандаш"
        onClick={() => setTool("pen")}
        /* style={{ ...iconBtnBase, ...(tool === "pen" ? selectedStyle : null) }} */
        className={`toolbar__icon-button${tool === "pen" ? " toolbar__icon-button--active" : ""}`}
      >
        <img src="/pencil.svg" alt="" width={26} height={26} />
      </button>

      <button
        type="button"
        aria-label="Ластик"
        onClick={() => setTool("eraser")}
        /* style={{ ...iconBtnBase, ...(tool === "eraser" ? selectedStyle : null) }} */
        className={`toolbar__icon-button${tool === "eraser" ? " toolbar__icon-button--active" : ""}`}
      >
        <img src="/eraser-svgrepo-com.svg" alt="" width={26} height={26} />
      </button>

      <button
        type="button"
        aria-label="Удалить рисунок"
        onClick={onClear}
        className="toolbar__icon-button"
      >
        <img src="/delete-2-svgrepo-com.svg" alt="" width={26} height={26} />
      </button>

      <div
        className="toolbar__spacer"
      />

      <div
        className="toolbar__palette"
      >
        {COLORS.map((c) => {
          const isSelected = c.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              aria-label={`Цвет ${c}`}
              onClick={() => setColor(c)}
              className={`toolbar__color-button${isSelected ? " toolbar__color-button--active" : ""}`}
              data-color={c}
            />
          );
        })}
      </div>
    </div>
  );
}
