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
      className="topic-card"
    >
      <div
        className="topic-card__content"
      >
        <div
          className="topic-card__text"
        >
          {loading ? "Загрузка..." : error ? error : topic || "—"}
        </div>

        <button
          type="button"
          onClick={loadTopic}
          disabled={loading}
          className="topic-card__action"
        >
          {loading ? "..." : "Изменить\nтему"}
        </button>
      </div>
    </div>
  );
}
