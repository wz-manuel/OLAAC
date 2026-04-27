import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Checks de accesibilidad automática con axe-core.
// Nivel objetivo: WCAG 2.1 A + AA.
// localePrefix: 'as-needed' → español sin prefijo, inglés en /en/, portugués en /pt/

async function checkA11y(page: Page, url: string) {
  await page.goto(url)
  await page.waitForSelector('main, [role="main"], h1', { timeout: 10_000 })
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('#__next-build-watcher')
    .analyze()
  if (results.violations.length) {
    const summary = results.violations
      .map(v => `[${v.id}] ${v.description} — ${v.nodes.length} nodo(s)`)
      .join('\n')
    test.info().annotations.push({ type: 'axe-violations', description: summary })
  }
  expect(results.violations).toHaveLength(0)
}

test.describe('Accesibilidad WCAG 2.1 A+AA', () => {
  test('Homepage /', async ({ page }) => {
    await checkA11y(page, '/')
  })

  test('Scores /scores', async ({ page }) => {
    await checkA11y(page, '/scores')
  })

  test('Cobertura /cobertura', async ({ page }) => {
    await checkA11y(page, '/cobertura')
  })

  test('Marco legal /marco-legal', async ({ page }) => {
    await checkA11y(page, '/marco-legal')
  })

  test('Login /login', async ({ page }) => {
    await checkA11y(page, '/login')
  })

  test('Registro /registro', async ({ page }) => {
    await checkA11y(page, '/registro')
  })

  test('Distintivo /distintivo', async ({ page }) => {
    await checkA11y(page, '/distintivo')
  })

  test('Datos abiertos /datos-abiertos', async ({ page }) => {
    await checkA11y(page, '/datos-abiertos')
  })

  test('Sobre el observatorio /sobre-el-observatorio', async ({ page }) => {
    await checkA11y(page, '/sobre-el-observatorio')
  })
})
