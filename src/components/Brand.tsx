interface LogoProps {
  className?: string;
}

/** Overclock Accelerator mark (official logo asset, white-on-black). */
export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/overclock-logo.png"
      alt="Overclock Accelerator"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      <Logo className="w-10 h-10" />
      <div className="leading-none">
        <div className="text-[15px] font-semibold tracking-tight text-white">
          Overclock
        </div>
        <div className="text-[10px] tracking-[0.2em] uppercase text-mute -mt-0.5">
          accelerator
        </div>
      </div>
    </div>
  );
}

/** Deck-style top bar: dotted strip, teal lead-in word + white title, divider. */
export function HeaderBar({
  lead,
  title,
  right,
}: {
  lead: string;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <div className="dot-grid">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-9 h-9" />
            <h1 className="text-[15px] sm:text-base font-semibold tracking-tight">
              <span className="text-teal">{lead}</span>
              {title ? <span className="text-white"> {title}</span> : null}
            </h1>
          </div>
          {right}
        </div>
      </div>
    </div>
  );
}
