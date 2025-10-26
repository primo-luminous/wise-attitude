/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    unoptimized: true,
  },
  
  // webpack: (config: any, { isServer }: { isServer: boolean }) => {
  //   if (!isServer) {
  //     // polyfill core modules ที่ exceljs ใช้
  //     config.resolve.fallback = {
  //       fs: false,
  //       net: false,
  //       tls: false,
  //       crypto: require.resolve('crypto-browserify'),
  //       stream: require.resolve('stream-browserify'),
  //       url: require.resolve('url'),
  //       zlib: require.resolve('browserify-zlib'),
  //       http: require.resolve('stream-http'),
  //       https: require.resolve('https-browserify'),
  //       assert: require.resolve('assert'),
  //       os: require.resolve('os-browserify'),
  //       path: require.resolve('path-browserify'),
  //       buffer: require.resolve('buffer'),
  //       process: require.resolve('process/browser'),
  //     };
  //   }
  //   return config;
  // },
};

export default nextConfig;
