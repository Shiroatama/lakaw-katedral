import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lakaw Katedral",
    short_name: "Lakaw",
    description: "A walk through Naga Metropolitan Cathedral.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4eee4",
    theme_color: "#b85c38",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
