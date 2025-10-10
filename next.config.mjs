/** @type {import('next').NextConfig} */
const nextConfig = {
 serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'puppeteer': 'puppeteer',
        'puppeteer-core': 'puppeteer-core',
        '@sparticuz/chromium': '@sparticuz/chromium'
      })
    }
    return config
  }
};

export default nextConfig;
