/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    externalResolver: true,
    responseLimit: false,
  },
  serverRuntimeConfig: {
    // API 타임아웃 확장 설정
    apiTimeout: 120000, // 120초
  },
}

module.exports = nextConfig 