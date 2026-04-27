import { expect, test } from '@playwright/test'

// Smoke tests: las páginas públicas cargan sin error y tienen el h1 correcto.
// localePrefix: 'as-needed' → español sin prefijo, inglés en /en/, portugués en /pt/

test.describe('Páginas públicas', () => {
  test('homepage / carga correctamente', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page).toHaveTitle(/OLAAC/i)
  })

  test('/scores — carga y tiene tabla de sitios', async ({ page }) => {
    await page.goto('/scores')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('table, [role="table"]').first()).toBeVisible()
  })

  test('/cobertura — carga con estadísticas', async ({ page }) => {
    await page.goto('/cobertura')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('/marco-legal — carga correctamente', async ({ page }) => {
    await page.goto('/marco-legal')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('/datos-abiertos — carga correctamente', async ({ page }) => {
    await page.goto('/datos-abiertos')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('/sobre-el-observatorio — carga correctamente', async ({ page }) => {
    await page.goto('/sobre-el-observatorio')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('/distintivo — landing page carga correctamente', async ({ page }) => {
    await page.goto('/distintivo')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('/donativos — carga correctamente', async ({ page }) => {
    await page.goto('/donativos')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('inglés /en/ — homepage carga correctamente', async ({ page }) => {
    await page.goto('/en/')
    await expect(page).toHaveURL(/\/en\/?$/)
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('inglés /en/scores — carga correctamente', async ({ page }) => {
    await page.goto('/en/scores')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('portugués /pt/ — homepage carga correctamente', async ({ page }) => {
    await page.goto('/pt/')
    await expect(page).toHaveURL(/\/pt\/?$/)
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
