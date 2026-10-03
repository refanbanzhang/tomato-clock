interface TagPickProps {
  tags: string[];
  current?: string;
  locked?: string;
  onSelect: (tag: string) => void;
  onConfig: () => void;
}

export default function TagPick({ tags, current, locked, onSelect, onConfig }: TagPickProps) {
  if (locked) return <p className="tag-now">{locked}</p>;
  if (tags.length === 0) {
    return (
      <button className="link" type="button" onClick={onConfig}>
        去配置里添加标签
      </button>
    );
  }
  return (
    <select
      className="pick"
      aria-label="标签"
      value={current ?? ""}
      onChange={(event) => {
        if (event.target.value) onSelect(event.target.value);
      }}
    >
      {!current && <option value="">选择标签</option>}
      {tags.map((tag) => (
        <option key={tag} value={tag}>
          {tag}
        </option>
      ))}
    </select>
  );
}
