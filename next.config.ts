import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark Node.js-only packages so they are not bundled for the edge runtime.
  // @react-pdf/renderer uses yoga-layout (native bindings); nodemailer uses net/tls.
  serverExternalPackages: [
    "@react-pdf/renderer",
    "nodemailer",
    "canvas",
  ],

  // Limits Next's jest-worker child-process pool to 1. On memory-constrained
  // machines the default multi-process pool intermittently fails to spawn,
  // surfacing as "Jest worker encountered N child process exceptions".
  experimental: {
    cpus: 1,
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "srivedagayatritemple.org" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
