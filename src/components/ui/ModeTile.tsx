type ModeTile = {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
};

function ModeTile({ active, title, desc, onClick }: ModeTile) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "text-left rounded-card p-4 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        active ? "bg-ink text-canvas" : "bg-surface-card hairline text-ink",
      ].join(" ")}
    >
      <span className="display text-display-sm block">{title}</span>
      <span
        className={[
          "text-label mt-1 block leading-snug",
          active ? "text-canvas/70" : "text-ink-mute",
        ].join(" ")}
      >
        {desc}
      </span>
    </button>
  );
}

export default ModeTile;
