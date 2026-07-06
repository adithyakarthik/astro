import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JK Vedansh Astro",
    short_name: "Vedansh Astro",
    description: "Vedic astrology practice management, plus Finds — geo-tag shops and items to buy later.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#d97706",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
