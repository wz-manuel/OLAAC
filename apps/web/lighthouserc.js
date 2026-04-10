/** @type {import('@lhci/utils/src/types').LHCIConfig} */
module.exports = {
  ci: {
    collect: {
      // Rutas críticas a auditar en cada CI run
      url: [
        'http://localhost:3000',
        'http://localhost:3000/tickets',
        'http://localhost:3000/diagnosticos',
      ],
      startServerCommand: 'pnpm start',
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Umbrales mínimos OLAAC — accesibilidad sin concesiones
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.90 }],
        // Reglas específicas de accesibilidad
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'listitem': 'error',
        'meta-viewport': 'error',
        'tabindex': 'error',
        'td-headers-attr': 'error',
        'valid-lang': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
