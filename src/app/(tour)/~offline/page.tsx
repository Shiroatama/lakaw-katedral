import { PrimaryButton } from "@/components/ui";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-6 py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
      <h1 className="fade-up font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
        No internet
      </h1>
      <p
        className="fade-up mx-auto max-w-sm text-base leading-relaxed text-[var(--muted-fg)]"
        style={delay(150)}
      >
        The walk saves on your phone the first time you open it with signal.
        After that, it works with no internet. Giving to the parish needs
        internet.
      </p>
      <div className="fade-up" style={delay(300)}>
        <PrimaryButton href="/" direction="back">
          Go to the start
        </PrimaryButton>
      </div>
    </main>
  );
}
