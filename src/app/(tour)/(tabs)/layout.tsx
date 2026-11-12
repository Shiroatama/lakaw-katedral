import { TabBar } from "@/components/tab-bar";

/** Walk, Parish, and Profile share the tab bar. No other route does. */
export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="view">{children}</main>
      <TabBar />
    </>
  );
}
