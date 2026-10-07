export default function TourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-0">
      {children}
    </div>
  );
}
