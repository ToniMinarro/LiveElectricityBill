import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Live Electricity Bill",
    short_name: "Electricity Bill",
    description: "Demo de Minarrolabs para estimar una factura eléctrica con autoconsumo.",
    start_url: "/",
    display: "standalone",
    background_color: "#090c14",
    theme_color: "#090c14",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
