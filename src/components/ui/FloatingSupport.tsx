/**
 * Unobtrusive floating support links. External, new-tab, no referrer leak.
 * Rendered only on Home (see App.tsx) so it never overlaps in-game controls.
 */
const LINKS = [
  { href: "https://cafecito.app/mattezekiel", label: "Cafecito" },
  { href: "https://github.com/sponsors/mattezekiel", label: "Sponsors" },
];

export function FloatingSupport() {
  return (
    <div
      className="fixed right-3 flex flex-col items-end gap-2 z-40"
      style={{ bottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          className="rounded-pill hairline bg-surface-card/80 backdrop-blur px-3 py-2 text-[13px] font-semibold text-ink-mute hover:text-ink transition-colors no-select"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
