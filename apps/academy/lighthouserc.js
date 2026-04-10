/** @type {import('@lhci/utils/src/types').LHCIConfig} */
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3001',
        'http://localhost:3001/cursos',
        'http://localhost:3001/lecciones',
      ],
      startServerCommand: 'pnpm start',
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'video-caption': 'error', // Crítico para contenido educativo en video
        'meta-viewport': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
