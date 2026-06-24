interface LogoProps {
  className?: string;
}

/** Overclock Accelerator mark — a ring with an inset crescent. */
export function Logo({ className = "w-8 h-8 text-white" }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <mask id="oc-crescent">
          <rect width="32" height="32" fill="white" />
          <circle cx="20.5" cy="12.5" r="9.5" fill="black" />
        </mask>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <circle
        cx="14.5"
        cy="17"
        r="8.5"
        fill="currentColor"
        mask="url(#oc-crescent)"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <Logo className="w-7 h-7 text-white" />
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
          <div className="flex items-center gap-3">
            <Logo className="w-6 h-6 text-white" />
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
