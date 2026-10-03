import { useState, type FormEvent } from "react";
import type { PomodoroSession } from "@/lib/types";

interface ConfigPageProps {
  tags: string[];
  sessions: PomodoroSession[];
  onAdd: (name: string) => void;
  onRemove: (tag: string) => void;
  onBack: () => void;
  onError: (message: string) => void;
}

export default function ConfigPage({
  tags,
  sessions,
  onAdd,
  onRemove,
  onBack,
  onError,
}: ConfigPageProps) {
  const [draft, setDraft] = useState("");

  function add(event: FormEvent) {
    event.preventDefault();
    const name = draft.trim().replace(/\s+/g, " ");
    if (!name) return;
    try {
      onAdd(name);
      setDraft("");
    } catch (error) {
      onError(error instanceof Error ? error.message : "标签无效");
    }
  }

  return (
    <div className="stage">
      <section className="cfg" aria-label="配置">
        <div className="cfg-top">
          <h1 className="cfg-title">配置</h1>
          <button className="btn" type="button" onClick={onBack}>
            返回
          </button>
        </div>
        <h2 className="cfg-h">标签</h2>
        <form className="cfg-add" onSubmit={add}>
          <input
            className="tag-in"
            value={draft}
            maxLength={16}
            placeholder="新标签"
            aria-label="新标签"
            onChange={(event) => setDraft(event.target.value)}
          />
          <button className="tag-ok" type="submit">
            添加
          </button>
        </form>
        {tags.length === 0 ? (
          <p className="cfg-empty">还没有标签</p>
        ) : (
          <ul className="cfg-list">
            {tags.map((tag) => {
              const count = sessions.filter((session) => session.tag === tag).length;
              return (
                <li className="cfg-row" key={tag}>
                  <span className="cfg-name">{tag}</span>
                  <span className="cfg-meta">{count} 次</span>
                  <button
                    className="cfg-del"
                    type="button"
                    disabled={count > 0}
                    onClick={() => onRemove(tag)}
                  >
                    删除
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
