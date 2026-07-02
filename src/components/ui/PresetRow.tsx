type Preset = {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
};

function PresetRow({ active, title, desc, onClick }: Preset) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "w-full text-left rounded-card p-3 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        active ? "bg-brand text-ink" : "bg-canvas hairline text-ink",
      ].join(" ")}
    >
      <span className="text-body font-semibold block">{title}</span>
      <span
        className={[
          "text-label block",
          active ? "text-ink/70" : "text-ink-mute",
        ].join(" ")}
      >
        {desc}
      </span>
    </button>
  );
}

export default PresetRow;
