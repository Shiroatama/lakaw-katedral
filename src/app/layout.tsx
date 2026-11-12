import type { Metadata, Viewport } from "next";
import { EB_Garamond, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { JourneyHydrator } from "@/components/journey-hydrator";
import { PwaProvider } from "@/components/pwa-provider";
import { WalkIntroHost } from "@/components/walk-intro";
import "./globals.css";
import "./walk.css";

/** Story voice: titles and reveals. */
const display = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

/** Story body: prose under the media. */
const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

/** Shell and UI chrome: tabs, buttons, chips, forms. */
const ui = Source_Sans_3({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const APP_NAME = "Lakaw Katedral";
const APP_DESCRIPTION =
  "A walk through Naga Metropolitan Cathedral.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#b85c38",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${ui.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[var(--background)] text-[var(--foreground)]">
        <WalkIntroHost>
          <PwaProvider>
            <JourneyHydrator>{children}</JourneyHydrator>
          </PwaProvider>
        </WalkIntroHost>
      </body>
    </html>
  );
}
