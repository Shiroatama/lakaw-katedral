import { Btn } from "@/components/ui";

export default function OfflinePage() {
  return (
    <main className="view offline">
      <div className="learn-body" style={{ justifyContent: "center" }}>
        <h1 className="onboard-title">No internet</h1>
        <p className="onboard-line">
          The walk saves on your phone the first time you open it with signal.
          After that, it works with no internet. Giving to the parish needs
          internet.
        </p>
      </div>
      <div className="learn-dock">
        <Btn href="/">Go to the start</Btn>
      </div>
    </main>
  );
}
