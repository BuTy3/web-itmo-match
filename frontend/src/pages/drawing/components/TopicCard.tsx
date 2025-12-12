import { useEffect, useState } from "react";
import { getDrawingTopic } from "../../../shared/api/drawing";

const LS_KEY = "last_topic";

export function TopicCard() {
  const [topic, setTopic] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTopic = async () => {
    setLoading(true);
    setError(null);

    try {
      const lastTopic = localStorage.getItem(LS_KEY);
      const res = await getDrawingTopic(lastTopic);

      if (res.ok) {
        setTopic(res.topic);
        localStorage.setItem(LS_KEY, res.topic);
      } else {
        setError(res.message);
      }
    } catch {
      setError("Не удалось получить тему");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopic();
  }, []);

  return (
    <div
      style={{
        width: 437,
        height: 615,
        borderRadius: 35,
        background:
          "linear-gradient(180deg, rgba(239,48,48,0.2) 0%, rgba(65,36,243,0.2) 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 40,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 369,
          height: 265,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        <div
          style={{
            width: 369,
            height: 132,
            borderRadius: 35,
            background: "#E8E8E8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 20px",
            boxSizing: "border-box",
            textAlign: "center",
            fontSize: 18,
            fontWeight: 500,
          }}
        >
          {loading ? "Загрузка..." : error ? error : topic || "—"}
        </div>

        <button
          type="button"
          onClick={loadTopic}
          disabled={loading}
          style={{
            width: 169,
            height: 76,
            borderRadius: 35,
            border: "none",
            cursor: loading ? "default" : "pointer",
            background: "linear-gradient(180deg, #EF3030 0%, #4124F3 100%)",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {loading ? "..." : "Изменить\nтему"}
        </button>
      </div>
    </div>
  );
}
