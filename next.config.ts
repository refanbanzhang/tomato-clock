import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isProd && {
    basePath: "/tomato-clock",
    output: "export",
    trailingSlash: true,
  }),
};

export default nextConfig;
