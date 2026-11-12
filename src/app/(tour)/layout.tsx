/** One phone-sized column. Every screen inside is a `.view` (see walk.css). */
export default function TourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="app-frame">{children}</div>;
}
