import type { NextConfig } from "next";

export default {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "**.githubassets.com", protocol: "https" },
      { hostname: "**.githubusercontent.com", protocol: "https" },
      { hostname: "**.googleusercontent.com", protocol: "https" },
      { hostname: "**.ufs.sh", protocol: "https" },
      { hostname: "**.unsplash.com", protocol: "https" },
      { hostname: "unsplash.com", protocol: "https" },
      { hostname: "api.github.com", protocol: "https" },
      { hostname: "utfs.io", protocol: "https" },
      { hostname: "example.com", protocol: "https" },
      { hostname: "localhost", protocol: "http", port: "9000" },
      { hostname: "127.0.0.1", protocol: "http", port: "9000" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://localhost:9000/uploads/:path*",
      },
      {
        source: "/photos/:path*",
        destination: "http://localhost:9000/photos/:path*",
      },
    ];
  },
} satisfies NextConfig;
