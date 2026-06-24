/* Official Overclock Accelerator horizontal lockup (white, transparent bg). */
export function Wordmark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/overclock-wordmark.png" alt="Overclock Accelerator" className={className} />
  );
}

/** Deck-style top bar: wordmark + optional title, dotted strip, divider. */
export function HeaderBar({
  title,
  right,
}: {
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <div className="dot-grid">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wordmark className="h-6 w-auto" />
            {title ? (
              <span className="text-sm text-mute font-medium border-l border-line pl-3">
                {title}
              </span>
            ) : null}
          </div>
          {right}
        </div>
      </div>
    </div>
  );
}
