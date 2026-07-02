/**
 * Round score badge — accent-teal on dark surface. Per the system, teal
 * is the positive semantic; it's reserved for the score chip and the
 * "round won" inline tag.
 */
export function ScoreChip({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-chip px-3 h-7 bg-accent-teal/15 text-accent-teal  text-xs font-semibold tracking-[0.4px] no-select">
      <span className="size-1.5 rounded-pill bg-accent-teal" />
      {value} PTS
    </span>
  );
}
