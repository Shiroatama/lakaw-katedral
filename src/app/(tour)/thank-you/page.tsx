import { PageTransition } from "@/components/page-transition";
import { PrimaryButton } from "@/components/ui";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export default function ThankYouPage() {
  return (
    <PageTransition>
      <main className="flex flex-1 flex-col justify-center gap-8 py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5">
          <div
            className="gold-rule h-px w-full max-w-[12rem] bg-[var(--ceremonial)]/70"
            aria-hidden
          />
          <div className="space-y-3">
            <h1
              className="fade-up font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--foreground)]"
              style={delay(300)}
            >
              Thank you
            </h1>
            <p
              className="fade-up text-base leading-relaxed text-[var(--muted-fg)]"
              style={delay(500)}
            >
              Your gift helps care for Naga Metropolitan Cathedral. Thank you
              for helping the parish.
            </p>
          </div>
        </div>
        <div className="fade-up flex flex-col gap-3" style={delay(750)}>
          <PrimaryButton href="/" direction="back">
            Home
          </PrimaryButton>
        </div>
      </main>
    </PageTransition>
  );
}
