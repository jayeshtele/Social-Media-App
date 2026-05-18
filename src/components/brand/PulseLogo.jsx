export default function PulseLogo({ compact = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-ink-950 shadow-soft">
        <span className="grid h-7 w-7 place-items-center rounded-lg border-2 border-pulse-cyan bg-ink-850">
          <span className="relative h-[18px] w-[18px]">
            <span className="absolute inset-0 rounded-full bg-pulse-cyan" />
            <span className="absolute inset-1.5 rounded-full bg-ink-950" />
            <span className="absolute -left-1 top-1/2 h-0.5 w-6 -translate-y-1/2 rounded-full bg-pulse-amber" />
          </span>
        </span>
        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-ink-900 bg-pulse-rose" />
      </span>
      {!compact ? <span className="text-xl font-black tracking-normal text-white">Pulse</span> : null}
    </span>
  );
}
