const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || process.env.NUXT_SITE_URL || 'https://tailz.dev').replace(/\/+$/, '')

export default defineNuxtConfig({
  compatibilityDate: '2026-09-14',

  app: {
    head: {
      htmlAttrs: { lang: 'en-AU' },
      title: 'tailz.dev',
      titleTemplate: '%s · tailz.dev',
      meta: [
        { name: 'theme-color', content: '#0b120c' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'description', content: 'Turbotailz — open source websites and interfaces. LuckPerms, Syscraft, and more.' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  vite: {
    assetsInclude: ['**/*.yml', '**/*.yaml']
  },

  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || '',
    githubLogin: 'Turbotailz',
    public: {
      siteUrl
    }
  },

  routeRules: {
    '/api/github': { prerender: true }
  },

  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/projects',
        '/projects/luckperms',
        '/projects/syscraft',
        '/projects/morpheus',
        '/projects/athena',
        '/uses',
        '/github',
        '/whoami',
        '/api/github'
      ]
    },
    cloudflare: {
      nodeCompat: true
    }
  }
})
